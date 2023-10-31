import {  Tabs } from 'expo-router';
import {  useColorScheme } from 'react-native';

import Colors from '../../constants/Colors';
import {TabBarIcon} from "../(tabs)/_layout";

export default function TabGameLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen name="new" options={{
            tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
        }}
      />
      <Tabs.Screen name="find" options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
        <Tabs.Screen name="[id]" options={{
            href: null
        }}
      />
    </Tabs>
  );
}
