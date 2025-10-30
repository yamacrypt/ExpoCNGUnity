const {
  withProjectBuildGradle,
  withAppBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const UNITY_LIBRARY_INCLUDE = "include ':unityLibrary'";
const UNITY_LIBRARY_PROJECT_DIR =
  "project(':unityLibrary').projectDir=new File('..\\\\unity\\\\builds\\\\android\\\\unityLibrary')";
const UNITY_LIBRARY_IMPLEMENTATION = "implementation project(':unityLibrary')";

function appendLine(contents, line) {
  if (contents.includes(line)) {
    return contents;
  }

  const needsTrailingNewline = !contents.endsWith('\n');
  const prefix = needsTrailingNewline && contents.length > 0 ? '\n' : '';
  return `${contents}${prefix}${line}\n`;
}

function ensureUnityLibraryInProjectGradle(contents) {
  let output = contents ?? '';
  output = appendLine(output, UNITY_LIBRARY_INCLUDE);
  output = appendLine(output, UNITY_LIBRARY_PROJECT_DIR);
  return output;
}

function ensureUnityLibraryInAppGradle(contents) {
  let output = contents ?? '';

  if (output.includes(UNITY_LIBRARY_IMPLEMENTATION)) {
    return output;
  }

  const dependenciesBlockPattern = /dependencies\s*\{/;
  if (dependenciesBlockPattern.test(output)) {
    output = output.replace(
      dependenciesBlockPattern,
      (match) => `${match}\n    ${UNITY_LIBRARY_IMPLEMENTATION}`
    );
  } else {
    const needsTrailingNewline = !output.endsWith('\n');
    const prefix = needsTrailingNewline && output.length > 0 ? '\n' : '';
    output = `${output}${prefix}dependencies {\n    ${UNITY_LIBRARY_IMPLEMENTATION}\n}\n`;
  }

  return output;
}

const withUnityLibrary = (config) => {
  config = withProjectBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents = ensureUnityLibraryInProjectGradle(
      modConfig.modResults.contents
    );
    return modConfig;
  });

  config = withAppBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents = ensureUnityLibraryInAppGradle(
      modConfig.modResults.contents
    );
    return modConfig;
  });

  return config;
};

module.exports = createRunOncePlugin(withUnityLibrary, 'with-unity-library', '1.0.0');
