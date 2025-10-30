const {
  withSettingsGradle,
  withAppBuildGradle,
  createRunOncePlugin,
} = require('expo/config-plugins');

const INCLUDE_LINE = "include ':unityLibrary'";
const PROJECT_LINE =
  "project(':unityLibrary').projectDir=new File('..\\\\unity\\\\builds\\\\android\\\\unityLibrary')";
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

  return config;
};

module.exports = createRunOncePlugin(
  withUnityLibrary,
  'expo-cng-with-unity-library',
  '1.0.0',
);
