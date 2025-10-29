import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import HomeScreen from '@/screens/HomeScreen';
import UnityScreen from '@/screens/UnityScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Expo + Unity' }} />
      <Stack.Screen name="Unity" component={UnityScreen} options={{ title: 'Unity Preview' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
