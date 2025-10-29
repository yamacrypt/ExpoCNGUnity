import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { unityBridge } from '@/bridge';
import { formatBuildInfo } from '@expocngunity/common';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleOpenUnity = () => {
    unityBridge.show();
    navigation.navigate('Unity');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Expo CNG + Unity</Text>
      <Text style={styles.description}>
        このサンプルは Expo CNG プロジェクト内で Unity as a Library を統合するための足場を提供します。
        下のボタンを押すと UnityBridge.show() が呼び出され、Unity プレースホルダー画面へ遷移します。
      </Text>
      <Button title="Unity を開く" onPress={handleOpenUnity} />
      <View style={styles.meta}>
        <Text style={styles.metaLabel}>Bridge 状態</Text>
        <Text>{formatBuildInfo(unityBridge.platform)}</Text>
        <Text>Native module attached: {unityBridge.isNativeAvailable ? 'Yes' : 'No'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  meta: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    gap: 8
  },
  metaLabel: {
    fontWeight: '600'
  }
});

export default HomeScreen;
