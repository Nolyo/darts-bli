import { StyleSheet } from 'react-native';

import { Text, View } from '../../components/Themed';
import Separator from '../../components/Separator';
import { Link } from 'expo-router';
import ButtonLink from '../../components/ButtonLink';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dart's Bli</Text>
      <Separator />
      <ButtonLink href='/game/new'>
        Nouvelle partie
      </ButtonLink>
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0ea5e9',
  }
});
