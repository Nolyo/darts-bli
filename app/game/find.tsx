import {Pressable, SafeAreaView, ScrollView, StyleSheet} from 'react-native';

import {Container, Text, Title, View} from '../../components/Themed';
import {useEffect, useState} from 'react';
import {useNavigation, router} from 'expo-router';
import Game from '../../entities/game';
import {GameType} from "../../types";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function NewScreen() {
    const navigation = useNavigation();
    const [games, setGames] = useState<GameType []>([]);
    const [selectedGames, setSelectedGames] = useState<GameType []>([]);

    useEffect(() => {
        navigation.setOptions({
            title: 'Rejoindre une game',
        });
    }, [navigation]);

    useEffect(() => {
        void getGames();
    }, []);

    async function getGames() {
        const _games = await Game.getAllFromStorage();
        // @ts-ignore
        setGames(_games)
    }

    async function deleteGames() {
        await Game.multiRemoveFromStorage(selectedGames.map((game) => game.id));
        await getGames();
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
                        <ScrollView style={{width: '100%', paddingHorizontal: 10}}>
                            {games.map((game) => (
                                <View key={game.id} style={{
                                    flexDirection: 'row',
                                    borderBottomColor: '#334155',
                                    borderBottomWidth: 1,
                                }}>
                                    <BouncyCheckbox
                                        size={25}
                                        fillColor="#991b1b"
                                        unfillColor="#44403c"
                                        iconStyle={{borderColor: "red"}}
                                        innerIconStyle={{borderWidth: 2}}
                                        onPress={(isChecked: boolean) => {
                                            if (isChecked) {
                                                setSelectedGames([...selectedGames, game]);
                                            } else {
                                                setSelectedGames(selectedGames.filter((selectedGame) => selectedGame.id !== game.id));
                                            }
                                        }}
                                    />
                                    <Pressable
                                        onPress={() => router.push({
                                            pathname: '/game/[id]',
                                            params: {id: game.id}
                                        })}
                                        style={{flex: 1}}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 10,
                                        }}>
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
                                            <Text style={{color: '#fff', marginLeft: 20}}>
                                                {game.rows.length} tour(s)
                                            </Text>
                                        </View>
                                    </Pressable>
                                </View>

                            ))}
                        </ScrollView>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            display: selectedGames.length > 0 ? 'flex' : 'none',
                            marginTop: 20,
                        }}>
                            <Text onPress={deleteGames}
                                  style={{
                                      paddingHorizontal: 10,
                                      paddingVertical: 10,
                                      backgroundColor: '#991b1b',
                                      marginRight: 10
                                  }}>Effacer
                            </Text>
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