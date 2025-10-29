const {
  withAppBuildGradle,
  withSettingsGradle,
  withDangerousMod
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const defaultUnityLibraryPath = '../UnityExport/unityLibrary';

const ensureInclude = (contents, include) => {
  if (contents.includes(include)) {
    return contents;
  }
  const trimmed = contents.endsWith('\n') ? contents : `${contents}\n`;
  return `${trimmed}${include}\n`;
};

const resolveUnityLibraryPath = (props = {}) => {
  if (typeof props === 'string') {
    return props;
  }

  if (props.unityLibraryPath) {
    return props.unityLibraryPath;
  }

  if (props.unityProjectPath) {
    return props.unityProjectPath;
  }

  if (props.androidUnityLibraryPath) {
    return props.androidUnityLibraryPath;
  }

  if (props.androidUnityProjectPath) {
    return props.androidUnityProjectPath;
  }

  if (props.android) {
    if (props.android.unityLibraryPath) {
      return props.android.unityLibraryPath;
    }

    if (props.android.unityProjectPath) {
      return props.android.unityProjectPath;
    }
  }

  return defaultUnityLibraryPath;
};

const withUnityAndroidProject = (config, props = {}) => {
  const unityLibraryPath = resolveUnityLibraryPath(props);

  config = withSettingsGradle(config, (cfg) => {
    const includeStatement = "include(':unityLibrary')";
    const projectDirStatement = `project(':unityLibrary').projectDir = file('${unityLibraryPath}')`;

    const original = cfg.modResults.contents;
    const updated = ensureInclude(
      ensureInclude(original, includeStatement),
      projectDirStatement
    );

    cfg.modResults.contents = updated;
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    const implementationLine = "    implementation project(':unityLibrary')";
    const pattern = /dependencies\s*\{/;

    if (pattern.test(cfg.modResults.contents) && !cfg.modResults.contents.includes(implementationLine.trim())) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        pattern,
        (match) => `${match}\n${implementationLine}`
      );
    }

    return cfg;
  });

  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const settingsGradlePath = path.join(cfg.modRequest.platformProjectRoot, 'settings.gradle');
      if (fs.existsSync(settingsGradlePath)) {
        const contents = fs.readFileSync(settingsGradlePath, 'utf-8');
        const updated = ensureInclude(
          ensureInclude(contents, "include(':unityLibrary')"),
          `project(':unityLibrary').projectDir = file('${unityLibraryPath}')`
        );

        if (updated !== contents) {
          fs.writeFileSync(settingsGradlePath, updated);
        }
      }

      const appGradlePath = path.join(cfg.modRequest.platformProjectRoot, 'app', 'build.gradle');
      if (fs.existsSync(appGradlePath)) {
        let contents = fs.readFileSync(appGradlePath, 'utf-8');
        const implementationLine = "implementation project(':unityLibrary')";
        if (!contents.includes(implementationLine)) {
          const updated = contents.replace(/dependencies\s*\{/, (match) => `${match}\n    ${implementationLine}`);
          fs.writeFileSync(appGradlePath, updated);
        }
      }

      return cfg;
    }
  ]);

  return config;
};

const plugin = (config, props) => withUnityAndroidProject(config, props);

module.exports = plugin;
module.exports.withUnityAndroidProject = withUnityAndroidProject;
module.exports.default = plugin;
