import React from 'react';
import { Platform, StyleSheet, Text, requireNativeComponent, type ViewProps } from 'react-native';

const NativeUnityView: React.ComponentType<ViewProps> | null =
  Platform.OS === 'android' ? requireNativeComponent<ViewProps>('UnityView') : null;

export type UnityViewProps = ViewProps;

export function UnityView(props: UnityViewProps) {
  if (!NativeUnityView) {
    return (
      <Text style={styles.placeholder}>
        Unity rendering is only supported on Android for this build.
      </Text>
    );
  }

  return <NativeUnityView {...props} />;
}

const styles = StyleSheet.create({
  placeholder: {
    textAlign: 'center',
    padding: 24,
    color: '#6b7280',
  },
});
