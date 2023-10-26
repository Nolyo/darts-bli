import { StyleSheet } from 'react-native';

import { Text, View } from '../../components/Themed';

export default function NewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvelle partie</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
