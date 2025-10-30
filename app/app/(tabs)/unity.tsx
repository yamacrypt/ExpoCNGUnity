import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { UnityView } from '@/components/unity-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { sendMessage } from '@/unity';

export default function UnityScreen() {
  const [count, setCount] = useState(0);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Unity Scene Preview
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        {Platform.OS === 'android'
          ? 'The Unity runtime is embedded below. Tap the button to send a message to Unity.'
          : 'Run this screen on Android to see the Unity player embedded with Expo.'}
      </ThemedText>
      <View style={styles.playerContainer}>
        <UnityView style={styles.player} />
      </View>
      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={() => {
          const next = count + 1;
          setCount(next);
          if (Platform.OS === 'android') {
            try {
              sendMessage('ReactBridge', 'HandleMessage', String(next));
            } catch (error) {
              console.warn('Failed to send message to Unity', error);
            }
          }
        }}>
        <ThemedText style={styles.ctaLabel}>Send message ({count})</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  playerContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
  },
  player: {
    flex: 1,
  },
  cta: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.7,
  },
  ctaLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
