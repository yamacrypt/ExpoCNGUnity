import * as React from 'react';
import { Platform, Text, View, ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';

export type NativeUnityViewProps = ViewProps & {
  /** Pause the Unity player when true. */
  paused?: boolean;
};

const NativeUnityView: React.ComponentType<NativeUnityViewProps> =
  Platform.OS === 'android'
    ? requireNativeViewManager<NativeUnityViewProps>('UnityView')
    : View;

export type UnityViewProps = NativeUnityViewProps & {
  /**
   * Optional placeholder text to render on platforms where Unity isn't available.
   * Defaults to a generic message.
   */
  unavailableText?: string;
};

type UnityViewHandle = React.ElementRef<typeof View>;

export const UnityView = React.forwardRef<UnityViewHandle, UnityViewProps>(
  ({ unavailableText = 'Unity rendering is only available on Android.', paused, style, ...rest }, ref) => {
    if (Platform.OS !== 'android') {
      return React.createElement(
        View,
        { ref, style, ...rest },
        React.createElement(Text, null, unavailableText),
      );
    }

    return React.createElement(NativeUnityView, {
      ref: ref as never,
      style,
      paused,
      ...rest,
    });
  },
);

UnityView.displayName = 'UnityView';

export default UnityView;
