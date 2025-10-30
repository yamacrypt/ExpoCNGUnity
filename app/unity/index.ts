import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `Unity native module is not linked. Make sure the Android build has been prebuilt with` +
  ` the Unity config plugin enabled.`;

const UnityModuleNative = NativeModules.UnityModule;

type UnityNativeModule = {
  postMessage(gameObject: string, method: string, message: string): void;
};

const UnityModule: UnityNativeModule =
  UnityModuleNative && Platform.OS === 'android'
    ? UnityModuleNative
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );

export function sendMessage(gameObject: string, method: string, message: string) {
  UnityModule.postMessage(gameObject, method, message);
}

export { UnityModule };
