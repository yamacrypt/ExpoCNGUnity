import { NativeModules, Platform } from 'react-native';

type UnityBridgeNativeModule = {
  show?: () => void;
  postMessage?: (gameObject: string, method: string, payload?: string) => void;
};

const nativeBridge: UnityBridgeNativeModule | undefined =
  (NativeModules.UnityBridge as UnityBridgeNativeModule | undefined) ?? undefined;

class UnityBridge {
  show() {
    if (nativeBridge?.show) {
      nativeBridge.show();
      return;
    }

    console.info('[UnityBridge] show(): native bridge not available, fallback to navigation.');
  }

  postMessage(gameObject: string, method: string, payload?: string) {
    if (nativeBridge?.postMessage) {
      nativeBridge.postMessage(gameObject, method, payload);
      return;
    }

    console.info(
      `[UnityBridge] postMessage(): ${gameObject}.${method}(${payload ?? ''}) (bridge not attached)`
    );
  }

  get isNativeAvailable() {
    return Boolean(nativeBridge);
  }

  get platform() {
    return Platform.OS;
  }
}

export const unityBridge = new UnityBridge();

export default unityBridge;
