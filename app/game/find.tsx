import React, {useEffect, useState} from 'react';
import {useNavigation, router} from 'expo-router';
import {Pressable, SafeAreaView, ScrollView, ImageBackground, useColorScheme} from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";

import {Container, Text, useThemeColor, View} from '../../components/Themed';
import Game from '../../models/game';
import {GameType} from "../../types";
import styles from "../../constants/Css";
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { showError, showSuccess } from '../../utils/notifications';

export default function FindGameScreen() {
    const navigation = useNavigation();
    const [games, setGames] = useState<GameType[]>([]);
    const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const backgroundColor = useThemeColor({}, 'background');
    const theme = useColorScheme();

    useEffect(() => {
        navigation.setOptions({
            title: 'Parties sauvegardées',
        });
    }, [navigation]);

    useEffect(() => {
        void getGames();
    }, []);

    async function getGames() {
        try {
            setIsLoading(true);
            const _games = await Game.getAllFromStorage();
            setGames(_games || []);
        } catch (error) {
            showError('Erreur', 'Impossible de charger les parties');
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteGames() {
        try {
            await Game.multiRemoveFromStorage(selectedGames.map((game) => game.id));
            await getGames();
            setSelectedGames([]);
            showSuccess('Parties supprimées', `${selectedGames.length} partie(s) supprimée(s)`);
        } catch (error) {
            showError('Erreur', 'Impossible de supprimer les parties');
        }
    }

    return (
        <Container>
            {isLoading && (
                <LoadingSpinner text="Chargement des parties..." fullScreen />
            )}
            
            {!isLoading && games.length === 0 && (
                <View style={styles.flexBoxCenter}>
                    <Text style={[styles.noGame, {textAlign: 'center', fontSize: 18}]}>😔 Aucune partie sauvegardée</Text>
                    <Button
                        title="Créer une nouvelle partie"
                        onPress={() => router.push('/game/new')}
                        variant="primary"
                        style={{marginTop: 20}}
                    />
                </View>
            )}
            
            {!isLoading && games.length > 0 && (
                <ImageBackground
                    source={require('../../assets/images/dartsbbli.png')}
                    resizeMode="cover"
                    style={styles.bgImage}
                >
                    <SafeAreaView style={{...styles.flexBox, borderTopColor: '#334155', borderTopWidth: 1, backgroundColor}}>
                        <ScrollView style={{width: '100%'}}>
                            {games.map((game) => (
                                <Card key={game.id} style={{marginVertical: 8, marginHorizontal: 16}} variant="outlined">
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <BouncyCheckbox
                                            size={20}
                                            fillColor="#ef4444"
                                            unfillColor="transparent"
                                            iconStyle={{borderColor: "#ef4444", borderWidth: 2}}
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
                                            style={{flex: 1, marginLeft: 12}}>
                                            <View>
                                                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                                                        🎯 {game.type}
                                                    </Text>
                                                    <Text style={{marginLeft: 8, fontSize: 14, opacity: 0.7}}>
                                                        {game.status === 'finished' ? '✅ Terminée' : '⏳ En cours'}
                                                    </Text>
                                                </View>
                                                <Text style={{fontSize: 14, marginBottom: 4}}>
                                                    👥 {game.players.map((player, index) => {
                                                        if (index === game.players.length - 1) {
                                                            return player.name;
                                                        }
                                                        return player.name + ', ';
                                                    })}
                                                </Text>
                                                <Text style={{fontSize: 12, opacity: 0.6}}>
                                                    🔄 {game.rows.length} tour{game.rows.length > 1 ? 's' : ''}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    </View>
                                </Card>
                            ))}
                        </ScrollView>
                        {selectedGames.length > 0 && (
                            <View style={{marginTop: 16, marginHorizontal: 16}}>
                                <Button
                                    title={`🗑️ Supprimer (${selectedGames.length})`}
                                    onPress={deleteGames}
                                    variant="danger"
                                    size="md"
                                    style={{width: '100%'}}
                                />
                            </View>
                        )}
                    </SafeAreaView>
                </ImageBackground>
            )}
        </Container>
    );
}
