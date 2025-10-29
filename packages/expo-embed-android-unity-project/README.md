# expo-embed-android-unity-project (workspace)

Config plugin that links a Unity `unityLibrary` Gradle export into the Expo prebuild output.

## Usage

```ts
// app/app.config.ts
plugins: [
  [
    'expo-embed-android-unity-project',
    {
      unityLibraryPath: '../UnityExport/unityLibrary'
    }
  ]
];
```

The `unityLibraryPath` option accepts any relative path. Alternative option names such as `unityProjectPath`,
`androidUnityLibraryPath`, and `android.unityProjectPath` are also supported for convenience.
