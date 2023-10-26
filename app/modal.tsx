import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import Separator from '../components/Separator';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>A propos</Text>
      <Separator />

      <Text style={styles.text}>
        Cette application est un projet personnel de développement d'une application mobile en React Native.
      </Text>
      <Text style={styles.text}>
        Version actuelle : 0.0.1
      </Text>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
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
