import { SafeAreaView, StyleSheet, TextInput  } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown'
import AsyncStorage from '@react-native-async-storage/async-storage';


import { Container, Text, Title, View } from '../../components/Themed';
import { useEffect, useId, useState } from 'react';
import { useNavigation } from 'expo-router';
import Game from '../../entities/game';
import { PlayerType } from '../../types';
import Player from '../../entities/player';



export default function NewScreen() {
  const id = useId();
  const navigation = useNavigation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [game] = useState<Game>(new Game(id));

  useEffect(() => {
    navigation.setOptions({
      title: 'Nouvelle game',
      headerRight: () => (
        <Text onPress={submit} style={{ color: '#fff', marginRight: 20 }}>Commencer</Text>
      ),
    });
  }, [navigation]);

  const submit = async () => {
    game.save();
  }

  const addPlayer = () => {
    const newPlayer = new Player(game.getNextPlayerId());
    game.addPlayer(newPlayer);

    refreshPlayers();
  }

  const refreshPlayers = () => {
    setPlayers(() => [...game.getPlayers()]); 
  }

  const updateUser = (player: Player, name: string) => {
    player.setName(name);
    refreshPlayers()
  };


  return (
    <Container style={{ justifyContent: 'flex-start' }}>
      <Title>Nouvelle partie</Title>
      <SafeAreaView style={{ width: '100%', flex: 1, alignItems: 'center' }}>
       
        <Text style={{ color: '#fff', marginVertical: 20 }}>Mode de jeu</Text>
        <SelectDropdown
          data={['501', '301', 'Capital']}
          onSelect={(selectedItem: any) => {
            game.setType(selectedItem)
          }}
          defaultValue={game.getType()}
          defaultButtonText='Choisir un mode'
        />

        <Text onPress={addPlayer} style={styles.button}>Ajouter un Joueur</Text>

        {players.map((_player) => (
          <TextInput
            key={_player.id}
            style={{ borderColor: 'gray', borderWidth: 1, color: '#fff', marginTop: 20, width: '80%', padding: 10 }}
            placeholder={`Joueur ${_player.id}`}
            value={_player.name}
            onChangeText={text => updateUser(_player, text)}
          />
        ))}

      </SafeAreaView>
    </Container>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0ea5e9',
  },
});