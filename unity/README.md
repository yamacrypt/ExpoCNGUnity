# Unity Workspace

This folder hosts the Unity project that exports the libraries consumed by the Expo application.

- **Android**: Generate a Unity as a Library export (commonly `UnityExport`) and place the resulting Gradle project under `../UnityExport/unityLibrary` so it can be picked up by the `expo-embed-android-unity-project` config plugin.
- **WebGL**: Export your WebGL build into `../web/public/unity/` so it can be served by the web workspace.
