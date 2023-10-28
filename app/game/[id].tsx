import {Pressable, StyleSheet} from 'react-native';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import {Container, Text, Title, View} from '../../components/Themed';
import {useEffect, useState} from "react";
import Game from "../../entities/game";

export default function GameId() {
    const {id} = useLocalSearchParams();
    const navigation = useNavigation();
    const [game] = useState<Game>(new Game(id as string));
    const [showMultiplier, setShowMultiplier] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [tempDart, setTempDart] = useState<number | null>(null);
    const arrayDarts = Array.from(Array(20).keys());
    //const [, forceUpdate] = useReducer(x => x + 1, 0);

    const startGame = async () => {
        await game.start().then(() => {
            navigation.setOptions({title: `${game.type} - ${game.players.length} joueurs`});
            setIsReady(true);
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

    useEffect(() => {
        void startGame();
    }, []);


    return (
        <Container style={{justifyContent: "flex-start"}}>
            {isReady && (
                <>
                    <Title>Tour N° {game.getRows().length || 1}</Title>
                    <View style={styles.card}>
                        <Text style={{...styles.cardText, fontWeight: 'bold'}}>{game.getCurrentPlayerInRow().player.name}</Text>
                        <Text style={styles.cardText}>{game.getCurrentPlayerInRow().getPlayer().getScore()} Pts</Text>
                        <Text style={styles.cardText}>{3 - game.getCurrentPlayerInRow().getDartsCount()} restantes</Text>
                    </View>
                    <View style={styles.containerBoxDarts}>
                        {[...arrayDarts, 24, 49].map((i) => (
                            <Pressable key={i}>
                                {({pressed}) => (
                                    <Text
                                        style={{
                                            ...styles.boxDarts,
                                            opacity: pressed ? 0.5 : 1,
                                            alignSelf: i === 49 ? 'center' : 'auto'
                                        }}
                                        onPress={() => handlePressDart(i + 1)}
                                    >
                                        {i + 1}
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
                        <Text onPress={() => handlePressMultiplier(1)} style={styles.multiplier}>Simple</Text>
                        {tempDart && tempDart !== 25 && tempDart !== 50 && (
                            <>
                                <Text onPress={() => handlePressMultiplier(2)} style={styles.multiplier}>Double</Text>
                                <Text onPress={() => handlePressMultiplier(3)} style={styles.multiplier}>Triple</Text>
                            </>
                        )}

                    </View>
                    <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 10}}>
                        {game.getCurrentPlayerInRow().getDarts().map((dart, index) => (
                            <Text key={index} style={{...styles.tempDart, backgroundColor: '#334155', color: '#fff'}}>
                                {dart.score * dart.multiplier}
                            </Text>
                        ))
                        }
                    </View>
                </>
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
        padding: 20,
        marginVertical: 10,
        marginHorizontal: 20,
    },
    cardText: {
        color: '#fff',
        fontSize: 25,
        marginTop: 10,
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
        marginHorizontal: 10,
        marginVertical: 10,
        fontSize: 18,
        fontWeight: 'bold',
        borderWidth: 2,
        borderColor: '#334155',
        padding: 10,
        width: 45,
        textAlign: 'center',
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
    },
    noGame: {color: '#b91c1c', marginVertical: 20, fontSize: 26},
    flexBoxCenter: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});