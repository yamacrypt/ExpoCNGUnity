import {
  ConfigPlugin,
  withAppBuildGradle,
  withSettingsGradle,
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
  withInfoPlist,
  withAppDelegate
} from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';

export type UnityIntegrationProps = {
  android?: {
    unityProjectPath?: string;
  };
  ios?: {
    unityProjectPath?: string;
  };
};

type AppDelegateModification = {
  path: string;
  contents: string;
};

const ensureInclude = (contents: string, include: string) => {
  if (contents.includes(include)) {
    return contents;
  }
  return `${contents}\n${include}\n`;
};

const withUnityAndroid: ConfigPlugin<UnityIntegrationProps> = (config, props = {}) => {
  const unityProjectPath = props.android?.unityProjectPath ?? '../UnityExport/unityLibrary';

  config = withSettingsGradle(config, (cfg) => {
    const includeStatement = "include(':unityLibrary')";
    const projectDirStatement = `project(':unityLibrary').projectDir = file('${unityProjectPath}')`;
    let contents = cfg.modResults.contents;
    if (!contents.includes(includeStatement)) {
      contents = ensureInclude(contents, includeStatement);
    }
    if (!contents.includes(projectDirStatement)) {
      contents = ensureInclude(contents, projectDirStatement);
    }
    cfg.modResults.contents = contents;
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    const implementationLine = "    implementation project(':unityLibrary')";
    const pattern = /dependencies\s*\{/;
    if (pattern.test(cfg.modResults.contents) && !cfg.modResults.contents.includes(implementationLine.trim())) {
      cfg.modResults.contents = cfg.modResults.contents.replace(pattern, (match) => `${match}\n${implementationLine}`);
    }
    return cfg;
  });

  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const settingsGradlePath = path.join(cfg.modRequest.platformProjectRoot, 'settings.gradle');
      if (fs.existsSync(settingsGradlePath)) {
        let contents = fs.readFileSync(settingsGradlePath, 'utf-8');
        const includeStatement = "include(':unityLibrary')";
        const projectDirStatement = `project(':unityLibrary').projectDir = file('${unityProjectPath}')`;
        if (!contents.includes(includeStatement)) {
          contents = ensureInclude(contents, includeStatement);
        }
        if (!contents.includes(projectDirStatement)) {
          contents = ensureInclude(contents, projectDirStatement);
        }
        fs.writeFileSync(settingsGradlePath, contents);
      }

      const appGradlePath = path.join(cfg.modRequest.platformProjectRoot, 'app', 'build.gradle');
      if (fs.existsSync(appGradlePath)) {
        let contents = fs.readFileSync(appGradlePath, 'utf-8');
        const implementationLine = "implementation project(':unityLibrary')";
        if (!contents.includes(implementationLine)) {
          contents = contents.replace(/dependencies\s*\{/, (match) => `${match}\n    ${implementationLine}`);
        }
        fs.writeFileSync(appGradlePath, contents);
      }
      return cfg;
    }
  ]);

  return config;
};

const withUnityIOS: ConfigPlugin<UnityIntegrationProps> = (config, props = {}) => {
  const unityProjectPath = props.ios?.unityProjectPath ?? '../UnityExport/Unity-iPhone.xcodeproj';

  config = withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const projectName = IOSConfig.XcodeUtils.getProjectName(cfg);
    const unityGroupName = 'Unity';
    const mainGroupId = project.getFirstProject().firstProject.mainGroup;
    IOSConfig.XcodeUtils.ensureGroupRecursively(project, unityGroupName, mainGroupId);

    const filePath = unityProjectPath;
    const file = project.pbxFileReferenceSection();
    const hasUnity = Object.values(file).some((entry: any) => entry?.path === filePath);

    if (!hasUnity) {
      IOSConfig.XcodeUtils.addFileToGroup({
        project,
        filePath,
        groupName: unityGroupName
      });
    }

    const target = IOSConfig.XcodeUtils.getApplicationNativeTarget({ project, projectName });
    const copyFilesPhase = project.pbxCopyFilesBuildPhaseSection();
    const hasEmbedPhase = Object.values(copyFilesPhase).some(
      (phase: any) => typeof phase === 'object' && phase?.name === '"Embed UnityFramework"'
    );

    if (!hasEmbedPhase) {
      IOSConfig.XcodeUtils.addBuildPhase({
        project,
        nativeTarget: target,
        buildPhase: 'PBXCopyFilesBuildPhase',
        props: {
          name: 'Embed UnityFramework',
          dstPath: '""',
          dstSubfolderSpec: 10
        }
      });
    }

    return cfg;
  });

  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UnityFramework = 'Integrated via Config Plugin';
    return cfg;
  });

  config = withAppDelegate(config, (cfg) => {
    const mod = cfg.modResults;
    const modification: AppDelegateModification = {
      path: mod.path,
      contents: mod.contents
    };

    if (!modification.contents.includes('#import "UnityUtils.h"')) {
      modification.contents = modification.contents.replace(
        '#import "AppDelegate.h"',
        '#import "AppDelegate.h"\n#import "UnityUtils.h"'
      );
    }

    const didFinishLaunching = 'didFinishLaunchingWithOptions:(NSDictionary *)launchOptions';
    if (modification.contents.includes(didFinishLaunching) && !modification.contents.includes('UnityInitRuntime')) {
      modification.contents = modification.contents.replace(
        /didFinishLaunchingWithOptions:[^\{]+\{/,
        (match) => `${match}\n  UnityInitRuntime(0, NULL);`
      );
    }

    cfg.modResults.contents = modification.contents;
    return cfg;
  });

  return config;
};

export const withUnityIntegration: ConfigPlugin<UnityIntegrationProps> = (config, props) => {
  config = withUnityAndroid(config, props);
  config = withUnityIOS(config, props);
  return config;
};

export default withUnityIntegration;
