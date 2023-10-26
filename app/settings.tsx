import { StyleSheet } from 'react-native';
import { Stack, useNavigation } from 'expo-router';

import { Text, View } from '../components/Themed';
import Separator from '../components/Separator';
import { useEffect } from 'react';

export default function SettingsScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({title: 'Réglages' });
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Separator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    margin: 20,
    fontSize: 16,
  },
});
