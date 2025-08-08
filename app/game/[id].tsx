import {ImageBackground, Pressable, ScrollView, useColorScheme, View} from 'react-native';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import {Container, Text, Title, View as ThemedView} from '../../components/Themed';
import {useEffect, useReducer, useState} from "react";
import Game from "../../models/game";
import {TabBarIcon} from "../(tabs)/_layout";
import styles, {
    backgroundColor,
    bluePrimary,
    multiplierDouble,
    multiplierSimple,
    multiplierTriple
} from "../../constants/Css";
import CardHeader from "../../components/game/CardHeader";
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function GameId() {
    const {id} = useLocalSearchParams();
    const navigation = useNavigation();
    const theme = useColorScheme();

    const [game] = useState<Game>(new Game(id as string));
    const [showMultiplier, setShowMultiplier] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [tempDart, setTempDart] = useState<number | null>(null);
    const [showModalSettings, setShowModalSettings] = useState<boolean>(false);
    const [showRanking, setShowRanking] = useState<boolean>(false);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const arrayDarts = Array.from(Array(21).keys());

    const startGame = async () => {
        await game.start().then(() => {
            updateNavigation();
            setIsReady(true);
        }).catch((e) => {
            alert(e.message);
            navigation.goBack();
        });
    }

    const updateNavigation = () => {
        navigation.setOptions({
            title: `${game.type} - ${game.players.length} joueurs`,
            headerRight: () => (
                <TabBarIcon
                    onPress={handleShowModalSettings}
                    name={'ellipsis-v'}
                    color={theme === "light" ? "#000" : "#fff"}
                    style={{marginRight: 20}}
                />
            )
        });
    }

    useEffect(() => {
        updateNavigation();
    }, [showModalSettings, game.type, game.players.length]);

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
        if (dart === 0) return multiplierDouble;
        if (dart === 25) return bluePrimary;
        if (dart === 50) return bluePrimary;
        if (dart % 2 === 0) return multiplierTriple;
        return '#16a34a';
    }

    const colorResumeDart = (multiplier: number) => {
        if (multiplier === 2) return multiplierDouble;
        if (multiplier === 3) return multiplierTriple;

        return multiplierSimple;
    }

    const handlePressDelete = async () => {
        await game.removeLastDart();
        forceUpdate();
    }

    const handlePressReset = async () => {
        setIsReady(false);
        await game.resetGame();
        void startGame();
        forceUpdate();
    }

    const handleShowModalSettings = () => {
        setShowModalSettings(!showModalSettings);
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

    if (game.status === 'finished') {
        return (
            <Container style={{flexDirection: "column", justifyContent: "space-between"}}>
                <View style={{alignItems: 'center', flex: 1, width: "100%"}}>
                    <Text>Partie finie</Text>
                    <Text onPress={handlePressReset}>Reset</Text>
                </View>
            </Container>
        )
    }

    return (
        <Container style={{flexDirection: "column", justifyContent: "space-between"}}>
            <ImageBackground
                source={require('../../assets/images/dartsbbli.png')}
                resizeMode="cover"
                style={styles.bgImage}
            >
                {isReady && (
                    <ThemedView style={{alignItems: 'center', flex: 1, width: "100%"}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                            <Title style={{flex: 1}}>Tour N° {game.getRows().length || 1}</Title>
                            <TabBarIcon
                                name="users"
                                color={theme === 'dark' ? '#fff' : '#000'}
                                onPress={() => setShowRanking(!showRanking)}
                            />
                        </View>
                        <CardHeader game={game}/>

                        {game.playerCanPlay() && (
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
                                                        borderColor: colorDart(i),
                                                        backgroundColor: colorDart(i),
                                                        width: i === 0 ? 110 : 45,
                                                    }}
                                                    onPress={() => handlePressDart(i)}
                                                >
                                                    {i}
                                                </Text>
                                            )}
                                        </Pressable>
                                    ))}

                                </View>
                                {tempDart !== null && (
                                    <View
                                        style={{...styles.containerBoxDarts, justifyContent: 'center', marginTop: 20}}>
                                        <Text style={{
                                            ...styles.tempDart,
                                            lineHeight: 55,
                                            borderRadius: 50,
                                            borderColor: theme === 'dark' ? '#fff' : backgroundColor,
                                            color: theme === 'dark' ? '#fff' : backgroundColor,
                                        }}>
                                            {parseInt(tempDart.toString()) === 50 ? 'Bull' : tempDart}
                                        </Text>
                                    </View>
                                )}
                                <View style={{...styles.multiplierBox, display: showMultiplier ? 'flex' : 'none'}}>
                                    <Text onPress={() => handlePressMultiplier(1)}
                                          style={{...styles.multiplier, backgroundColor: colorDart(1)}}>Simple</Text>
                                    {tempDart !== null && tempDart !== 25 && tempDart !== 50 && (
                                        <>
                                            <Text onPress={() => handlePressMultiplier(2)}
                                                  style={{
                                                      ...styles.multiplier,
                                                      borderColor: '#ea580c',
                                                      backgroundColor: '#ea580c'
                                                  }}>Double</Text>
                                            <Text onPress={() => handlePressMultiplier(3)}
                                                  style={{
                                                      ...styles.multiplier,
                                                      borderColor: '#ff0000',
                                                      backgroundColor: '#ff0000'
                                                  }}>Triple</Text>
                                        </>
                                    )}

                                </View>
                            </>
                        )}

                        {!game.playerCanPlay() && (
                            <>
                                <View style={{...styles.card, flexDirection: 'column', backgroundColor: '#075985'}}>
                                    <Text style={{fontSize: 24, textAlign: 'center', marginBottom: 20}}>
                                        {game.currentPlayer()?.name} </Text>
                                    {!game.playerHasAgainDart() && (
                                        <Text style={{
                                            color: '#020617',
                                            fontWeight: 'bold',
                                            marginLeft: 2,
                                            fontSize: 32,
                                            textAlign: 'center'
                                        }}>
                                            {game.getCurrentPlayerInRow().getDarts().reduce((a, b) => a + (b.score * b.multiplier), 0)} points
                                        </Text>
                                    )}
                                    {game.playerHasOverScore() && (
                                        <Text style={{
                                            color: '#020617',
                                            fontWeight: 'bold',
                                            marginLeft: 2,
                                            fontSize: 32,
                                            textAlign: 'center'
                                        }}>
                                            Le score est dépassé et sera réinitialisé
                                        </Text>
                                    )}
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
                        <View style={styles.resumeDarts}>
                            {game.getCurrentPlayerInRow().getDarts().map((dart, index) => (
                                <View key={index} style={styles.relative}>
                                    <View style={{
                                        ...styles.tempDart,
                                        backgroundColor: colorResumeDart(dart.multiplier),
                                        borderWidth: 0
                                    }}>
                                        <Text style={styles.tempDartScore}>
                                            {dart.score * dart.multiplier}
                                        </Text>
                                        <Text style={styles.tempDartDetail}>
                                            {dart.score} x {dart.multiplier}
                                        </Text>
                                    </View>

                                    {index === game.getCurrentPlayerInRow().getDarts().length - 1 && (
                                        <TabBarIcon
                                            name="trash"
                                            color={theme === 'dark' ? '#fff' : '#ff0000'}
                                            style={{
                                                ...styles.trashDartIcon,
                                                borderColor: theme === 'dark' ? '#fff' : '#ff0000'
                                            }}
                                            onPress={() => handlePressDelete()}
                                        />
                                    )}
                                </View>
                            ))}
                        </View>
                    </ThemedView>
                )}

                {!isReady && (
                    <View style={styles.flexBoxCenter}>
                        <Text style={styles.noGame}>Chargement de la game</Text>
                    </View>
                )}

                {showModalSettings && (
                    <View style={styles.modalSettings}>
                        <Container style={{justifyContent: 'flex-start', alignItems: 'stretch', position: 'relative'}}>
                            <Title style={{alignSelf: 'center'}}>Paramètres</Title>
                            <ScrollView style={{marginVertical: 10}}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        width: '100%',
                                        alignItems: 'center',
                                        marginVertical: 10
                                    }}>
                                    <BouncyCheckbox
                                        bounceEffectIn={1.5}
                                        size={30}
                                        fillColor="#991b1b"
                                        unfillColor="#44403c"
                                        iconStyle={{borderColor: "red"}}
                                        innerIconStyle={{borderWidth: 2}}
                                        isChecked={game.finishType === 'double'}
                                        textComponent={<Text style={{marginLeft: 15}}>Finir sur un double</Text>}
                                        onPress={async (isChecked: boolean) => {
                                            game.setTypesFinish(isChecked ? 'double' : 'classic');
                                            await game.save();
                                        }}
                                    />
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        width: '100%',
                                        alignItems: 'center',
                                        marginVertical: 10
                                    }}>
                                    <BouncyCheckbox
                                        bounceEffectIn={1.5}
                                        size={30}
                                        fillColor="#991b1b"
                                        unfillColor="#44403c"
                                        iconStyle={{borderColor: "red"}}
                                        innerIconStyle={{borderWidth: 2}}
                                        isChecked={game.isFinishAtFirst}
                                        textComponent={<Text style={{marginLeft: 15}}>La partie est finie au 1er gagnant</Text>}
                                        onPress={async (isChecked: boolean) => {
                                            game.setFinishAtFirst(isChecked);
                                            await game.save();
                                        }}
                                    />
                                </View>

                                <View style={{width: '100%', alignItems: 'center', marginTop: 30}}>
                                    <Text style={{backgroundColor: bluePrimary, padding: 10}}
                                          onPress={handlePressReset}>Recommencer
                                        la partie</Text>
                                </View>
                            </ScrollView>
                            <View style={{position: 'absolute', top: 5, right: -5}}>
                                <TabBarIcon
                                    name="times"
                                    color={theme === "light" ? "#000" : "#fff"}
                                    onPress={handleShowModalSettings}
                                />
                            </View>
                        </Container>
                    </View>
                )}


                {showRanking && (
                    <View style={styles.modalSettings}>
                        <Container style={{justifyContent: 'flex-start', alignItems: 'stretch'}}>
                            <Title style={{alignSelf: 'center'}}>Classement</Title>
                            <ScrollView style={{marginVertical: 10}}>
                                <View
                                    style={{width: '100%', alignItems: 'center', marginVertical: 10}}>
                                    {game.getPlayerOrderByScore().map((player, index) => (
                                        <View key={player.id} style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            paddingVertical: 10
                                        }}>
                                            <Text style={{
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                marginLeft: 20
                                            }}>{index + 1} - {player.name}</Text>
                                            <Text style={{
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                marginRight: 20
                                            }}>{player.score} points</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </Container>
                    </View>
                )}
            </ImageBackground>
        </Container>
    );
}