import 'dotenv/config';
import { ConfigContext, ExpoConfig } from '@expo/config';

const APP_NAME = 'Expo CNG Unity';
const SLUG = 'expo-cng-unity';
const VERSION = '0.1.0';
const BUNDLE_ID = 'com.example.expocngunity';
const PACKAGE_NAME = 'com.example.expocngunity';

const createConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: SLUG,
  version: VERSION,
  owner: config.owner,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'expocngunity',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: BUNDLE_ID,
    infoPlist: {
      UnityFramework: 'Configured via Config Plugin'
    }
  },
  android: {
    package: PACKAGE_NAME,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    }
  },
  web: {
    bundler: 'metro',
    favicon: './assets/icon.png'
  },
  plugins: [
    'expo-dev-client',
    [
      './plugins/withUnityIntegration',
      {
        android: {
          unityProjectPath: '../UnityExport/unityLibrary'
        },
        ios: {
          unityProjectPath: '../UnityExport/Unity-iPhone.xcodeproj'
        }
      }
    ]
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? ''
    }
  },
  updates: {
    url: process.env.EAS_UPDATE_URL ?? undefined
  }
});

export default createConfig;
