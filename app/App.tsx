import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from '@/navigation/RootNavigator';

const App = () => (
  <>
    <StatusBar style="auto" />
    <RootNavigator />
  </>
);

export default App;
