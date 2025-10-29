import { formatBuildInfo } from '@expocngunity/common';
import React, { useMemo, useState } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';

import './App.css';

const UNITY_BUILD_NAME = 'Build';

const App: React.FC = () => {
  const [shouldRender, setShouldRender] = useState(false);
  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: `unity/${UNITY_BUILD_NAME}.loader.js`,
    dataUrl: `unity/${UNITY_BUILD_NAME}.data`,
    frameworkUrl: `unity/${UNITY_BUILD_NAME}.framework.js`,
    codeUrl: `unity/${UNITY_BUILD_NAME}.wasm`
  });

  const progress = useMemo(
    () => Math.round(loadingProgression * 100),
    [loadingProgression]
  );

  const handleStart = () => {
    setShouldRender(true);
  };

  return (
    <main className="container">
      <section className="panel">
        <h1>Unity WebGL Launcher</h1>
        <p>
          {formatBuildInfo('web')}
          <br />
          Unity WebGL ビルドは public/unity/ に配置してください。Start ボタン押下後に初期化されます。
        </p>
        <button onClick={handleStart} disabled={shouldRender}>
          Start
        </button>
        <p>Loading: {progress}%</p>
      </section>
      {shouldRender && (
        <section className="unity-wrapper">
          {!isLoaded && <div className="overlay">Loading Unity...</div>}
          <Unity unityProvider={unityProvider} style={{ width: '100%', height: '100%' }} />
        </section>
      )}
    </main>
  );
};

export default App;
