import React, {useEffect, useState} from 'react';
import {useNavigation, router} from 'expo-router';
import {Pressable, SafeAreaView, ScrollView, ImageBackground, useColorScheme} from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";

import {Container, Text, useThemeColor, View} from '../../components/Themed';
import Game from '../../entities/game';
import {GameType} from "../../types";
import styles from "../../constants/Css";

export default function NewScreen() {

    const navigation = useNavigation();
    const [games, setGames] = useState<GameType []>([]);
    const [selectedGames, setSelectedGames] = useState<GameType []>([]);
    const backgroundColor = useThemeColor({}, 'background');
    const theme = useColorScheme();

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
        setGames(_games || []);
    }

    async function deleteGames() {
        await Game.multiRemoveFromStorage(selectedGames.map((game) => game.id));
        await getGames();
        setSelectedGames([]);
    }

    return (
        <Container>
            {games.length === 0 && (
                <View style={styles.flexBoxCenter}>
                    <Text style={styles.noGame}>Aucune game trouvée</Text>
                </View>
            )}
            {games.length > 0 && (
                <ImageBackground
                    source={require('../../assets/images/dartsbbli.png')}
                    resizeMode="cover"
                    style={styles.bgImage}
                >
                    <SafeAreaView style={{...styles.flexBox, borderTopColor: '#334155', borderTopWidth: 1, backgroundColor}}>
                        <ScrollView style={{width: '100%'}}>
                            {games.map((game) => (
                                <View key={game.id} style={[
                                    styles.card,
                                    {backgroundColor, marginVertical: 10}
                                ]}>
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
                                        onLongPress={() => {
                                            alert('Appuies brievement dessus pour continuer la partie');
                                        }}
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
                                            backgroundColor: 'transparent'

                                        }}>
                                            <Text style={{
                                                marginVertical: 20,
                                                fontWeight: 'bold',
                                                marginHorizontal: 20
                                            }}>
                                                {game.type}
                                            </Text>
                                            <Text>
                                                {game.players.map((player, index) => {
                                                    if (index === game.players.length - 1) {
                                                        return player.name;
                                                    }

                                                    return player.name + ', '
                                                })}
                                            </Text>
                                            <Text style={{marginLeft: 20}}>
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
                </ImageBackground>
            )}
        </Container>
    );
}
