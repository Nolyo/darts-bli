import {Pressable, SafeAreaView, StyleSheet} from 'react-native';

import {Container, Text, Title, View} from '../../components/Themed';
import {useEffect, useState} from 'react';
import {useNavigation, router} from 'expo-router';
import Game from '../../entities/game';
import {GameType} from "../../types";

export default function NewScreen() {
    const navigation = useNavigation();
    const [games, setGames] = useState<GameType []>([]);

    useEffect(() => {
        navigation.setOptions({
            title: 'Rejoindre une game',
        });
    }, [navigation]);

    useEffect(() => {
        void getGames();
    }, []);

    async function getGames() {
        // @ts-ignore
        setGames(await Game.getAllFromStorage())
    }

    return (
        <Container style={{justifyContent: 'flex-start'}}>
            {games.length === 0 && (
                <View style={styles.flexBoxCenter}>
                    <Text style={styles.noGame}>Aucune game trouvée</Text>
                </View>
            )}
            {games.length > 0 && (
                <>
                    <Title style={{marginVertical: 20}}>Reprendre une games</Title>
                    <SafeAreaView style={{...styles.flexBox, borderTopColor: '#334155', borderTopWidth: 1}}>
                        <View style={{width: "100%"}}>
                            {games.map((game) => (
                                    <Pressable
                                        key={game.id}
                                        onPress={() => router.push({pathname: '/game/[id]', params: {id: game.id}})}>
                                        <View
                                            style={{
                                                ...styles.flexBoxCenter,
                                                flexDirection: 'row',
                                                borderBottomColor: '#334155',
                                                borderBottomWidth: 1
                                            }}
                                        >
                                            <Text style={{
                                                color: '#fff',
                                                marginVertical: 20,
                                                fontWeight: 'bold',
                                                marginHorizontal: 20
                                            }}>
                                                {game.type}
                                            </Text>
                                            <Text style={{color: '#fff'}}>
                                                {game.players.map((player, index) => {
                                                    if (index === game.players.length - 1) {
                                                        return player.name;
                                                    }

                                                    return player.name + ', '
                                                })}
                                            </Text>
                                        </View>
                                    </Pressable>

                                )
                            )}
                        </View>
                    </SafeAreaView>
                </>
            )}

        </Container>
    );
}

const styles = StyleSheet.create({
    noGame: {color: '#b91c1c', marginVertical: 20, fontSize: 26},
    flexBoxCenter: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    flexBox: {flex: 1, alignItems: 'center', width: '100%'},
});