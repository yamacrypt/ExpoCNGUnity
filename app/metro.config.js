const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-reanimated/scripts/reanimated-transformer')
};

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'cjs');
config.resolver.sourceExts.push('cjs');

config.watchFolders = [path.resolve(__dirname, '..', 'packages')];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '..', 'node_modules')
];

module.exports = config;
