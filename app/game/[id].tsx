import {Pressable, StyleSheet} from 'react-native';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import {Container, Text, Title, View} from '../../components/Themed';
import {useEffect, useReducer, useState} from "react";
import Game from "../../entities/game";
import {TabBarIcon} from "../(tabs)/_layout";

export default function GameId() {
    const {id} = useLocalSearchParams();
    const navigation = useNavigation();
    const [game] = useState<Game>(new Game(id as string));
    const [showMultiplier, setShowMultiplier] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [tempDart, setTempDart] = useState<number | null>(null);
    const arrayDarts = Array.from(Array(21).keys());
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const startGame = async () => {
        await game.start().then(() => {
            navigation.setOptions({title: `${game.type} - ${game.players.length} joueurs`});
            setIsReady(true);
        }).catch((e) => {
            alert(e.message);
            navigation.goBack();
        });
    }

    const handlePressDart = (_dart: number) => {
        setShowMultiplier(true);
        setTempDart(_dart);
    }

    const handlePressMultiplier = async (_multiplier: number) => {
        await game.addDart(tempDart || 0, _multiplier);
        setShowMultiplier(false);
        setTempDart(null);
    }

    const colorDart = (dart: number) => {

        if (dart === 0) return '#ea580c';
        if (dart === 25) return '#0284c7';
        if (dart === 50) return '#0284c7';
        if (dart % 2 === 0) return '#ff0000';
        return '#16a34a';
    }

    const handlePressDelete = async () => {
        await game.removeLastDart();
        forceUpdate();
    }

    useEffect(() => {
        if (!id || !game.id || typeof id !== "string") return;
        if (id !== game.id) {
            game.id = id;
        }
    }, [id]);

    useEffect(() => {
        void startGame();
        forceUpdate();
        game.currentPlayer();
    }, [game.id]);

    return (
        <Container style={{flexDirection: "column", justifyContent: "space-between"}}>
            {isReady && (
                <View style={{alignItems: 'center', flex: 1, width: "100%"}}>
                    <Title>Tour N° {game.getRows().length || 1}</Title>
                    <View style={styles.card}>
                        <Text style={{...styles.cardText, fontWeight: 'bold'}}>{game.currentPlayer()?.name}</Text>
                        <Text style={styles.cardText}>{game.currentPlayer()?.getScore()} Pts</Text>
                        <Text style={styles.cardText}>{3 - game.getCurrentPlayerInRow().getDartsCount()} tirs</Text>
                    </View>
                    {game.playerHasAgainDart() ? (
                        <>
                            <View style={styles.containerBoxDarts}>
                                {[...arrayDarts, 25, 50].map((i) => (
                                    <Pressable key={i}>
                                        {({pressed}) => (
                                            <Text
                                                style={{
                                                    ...styles.boxDarts,
                                                    opacity: pressed ? 0.5 : 1,
                                                    alignSelf: i === 50 ? 'center' : 'auto',
                                                    borderColor: colorDart(i)
                                                }}
                                                onPress={() => handlePressDart(i)}
                                            >
                                                {i}
                                            </Text>
                                        )}
                                    </Pressable>
                                ))}

                            </View>
                            {tempDart && (
                                <View style={{...styles.containerBoxDarts, justifyContent: 'center'}}>
                                    <Text style={styles.tempDart}>
                                        {tempDart}
                                    </Text>
                                </View>
                            )}
                            <View style={{...styles.multiplierBox, display: showMultiplier ? 'flex' : 'none'}}>
                                <Text onPress={() => handlePressMultiplier(1)}
                                      style={{...styles.multiplier, borderColor: '#16a34a'}}>Simple</Text>
                                {tempDart && tempDart !== 25 && tempDart !== 50 && (
                                    <>
                                        <Text onPress={() => handlePressMultiplier(2)}
                                              style={{...styles.multiplier, borderColor: '#ea580c'}}>Double</Text>
                                        <Text onPress={() => handlePressMultiplier(3)}
                                              style={{...styles.multiplier, borderColor: '#ff0000'}}>Triple</Text>
                                    </>
                                )}

                            </View>
                        </>
                    ) : (
                        <>
                            <View style={{...styles.card, flexDirection: 'column', backgroundColor: '#075985'}}>
                                <Text style={{fontSize: 24, textAlign: 'center', marginBottom: 20}}>
                                    {game.currentPlayer()?.name} </Text>
                                <Text style={{color: '#020617', fontWeight: 'bold', marginLeft: 2, fontSize: 32, textAlign: 'center'}}>
                                    {game.getCurrentPlayerInRow().getDarts().reduce((a, b) => a + (b.score * b.multiplier), 0)} points
                                </Text>
                            </View>
                            <Text
                                style={{
                                    marginTop: 20,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    backgroundColor: '#0ea5e9',
                                    fontWeight: 'bold',
                                }}
                                onPress={async () => {
                                    await game.nextPlayer();
                                    forceUpdate();
                                }}
                            >Joueur Suivant</Text>
                        </>

                    )}


                    <View style={{flexDirection: 'row', gap: 10, marginBottom: 10, flex: 1, alignItems: 'flex-end'}}>
                        {game.getCurrentPlayerInRow().getDarts().map((dart, index) => (
                            <View key={index} style={{
                                position: 'relative'
                            }}>
                                <Text
                                    style={{
                                        ...styles.tempDart,
                                        color: '#fff',
                                        backgroundColor: '#334155',
                                    }}
                                >{dart.score * dart.multiplier}</Text>
                                {index === game.getCurrentPlayerInRow().getDarts().length - 1 && (
                                    <TabBarIcon
                                        name="trash"
                                        color={"#ff0000"}
                                        style={{
                                            position: 'absolute',
                                            right: 5,
                                            top: -5,
                                            fontSize: 20,
                                        }}
                                        onPress={() => handlePressDelete()}
                                    />
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {!isReady && (
                <View style={styles.flexBoxCenter}>
                    <Text style={styles.noGame}>Chargement de la game</Text>
                </View>
            )}


        </Container>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#0284c7',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
        marginHorizontal: 20,
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardText: {
        color: '#fff',
        fontSize: 25,
        alignSelf: 'center'
    },
    containerBoxDarts: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        width: '100%'
    },
    boxDarts: {
        marginHorizontal: 5,
        marginVertical: 5,
        fontSize: 18,
        fontWeight: 'bold',
        borderWidth: 2,
        borderColor: '#334155',
        padding: 10,
        width: 45,
        textAlign: 'center',
        borderRadius: 4
    },
    multiplierBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginVertical: 20,
        marginHorizontal: 20,
    },
    multiplier: {
        padding: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#334155',
        fontSize: 18,
        borderRadius: 4
    },
    tempDart: {
        fontSize: 35,
        fontWeight: 'bold',
        borderWidth: 2,
        borderColor: '#334155',
        padding: 10,
        textAlign: 'center',
        borderRadius: 50,
        minWidth: 70,
        height: 70,
    },
    noGame: {color: '#b91c1c', marginVertical: 20, fontSize: 26},
    flexBoxCenter: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});