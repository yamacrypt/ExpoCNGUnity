const path = require('path');
const fs = require('fs');
const {
  withAppBuildGradle,
  withSettingsGradle,
  withMainApplication,
  withDangerousMod,
} = require('@expo/config-plugins');

function ensureInclude(contents) {
  const includeSnippet = "include ':unityLibrary'";
  const projectSnippet =
    "project(':unityLibrary').projectDir = new File(rootProject.projectDir, '../unity/build/Android/unityLibrary')";

  if (!contents.includes(includeSnippet)) {
    contents += `\n${includeSnippet}`;
  }
  if (!contents.includes(projectSnippet)) {
    contents += `\n${projectSnippet}`;
  }
  return contents;
}

function addUnityDependency(contents) {
  if (contents.includes("implementation project(':unityLibrary')")) {
    return contents;
  }

  return contents.replace(
    /dependencies\s*\{([\s\S]*?)\n\}/,
    (match, body) => {
      return match.replace(body, `${body}\n    implementation project(':unityLibrary')\n`);
    }
  );
}

function ensureImport(modResults, statement) {
  if (!modResults.contents.includes(statement)) {
    const importAnchor = modResults.contents.match(/import .*PackageList.*\n/);
    if (importAnchor) {
      const [line] = importAnchor;
      const suffix = modResults.language === 'java' ? ';\n' : '\n';
      modResults.contents = modResults.contents.replace(line, line + `${statement}${suffix}`);
    }
  }
}

function addUnityPackage(config, modResults) {
  const kotlinImport = `import ${config.android?.package}.unity.UnityReactPackage`;
  const javaImport = `${kotlinImport}`;
  ensureImport(modResults, modResults.language === 'java' ? javaImport : kotlinImport);

  if (modResults.language === 'java') {
    if (!modResults.contents.includes('new UnityReactPackage()')) {
      modResults.contents = modResults.contents.replace(
        /(packages = new PackageList\(this\)\.getPackages\(\);\s*\n)/,
        `$1    packages.add(new ${config.android?.package}.unity.UnityReactPackage());\n`
      );
    }
  } else {
    if (!modResults.contents.includes('UnityReactPackage()')) {
      modResults.contents = modResults.contents.replace(
        /(return\s+PackageList\(this\)\.packages\.apply\s*\{\s*\n)/,
        `$1      add(${config.android?.package}.unity.UnityReactPackage());\n`
      );
    }
  }
  return modResults;
}

function ensureFile(file, content) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
  }
}

