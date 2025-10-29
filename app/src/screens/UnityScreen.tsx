import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { unityBridge } from '@/bridge';

const UnityScreen: React.FC = () => {
  const [messageCount, setMessageCount] = useState(0);

  const handleSendMessage = () => {
    const next = messageCount + 1;
    unityBridge.postMessage('GameManager', 'OnMessageFromJS', JSON.stringify({ ping: next }));
    setMessageCount(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unity プレースホルダー</Text>
      <Text style={styles.description}>
        ネイティブ UnityView の代わりにシンプルなプレースホルダーを表示しています。Unity ビルドが
        追加されるとこの画面に埋め込まれます。
      </Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Unity content placeholder</Text>
      </View>
      <Button title="Unity へメッセージ" onPress={handleSendMessage} />
      <Text style={styles.counter}>送信回数: {messageCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '600'
  },
  description: {
    fontSize: 16,
    lineHeight: 24
  },
  placeholder: {
    flex: 1,
    minHeight: 240,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 18
  },
  counter: {
    fontSize: 16,
    fontWeight: '500'
  }
});

export default UnityScreen;
