import {SafeAreaView, StyleSheet, TextInput} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown'


import {Container, Text, Title} from '../../components/Themed';
import {useEffect, useState} from 'react';
import {router, useNavigation} from 'expo-router';
import Game from '../../entities/game';
import Player from '../../entities/player';

export const PointsMode = {
    '501': 501,
    '301': 301,
    'Capital': 1000,
}

export default function NewScreen() {
    const navigation = useNavigation();
    const [players, setPlayers] = useState<Player[]>([]);
    const [game] = useState<Game>(new Game());

    useEffect(() => {
        navigation.setOptions({
            title: 'Nouvelle game',
            headerRight: () => (
                <Text onPress={submit}
                      style={{paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#0ea5e9', marginRight: 10}}>Commencer</Text>
            ),
        });
    }, [navigation]);


    const submit = async () => {
        try {
            await game.checkSetup();
            await game.save();
            router.replace({pathname: '/game/[id]', params: {id: game.id}})
        } catch (e: any) {
            alert(e.message);
            return;
        }

    }

    const addPlayer = () => {
        const newPlayer = new Player(game.getNextPlayerId(), game.type === 'Capital' ? 1000 : parseInt(game.type));
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
        <Container style={{justifyContent: 'flex-start'}}>
            <Title>Nouvelle partie</Title>
            <SafeAreaView style={{width: '100%', flex: 1, alignItems: 'center'}}>

                <Text style={{color: '#fff', marginVertical: 20}}>Mode de jeu</Text>
                <SelectDropdown
                    data={['501', '301', 'Capital']}
                    onSelect={(selectedItem: any) => {
                        game.setType(selectedItem)
                    }}
                    defaultValue={game.type}
                    defaultButtonText='Choisir un mode'
                />

                <Text onPress={addPlayer} style={styles.button}>Ajouter un Joueur</Text>

                {players.map((_player) => (
                    <TextInput
                        key={_player.id}
                        style={{borderColor: 'gray', borderWidth: 1, color: '#fff', marginTop: 20, width: '80%', padding: 10}}
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