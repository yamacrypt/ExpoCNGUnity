import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-native$": "react-native-web",
      'react-native': 'react-native-web',
      "@": path.resolve(__dirname, "src")
    }
  },
  optimizeDeps: {
    include: ['react-native-web'],
  },
  define: {
    __DEV__: true,
    global: 'globalThis', // 依存が global を参照する場合の保険
  },
  server: {
    host: true,          // = 0.0.0.0
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost', // Windows/WSL でも安定
      clientPort: 5173,
    },
  },
});
