import {
  ImageBackground,
  Pressable,
  ScrollView,
  useColorScheme,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  Container,
  Text,
  Title,
  View as ThemedView,
} from "../../components/Themed";
import { useEffect, useState } from "react";
import { TabBarIcon } from "../(tabs)/_layout";
import styles, {
  backgroundColor,
  bluePrimary,
  multiplierDouble,
  multiplierSimple,
  multiplierTriple,
} from "../../constants/Css";
import CardHeader from "../../components/game/CardHeader";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useGame } from "../../hooks/useGame";
// Import non typé pour useLocalSearchParams afin d'éviter la contrainte generics d'expo-router
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { DartBoard } from "../../components/game/DartBoard";
import { MultiplierSelector } from "../../components/game/MultiplierSelector";
import { DartTarget } from "../../components/game/DartTarget";
import { InputModeSwitch } from "../../components/ui/InputModeSwitch";
import { ConfettiOverlay } from "../../components/ui/ConfettiOverlay";
import { playVictorySound } from "../../utils/sounds";
import { getCheckoutSuggestions, formatSuggestion } from "../../utils/checkout";
import {
  getContractForRound,
  computeContractPoints,
} from "../../services/capital/contracts";

export default function GameId() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const theme = useColorScheme();

  const {
    game,
    isLoading,
    gameStatus,
    currentPlayer,
    currentPlayerInRow,
    canPlay,
    hasAgainDart,
    hasOverScore,
    gameRows,
    finishType,
    isFinishAtFirst,
    players,
    ranking,
    gameType,
    startGame,
    addDart,
    removeLastDart,
    nextPlayer,
    resetGame,
    setFinishType,
    setFinishAtFirst,
  } = useGame(id);

  const isCapital = gameType === "Capital";

  const [showMultiplier, setShowMultiplier] = useState<boolean>(false);
  const [tempDart, setTempDart] = useState<number | null>(null);
  const [showModalSettings, setShowModalSettings] = useState<boolean>(false);
  const [showRanking, setShowRanking] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<"grid" | "board">("board");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const handleStartGame = async () => {
    const success = await startGame();
    if (success) {
      updateNavigation();
    } else {
      navigation.goBack();
    }
  };

  const updateNavigation = () => {
    navigation.setOptions({
      title: `${gameType} - ${players.length} joueurs`,
      headerRight: () => (
        <TabBarIcon
          onPress={handleShowModalSettings}
          name={"ellipsis-v"}
          color={theme === "light" ? "#000" : "#fff"}
          style={{ marginRight: 20 }}
        />
      ),
    });
  };

  useEffect(() => {
    updateNavigation();
  }, [showModalSettings, gameType, players.length]);
  useEffect(() => {
    if (inputMode === "board" && showMultiplier) {
      setShowMultiplier(false);
      setTempDart(null);
    }
  }, [inputMode]);

  const handlePressDart = (_dart: number) => {
    setShowMultiplier(true);
    setTempDart(_dart);
  };

  const handlePressMultiplier = async (_multiplier: number) => {
    await addDart(tempDart || 0, _multiplier);
    setShowMultiplier(false);
    setTempDart(null);
  };
  const handleResolveHit = async (score: number, multiplier: number) => {
    if (!isCapital) {
      // Détection optimiste avant mutation (pour garantir le son sous gesture Web)
      const preScore = currentPlayer?.getScore() ?? 0;
      const postScore = preScore - score * multiplier;
      const willFinishNow =
        postScore === 0 &&
        (finishType === "classic" ||
          (finishType === "double" && multiplier === 2));

      if (willFinishNow && gameStatus !== "finished") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2200);
        playVictorySound().catch(() => {});
      }

      const beforeRanking = ranking.length;
      await addDart(score, multiplier);
      const afterRanking = ranking.length;
      if (
        !willFinishNow &&
        afterRanking > beforeRanking &&
        gameStatus !== "finished"
      ) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2200);
        playVictorySound().catch(() => {});
      }
    } else {
      // Capital: simple ajout sans détection de finish immédiat
      await addDart(score, multiplier);
    }
  };

  const colorDart = (dart: number) => {
    if (dart === 0) return multiplierDouble;
    if (dart === 25) return bluePrimary;
    if (dart === 50) return bluePrimary;
    if (dart % 2 === 0) return multiplierTriple;
    return "#16a34a";
  };

  const colorResumeDart = (multiplier: number) => {
    if (multiplier === 2) return multiplierDouble;
    if (multiplier === 3) return multiplierTriple;

    return multiplierSimple;
  };

  const handlePressDelete = async () => {
    await removeLastDart();
  };

  const handlePressReset = async () => {
    await resetGame();
    await handleStartGame();
  };

  const handleShowModalSettings = () => {
    setShowModalSettings(!showModalSettings);
  };

  useEffect(() => {
    if (game && gameStatus === "pending") {
      handleStartGame();
    }
  }, [game]);

  if (gameStatus === "finished") {
    const orderedPlayers = [...players].sort((a, b) =>
      isCapital ? b.getScore() - a.getScore() : a.getScore() - b.getScore()
    );
    return (
      <Container style={{ flexDirection: "column", justifyContent: "center" }}>
        <Card style={{ alignItems: "center", margin: 20 }} variant="elevated">
          <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
            🎉 Partie terminée !
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 4 }}>
            Gagnant : {orderedPlayers[0]?.getName()}
          </Text>
          <View style={{ width: "100%", gap: 8, marginTop: 12 }}>
            {orderedPlayers.map((player, idx) => (
              <Card
                key={player.getId()}
                variant={idx === 0 ? "elevated" : "outlined"}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: idx === 0 ? "bold" : "normal",
                    }}
                  >
                    {idx + 1}. {player.getName()}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {player.getScore()} pts
                  </Text>
                </View>
              </Card>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <Button
              title="🔄 Rejouer"
              onPress={handlePressReset}
              variant="primary"
              size="md"
            />
            <Button
              title="↩️ Retour"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="md"
            />
          </View>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      style={{ flexDirection: "column", justifyContent: "space-between" }}
    >
      <ImageBackground
        source={require("../../assets/images/dartsbbli.png")}
        resizeMode="cover"
        style={styles.bgImage}
      >
        {gameStatus === "started" && (
          <ThemedView
            style={{
              alignItems: "center",
              flex: 1,
              width: "100%",
              zIndex: 10,
            }}
          >
            {!isCapital && (
              <ConfettiOverlay
                visible={showConfetti}
                onEnd={() => setShowConfetti(false)}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Title style={{ flex: 1 }}>Tour N° {gameRows.length || 1}</Title>
              <View style={{ marginRight: 12 }}>
                <InputModeSwitch
                  mode={inputMode}
                  onChange={(m) => setInputMode(m)}
                />
              </View>
              <TabBarIcon
                name="users"
                color={theme === "dark" ? "#fff" : "#000"}
                onPress={() => setShowRanking(!showRanking)}
              />
            </View>
            {game && <CardHeader game={game} />}

            {isCapital && (
              <View style={{ width: "100%", alignItems: "center" }}>
                <Card
                  style={{
                    margin: 16,
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    borderColor: "rgba(59, 130, 246, 0.35)",
                    borderWidth: 1,
                    width: "90%",
                  }}
                  variant="outlined"
                >
                  {(() => {
                    const idx = Math.max(0, (gameRows.length || 1) - 1);
                    const c = getContractForRound(idx);
                    return (
                      <View style={{ gap: 8 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#ffffff",
                          }}
                        >
                          Contrat ({idx + 1}/14): {c.label}
                        </Text>
                        <Text style={{ fontSize: 14, color: "#e5e7eb" }}>
                          {c.description}
                        </Text>
                      </View>
                    );
                  })()}
                </Card>
              </View>
            )}

            {canPlay && (
              <>
                {inputMode === "grid" ? (
                  <>
                    <DartBoard
                      onDartPress={handlePressDart}
                      disabled={showMultiplier}
                    />
                    <MultiplierSelector
                      dartScore={tempDart || 0}
                      onMultiplierSelect={handlePressMultiplier}
                      visible={showMultiplier && tempDart !== null}
                    />
                  </>
                ) : (
                  <DartTarget
                    onResolveHit={handleResolveHit}
                    disabled={false}
                  />
                )}

                {/* Checkout help (x01 uniquement) */}
                {!isCapital &&
                  currentPlayer &&
                  (() => {
                    const remaining = currentPlayer.getScore();
                    const routes = getCheckoutSuggestions(
                      remaining,
                      finishType
                    );
                    if (routes.length === 0) return null;
                    return (
                      <View
                        pointerEvents="box-none"
                        style={{ width: "100%", alignItems: "center" }}
                      >
                        <Card
                          style={{
                            margin: 16,
                            backgroundColor: "rgba(31, 124, 65, 0.65)",
                            borderColor: "rgba(34, 197, 94, 0.35)",
                            borderWidth: 1,
                            width: "90%",
                          }}
                          variant="outlined"
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 12,
                            }}
                          >
                            <Text style={{ fontSize: 18, marginRight: 8 }}>
                              🎯
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: "#ffffff",
                              }}
                            >
                              Checkout ({remaining} pts)
                            </Text>
                          </View>
                          <View style={{ gap: 6 }}>
                            {routes.slice(0, 3).map((r, idx) => (
                              <View
                                key={idx}
                                style={{
                                  backgroundColor: "rgba(34, 197, 94, 0.25)",
                                  paddingHorizontal: 12,
                                  paddingVertical: 8,
                                  borderRadius: 8,
                                  borderLeftWidth: 3,
                                  borderLeftColor: "#10b981",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontWeight: "700",
                                    color: "#ffffff",
                                  }}
                                >
                                  {formatSuggestion(r)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </Card>
                      </View>
                    );
                  })()}
              </>
            )}

            {!canPlay && (
              <>
                <Card
                  style={{ margin: 16, alignItems: "center" }}
                  variant="elevated"
                >
                  <Text
                    style={{
                      fontSize: 24,
                      textAlign: "center",
                      marginBottom: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {currentPlayer?.getName()}
                  </Text>
                  {!hasAgainDart && currentPlayerInRow && (
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#10b981",
                        marginBottom: 8,
                      }}
                    >
                      {(() => {
                        if (!isCapital) {
                          return currentPlayerInRow
                            .getDarts()
                            .reduce((a, b) => a + b.score * b.multiplier, 0);
                        }
                        const roundIdx = Math.max(
                          0,
                          (gameRows.length || 1) - 1
                        );
                        const c = getContractForRound(roundIdx);
                        return computeContractPoints(
                          c.key as any,
                          currentPlayerInRow.getDarts()
                        );
                      })()}{" "}
                      points
                    </Text>
                  )}
                  {hasOverScore && (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ef4444",
                        marginBottom: 12,
                      }}
                    >
                      ⚠️ Score dépassé - sera réinitialisé
                    </Text>
                  )}
                </Card>
                <Button
                  title="Joueur Suivant →"
                  onPress={nextPlayer}
                  variant="primary"
                  size="lg"
                  style={{ marginHorizontal: 16 }}
                />
              </>
            )}
            <View style={styles.resumeDarts}>
              {currentPlayerInRow?.getDarts().map((dart, index) => (
                <View key={index} style={styles.relative}>
                  <View
                    style={{
                      ...styles.tempDart,
                      backgroundColor: colorResumeDart(dart.multiplier),
                      borderWidth: 0,
                    }}
                  >
                    <Text style={styles.tempDartScore}>
                      {dart.score * dart.multiplier}
                    </Text>
                    <Text style={styles.tempDartDetail}>
                      {dart.score} x {dart.multiplier}
                    </Text>
                  </View>

                  {index ===
                    (currentPlayerInRow?.getDarts().length ?? 0) - 1 && (
                    <TabBarIcon
                      name="trash"
                      color={theme === "dark" ? "#fff" : "#ff0000"}
                      style={{
                        ...styles.trashDartIcon,
                        borderColor: theme === "dark" ? "#fff" : "#ff0000",
                      }}
                      onPress={() => handlePressDelete()}
                    />
                  )}
                </View>
              )) ?? []}
            </View>
          </ThemedView>
        )}

        {isLoading && (
          <LoadingSpinner text="Chargement de la partie..." fullScreen />
        )}

        <Modal
          visible={showModalSettings}
          onClose={handleShowModalSettings}
          size="md"
        >
          <Title style={{ alignSelf: "center", marginBottom: 20 }}>
            Paramètres
          </Title>

          {!isCapital && (
            <View style={{ marginVertical: 16 }}>
              <BouncyCheckbox
                bounceEffectIn={1.5}
                size={24}
                fillColor="#ef4444"
                unfillColor="transparent"
                iconStyle={{ borderColor: "#ef4444", borderWidth: 2 }}
                innerIconStyle={{ borderWidth: 2 }}
                isChecked={finishType === "double"}
                textComponent={
                  <Text style={{ marginLeft: 12, fontSize: 16 }}>
                    Finir sur un double
                  </Text>
                }
                onPress={async (isChecked: boolean) => {
                  await setFinishType(isChecked ? "double" : "classic");
                }}
              />
            </View>
          )}

          {!isCapital && (
            <View style={{ marginVertical: 16 }}>
              <BouncyCheckbox
                bounceEffectIn={1.5}
                size={24}
                fillColor="#ef4444"
                unfillColor="transparent"
                iconStyle={{ borderColor: "#ef4444", borderWidth: 2 }}
                innerIconStyle={{ borderWidth: 2 }}
                isChecked={isFinishAtFirst}
                textComponent={
                  <Text style={{ marginLeft: 12, fontSize: 16 }}>
                    Fin au 1er gagnant
                  </Text>
                }
                onPress={async (isChecked: boolean) => {
                  await setFinishAtFirst(isChecked);
                }}
              />
            </View>
          )}

          <View style={{ marginTop: 32 }}>
            <Button
              title="🔄 Recommencer la partie"
              onPress={handlePressReset}
              variant="danger"
              size="lg"
            />
          </View>
        </Modal>

        <Modal
          visible={showRanking}
          onClose={() => setShowRanking(false)}
          size="md"
        >
          <Title style={{ alignSelf: "center", marginBottom: 20 }}>
            🏆 Classement
          </Title>

          <View style={{ gap: 12 }}>
            {[...players]
              .sort((a, b) => a.getScore() - b.getScore())
              .map((player, index) => {
                const isLeader = index === 0;
                return (
                  <Card
                    key={player.getId()}
                    variant={isLeader ? "elevated" : "outlined"}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            marginRight: 12,
                            color: isLeader
                              ? "#f59e0b"
                              : theme === "dark"
                              ? "#ffffff"
                              : "#374151",
                          }}
                        >
                          {isLeader ? "👑" : `${index + 1}.`}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: isLeader ? "bold" : "normal",
                            color: theme === "dark" ? "#ffffff" : "#374151",
                          }}
                        >
                          {player.getName()}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color:
                            player.getScore() === 0
                              ? "#10b981"
                              : theme === "dark"
                              ? "#ffffff"
                              : "#374151",
                        }}
                      >
                        {player.getScore()} pts
                      </Text>
                    </View>
                  </Card>
                );
              })}
          </View>
        </Modal>
      </ImageBackground>
    </Container>
  );
}