function androidSourceFiles(packageName) {
  const pkg = packageName.split('.').join('/');
  return {
    UnityPlayerHolder: {
      path: `android/app/src/main/java/${pkg}/unity/UnityPlayerHolder.java`,
      content: `package ${packageName}.unity;\n\nimport android.app.Activity;\nimport androidx.annotation.Nullable;\nimport com.unity3d.player.UnityPlayer;\n\npublic final class UnityPlayerHolder {\n  private static UnityPlayer unityPlayer;\n\n  private UnityPlayerHolder() {}\n\n  public static synchronized UnityPlayer get() {\n    return unityPlayer;\n  }\n\n  public static synchronized UnityPlayer getOrCreate(@Nullable Activity activity) {\n    if (unityPlayer == null && activity != null) {\n      unityPlayer = new UnityPlayer(activity);\n      UnityPlayer.currentActivity = activity;\n      unityPlayer.requestFocus();\n    } else if (activity != null) {\n      UnityPlayer.currentActivity = activity;\n    }\n    return unityPlayer;\n  }\n\n  public static synchronized void destroy() {\n    if (unityPlayer != null) {\n      unityPlayer.quit();\n      unityPlayer = null;\n    }\n  }\n}\n`,
    },
    UnityView: {
      path: `android/app/src/main/java/${pkg}/unity/UnityView.java`,
      content: `package ${packageName}.unity;\n\nimport android.app.Activity;\nimport android.view.ViewGroup;\nimport android.widget.FrameLayout;\n\nimport com.facebook.react.bridge.LifecycleEventListener;\nimport com.facebook.react.uimanager.ThemedReactContext;\nimport com.unity3d.player.UnityPlayer;\n\npublic class UnityView extends FrameLayout implements LifecycleEventListener {\n  private final ThemedReactContext reactContext;\n\n  public UnityView(ThemedReactContext context) {\n    super(context);\n    this.reactContext = context;\n    context.addLifecycleEventListener(this);\n    setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));\n    attachPlayer();\n  }\n\n  private void attachPlayer() {\n    Activity activity = reactContext.getCurrentActivity();\n    UnityPlayer player = UnityPlayerHolder.getOrCreate(activity);\n    if (player == null) {\n      return;\n    }\n    if (player.getParent() != null && player.getParent() != this) {\n      ((ViewGroup) player.getParent()).removeView(player);\n    }\n    removeAllViews();\n    addView(player, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));\n    player.windowFocusChanged(true);\n    player.resume();\n  }\n\n  @Override\n  protected void onAttachedToWindow() {\n    super.onAttachedToWindow();\n    UnityPlayer player = UnityPlayerHolder.get();\n    if (player != null) {\n      player.windowFocusChanged(true);\n      player.resume();\n    }\n  }\n\n  @Override\n  protected void onDetachedFromWindow() {\n    super.onDetachedFromWindow();\n    reactContext.removeLifecycleEventListener(this);\n    UnityPlayer player = UnityPlayerHolder.get();\n    if (player != null) {\n      player.windowFocusChanged(false);\n      player.pause();\n    }\n  }\n\n  @Override\n  public void onHostResume() {\n    UnityPlayer player = UnityPlayerHolder.get();\n    if (player != null) {\n      player.windowFocusChanged(true);\n      player.resume();\n    }\n  }\n\n  @Override\n  public void onHostPause() {\n    UnityPlayer player = UnityPlayerHolder.get();\n    if (player != null) {\n      player.windowFocusChanged(false);\n      player.pause();\n    }\n  }\n\n  @Override\n  public void onHostDestroy() {\n    UnityPlayerHolder.destroy();\n  }\n}\n`,
    },
    UnityViewManager: {
      path: `android/app/src/main/java/${pkg}/unity/UnityViewManager.java`,
      content: `package ${packageName}.unity;\n\nimport androidx.annotation.NonNull;\n\nimport com.facebook.react.uimanager.SimpleViewManager;\nimport com.facebook.react.uimanager.ThemedReactContext;\n\npublic class UnityViewManager extends SimpleViewManager<UnityView> {\n  public static final String REACT_CLASS = "UnityView";\n\n  @NonNull\n  @Override\n  public String getName() {\n    return REACT_CLASS;\n  }\n\n  @NonNull\n  @Override\n  protected UnityView createViewInstance(@NonNull ThemedReactContext themedReactContext) {\n    return new UnityView(themedReactContext);\n  }\n}\n`,
    },
    UnityModule: {
      path: `android/app/src/main/java/${pkg}/unity/UnityModule.java`,
      content: `package ${packageName}.unity;\n\nimport androidx.annotation.NonNull;\n\nimport com.facebook.react.bridge.ReactApplicationContext;\nimport com.facebook.react.bridge.ReactContextBaseJavaModule;\nimport com.facebook.react.bridge.ReactMethod;\nimport com.unity3d.player.UnityPlayer;\n\npublic class UnityModule extends ReactContextBaseJavaModule {\n  public UnityModule(ReactApplicationContext reactContext) {\n    super(reactContext);\n  }\n\n  @NonNull\n  @Override\n  public String getName() {\n    return "UnityModule";\n  }\n\n  @ReactMethod\n  public void postMessage(String gameObject, String method, String message) {\n    UnityPlayer player = UnityPlayerHolder.get();\n    if (player != null) {\n      UnityPlayer.UnitySendMessage(gameObject, method, message);\n    }\n  }\n}\n`,
    },
    UnityReactPackage: {
      path: `android/app/src/main/java/${pkg}/unity/UnityReactPackage.java`,
      content: `package ${packageName}.unity;\n\nimport androidx.annotation.NonNull;\n\nimport com.facebook.react.ReactPackage;\nimport com.facebook.react.bridge.NativeModule;\nimport com.facebook.react.bridge.ReactApplicationContext;\nimport com.facebook.react.uimanager.ViewManager;\n\nimport java.util.ArrayList;\nimport java.util.Collections;\nimport java.util.List;\n\npublic class UnityReactPackage implements ReactPackage {\n  @NonNull\n  @Override\n  public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {\n    List<NativeModule> modules = new ArrayList<>();\n    modules.add(new UnityModule(reactContext));\n    return modules;\n  }\n\n  @NonNull\n  @Override\n  public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {\n    return Collections.singletonList(new UnityViewManager());\n  }\n}\n`,
    },
  };
}

function withUnityAndroid(config) {
  if (!config.android || !config.android.package) {
    throw new Error('Android package must be defined to use the Unity plugin.');
  }

  config = withSettingsGradle(config, modConfig => {
    modConfig.modResults.contents = ensureInclude(modConfig.modResults.contents);
    return modConfig;
  });

  config = withAppBuildGradle(config, modConfig => {
    if (modConfig.modResults.language !== 'groovy') {
      return modConfig;
    }
    modConfig.modResults.contents = addUnityDependency(modConfig.modResults.contents);
    return modConfig;
  });

  config = withMainApplication(config, modConfig => {
    return addUnityPackage(config, modConfig);
  });

  config = withDangerousMod(config, ['android', async modConfig => {
    const files = androidSourceFiles(config.android.package);
    const projectRoot = modConfig.modRequest.projectRoot;
    for (const file of Object.values(files)) {
      const target = path.join(projectRoot, file.path);
      ensureFile(target, file.content);
    }
    return modConfig;
  }]);

  return config;
}

module.exports = withUnityAndroid;
