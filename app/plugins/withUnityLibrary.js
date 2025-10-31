const fs = require('fs');
const path = require('path');

const {
  withSettingsGradle,
  withAppBuildGradle,
  withAndroidManifest,
  withDangerousMod,
  createRunOncePlugin,
} = require('expo/config-plugins');

const INCLUDE_LINE = "include ':unityLibrary'";
const PROJECT_LINE =
  "project(':unityLibrary').projectDir=new File('..\\\\..\\\\unity\\\\builds\\\\android\\\\unityLibrary')";
const DEPENDENCY_LINE = "implementation project(':unityLibrary')";

function ensureLine(contents, line) {
  const trimmed = contents.trimEnd();
  if (trimmed.includes(line)) {
    return `${trimmed}\n`;
  }
  if (trimmed.length === 0) {
    return `${line}\n`;
  }
  return `${trimmed}\n${line}\n`;
}

const STREAMING_ASSETS_VALUE = '.unity3d';
const ENV_FILENAME = '.env';
const ENV_KEYS = {
  sdk: 'SDKDIR',
  ndk: 'NDKDIR',
};

let cachedEnv = null;

function parseEnv(contents) {
  const result = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const index = line.indexOf('=');
    if (index === -1) {
      continue;
    }
    const key = line.slice(0, index).trim();
    if (!key) {
      continue;
    }
    let value = line.slice(index + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function loadEnv(projectRoot) {
  if (cachedEnv) {
    return cachedEnv;
  }

  const envPath = path.join(projectRoot, ENV_FILENAME);
  try {
    const contents = fs.readFileSync(envPath, 'utf8');
    cachedEnv = parseEnv(contents);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    cachedEnv = {};
  }
  return cachedEnv;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureProperty(contents, key, value) {
  const pattern = new RegExp(`^${escapeRegExp(key)}\s*=.*$`, 'm');
  const next = `${key}=${value}`;
  if (pattern.test(contents)) {
    return contents.replace(pattern, next);
  }
  const trimmed = contents.trimEnd();
  const separator = trimmed.length === 0 ? '' : '\n';
  return `${trimmed}${separator}${next}\n`;
}

async function updatePropertiesFile(filePath, properties) {
  const definedEntries = Object.entries(properties).filter(
    ([, value]) => value != null,
  );
  if (definedEntries.length === 0) {
    return;
  }

  let contents = '';
  try {
    contents = await fs.promises.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  let updated = contents;
  for (const [key, value] of definedEntries) {
    updated = ensureProperty(updated, key, value);
  }

  if (updated !== contents) {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, updated, 'utf8');
  }
}

const withUnityLibrary = (config) => {
  config = withSettingsGradle(config, (modConfig) => {
    let contents = modConfig.modResults.contents || '';
    contents = ensureLine(contents, INCLUDE_LINE);
    contents = ensureLine(contents, PROJECT_LINE);
    modConfig.modResults.contents = contents;
    return modConfig;
  });

  config = withAppBuildGradle(config, (modConfig) => {
    const contents = modConfig.modResults.contents || '';
    if (!contents.includes(DEPENDENCY_LINE)) {
      const updated = contents.replace(
        /dependencies\s*\{/,
        (match) => `${match}\n    ${DEPENDENCY_LINE}`,
      );
      if (updated === contents) {
        const base = contents.trimEnd();
        const separator = base.length === 0 ? '' : '\n\n';
        modConfig.modResults.contents = `${base}${separator}dependencies {\n    ${DEPENDENCY_LINE}\n}\n`;
      } else {
        modConfig.modResults.contents = updated;
      }
    }
    return modConfig;
  });

  config = withAndroidManifest(config, (modConfig) => {
    const androidManifest = modConfig.modResults;
    const application = androidManifest.manifest?.application?.[0];
    if (application) {
      application.$ = application.$ || {};
      application.$['android:enableOnBackInvokedCallback'] = 'true';
    }
    return modConfig;
  });

  config = withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const env = loadEnv(projectRoot);
      const sdkDir = env[ENV_KEYS.sdk];
      const ndkDir = env[ENV_KEYS.ndk];
      const androidDir = path.join(projectRoot, 'android');

      if (!sdkDir) {
        console.warn(
          'withUnityLibrary: SDKDIR is not defined in app/.env; skipping local.properties update.',
        );
      } else {
        await updatePropertiesFile(path.join(androidDir, 'local.properties'), {
          'sdk.dir': sdkDir,
        });
      }

      if (!ndkDir) {
        console.warn(
          'withUnityLibrary: NDKDIR is not defined in app/.env; unity.androidNdkPath will not be written.',
        );
      }

      const gradlePropertiesPath = path.join(androidDir, 'gradle.properties');
      const gradleUpdates = {
        unityStreamingAssets: STREAMING_ASSETS_VALUE,
        'unity.androidSdkPath': sdkDir,
        'unity.androidNdkPath': ndkDir,
      };
      await updatePropertiesFile(gradlePropertiesPath, gradleUpdates);

      return modConfig;
    },
  ]);

  return config;
};

module.exports = createRunOncePlugin(
  withUnityLibrary,
  'expo-cng-with-unity-library',
  '1.0.0',
);
