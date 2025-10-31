import { useCallback, useMemo } from "react";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Unity, useUnityContext } from "react-unity-webgl";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },
  header: {
    width: "100%",
    maxWidth: 960,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#cbd5f5",
  },
  player: {
    width: "100%",
    maxWidth: 960,
    alignItems: "center",
  },
  unityWrapper: {
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#facc15",
  },
});

export default function App() {
  const unityConfig = useMemo(
    () => ({
      loaderUrl: "/unity/Build/Web.loader.js",
      dataUrl: "/unity/Build/Web.data",
      frameworkUrl: "/unity/Build/Web.framework.js",
      codeUrl: "/unity/Build/Web.wasm",
    }),
    []
  );

  const { unityProvider, isLoaded, loadingProgression, requestFullscreen } =
    useUnityContext(unityConfig);

  const handleFullScreen = useCallback(() => {
    requestFullscreen(true).catch((error) => {
      console.error("Failed to enter fullscreen", error);
    });
  }, [requestFullscreen]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Unity シーンプレビュー</Text>
        <Text style={styles.description}>
          ExpoCNGUnity の Web プロジェクトです。下のプレイヤーで Unity の WebGL
          ビルドをプレビューできます。
        </Text>
      </View>
      <View style={styles.player}>
        <View style={styles.unityWrapper}>
          <Unity
            unityProvider={unityProvider}
            style={{
              width: "100%",
              aspectRatio: 16 / 10,
            }}
          />
        </View>
        {!isLoaded ? (
          <Text style={styles.loadingText}>
            読み込み中... {Math.round(loadingProgression * 100)}%
          </Text>
        ) : (
          <Button title="フルスクリーン" onPress={handleFullScreen} />
        )}
      </View>
    </SafeAreaView>
  );
}
