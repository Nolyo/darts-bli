import { SafeAreaView, StyleSheet, TextInput, Pressable } from "react-native";
import { Container, Text, Title, View } from "../../components/Themed";
import { useEffect, useState, useRef } from "react";
import { router, useNavigation } from "expo-router";
import Player from "../../models/player";
import { useGame } from "../../hooks/useGame";
import { showError } from "../../utils/notifications";
import type { GameModeType } from "../../types";
import { Button } from "../../components/ui/Button";
import { PageTransition } from "../../components/ui/PageTransition";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";
import { useColorScheme } from "react-native";

export const PointsMode: Record<GameModeType, number> = {
  "501": 501,
  "301": 301,
  Capital: 0,
};

const GAME_MODES: GameModeType[] = ["501", "301", "Capital"];

export default function NewScreen() {
  const navigation = useNavigation();
  const theme = useColorScheme();
  const {
    game,
    gameType,
    players,
    createGame,
    setGameType,
    addPlayer,
    saveGame,
    clearGame,
  } = useGame();

  const [localPlayers, setLocalPlayers] = useState<Player[]>([]);
  const [lastAddedPlayerId, setLastAddedPlayerId] = useState<number | null>(
    null
  );
  const inputRefs = useRef<{ [key: number]: TextInput | null }>({});
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const MODE_INFO: Record<GameModeType, { icon: string; description: string }> =
    {
      "501": {
        icon: "🎮",
        description: "Départ 501. Atteignez 0 le plus vite possible.",
      },
      "301": {
        icon: "🎯",
        description: "Version rapide. Départ 301.",
      },
      Capital: {
        icon: "💰",
        description:
          "14 tours de contrats: 20, triple, 19, double, 18, side-by-side, 17, suite, 16, couleur, 15, 57, 14, centre. Départ 0. Score si contrat réussi.",
      },
    };

  const handleSelectGameMode = (selectedItem: GameModeType) => {
    setGameType(selectedItem);
    const updatedPlayers = localPlayers.map((player) => {
      const newScore = PointsMode[selectedItem];
      player.setScore(newScore);
      return player;
    });
    setLocalPlayers([...updatedPlayers]);
  };

  useEffect(() => {
    // Toujours nettoyer et créer un nouveau jeu quand on arrive sur cette page
    clearGame();
    createGame();
    // Réinitialiser l'état local
    setLocalPlayers([]);
    setLastAddedPlayerId(null);
    // Nettoyer les références d'inputs
    inputRefs.current = {};
  }, [clearGame, createGame]);

  useEffect(() => {
    navigation.setOptions({
      title: "Nouvelle partie",
    });
  }, [navigation]);

  // Focus sur le dernier input ajouté
  useEffect(() => {
    if (lastAddedPlayerId !== null && inputRefs.current[lastAddedPlayerId]) {
      // Petit délai pour s'assurer que l'input est rendu
      setTimeout(() => {
        inputRefs.current[lastAddedPlayerId]?.focus();
      }, 100);
    }
  }, [lastAddedPlayerId]);

  const submit = async () => {
    if (!game) return;

    // Vérification des noms de joueurs
    if (!areAllPlayerNamesValid()) {
      showError(
        "Noms invalides",
        "Chaque joueur doit avoir un nom avec au moins 2 lettres"
      );
      return;
    }

    try {
      // Applique l'ordre local au modèle avant démarrage
      localPlayers.forEach((p) => {
        const gp = game.getPlayerById(p.getId());
        gp?.setOrder(p.getOrder());
      });
      await game.checkSetup();
      await saveGame();
      router.replace({ pathname: "/game/[id]", params: { id: game.id } });
    } catch (e: any) {
      showError("Erreur", e.message);
      return;
    }
  };

  const handleAddPlayer = () => {
    if (!game) return;

    const newPlayer = addPlayer();
    if (newPlayer) {
      setLocalPlayers([...localPlayers, newPlayer]);
      setLastAddedPlayerId(newPlayer.getId());
    }
  };

  const shufflePlayers = () => {
    if (!game) return;
    const shuffled = [...localPlayers]
      .map((p) => ({ p, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(({ p }, idx) => {
        p.setOrder(idx + 1);
        return p;
      });
    setLocalPlayers(shuffled);
  };

  const handleOpenConfirm = () => setShowConfirm(true);
  const handleCloseConfirm = () => setShowConfirm(false);
  const handleConfirmStart = async () => {
    setShowConfirm(false);
    await submit();
  };

  const updateUser = (player: Player, name: string) => {
    player.setName(name);
    setLocalPlayers([...localPlayers]);
  };

  // Validation du nom (au moins 2 lettres)
  const isValidPlayerName = (name: string): boolean => {
    const letterCount = (name.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
    return letterCount >= 2;
  };

  // Vérifier si tous les joueurs ont des noms valides
  const areAllPlayerNamesValid = (): boolean => {
    return localPlayers.every(
      (player) =>
        player.getName().trim() !== "" && isValidPlayerName(player.getName())
    );
  };

  return (
    <PageTransition>
      <Container style={{ justifyContent: "flex-start" }}>
        <Title style={{ marginVertical: 20 }}>🎯 Nouvelle partie</Title>

        <SafeAreaView style={{ width: "100%", flex: 1, paddingHorizontal: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, marginBottom: 8, fontWeight: "600" }}>
              Mode de jeu
            </Text>
            <Text style={styles.modeSelectedDesc}>
              {MODE_INFO[gameType as GameModeType].description}
            </Text>
            <View style={[styles.modeGrid, { marginTop: 8 }]}>
              {GAME_MODES.map((mode) => {
                const selected = gameType === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => handleSelectGameMode(mode)}
                    style={({ pressed }) => [
                      { width: "31%", aspectRatio: 1 },
                      pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                    ]}
                  >
                    <Card
                      variant={selected ? "elevated" : "outlined"}
                      style={[
                        styles.modeCard,
                        selected && styles.modeCardSelected,
                      ]}
                    >
                      <Text style={styles.modeIcon}>
                        {MODE_INFO[mode].icon}
                      </Text>
                      <Text style={styles.modeTitle}>{mode}</Text>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ marginTop: 32, marginBottom: 20 }}>
            <View style={{ gap: 12, marginBottom: 16 }}>
              {localPlayers.map((_player) => {
                const playerName = _player.getName();
                const isNameValid =
                  playerName.trim() === "" || isValidPlayerName(playerName);

                return (
                  <View key={_player.getId()}>
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current[_player.getId()] = ref;
                      }}
                      style={[
                        styles.playerInput,
                        !isNameValid && styles.playerInputInvalid,
                      ]}
                      placeholder={`Joueur ${_player.getId()}`}
                      placeholderTextColor="#9ca3af"
                      value={playerName}
                      onChangeText={(text) => updateUser(_player, text)}
                      autoFocus={_player.getId() === lastAddedPlayerId}
                      returnKeyType="done"
                      blurOnSubmit={true}
                    />
                    {!isNameValid && (
                      <Text style={styles.errorText}>
                        Le nom doit contenir au moins 2 lettres
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <Button
              title="➕ Ajouter un joueur"
              onPress={handleAddPlayer}
              variant="outline"
              size="md"
              style={{ width: "100%" }}
            />
            {localPlayers.length > 1 && (
              <View style={{ marginTop: 12 }}>
                <Button
                  title="🔀 Mélanger l'ordre"
                  onPress={shufflePlayers}
                  variant="outline"
                  size="md"
                  style={{ width: "100%" }}
                />
              </View>
            )}
          </View>

          {localPlayers.length > 0 && (
            <View style={{ marginTop: 32 }}>
              <Button
                title={`🚀 Démarrer la partie (${localPlayers.length} joueur${
                  localPlayers.length > 1 ? "s" : ""
                })`}
                onPress={handleOpenConfirm}
                variant="primary"
                size="lg"
                style={{ width: "100%" }}
                disabled={!areAllPlayerNamesValid()}
              />
            </View>
          )}
        </SafeAreaView>
        <Modal
          visible={showConfirm}
          onClose={handleCloseConfirm}
          size="md"
          contentMaxHeightPercent={92}
        >
          <Title style={{ alignSelf: "center", marginBottom: 12 }}>
            Confirmer le démarrage
          </Title>
          <Text style={{ textAlign: "center", marginBottom: 16 }}>
            Commencer la partie avec {localPlayers.length} joueur
            {localPlayers.length > 1 ? "s" : ""} ?
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button
              title="Annuler"
              onPress={handleCloseConfirm}
              variant="outline"
              size="md"
              style={{ flex: 1 }}
            />
            <Button
              title="Confirmer"
              onPress={handleConfirmStart}
              variant="primary"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </Modal>
      </Container>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  modeCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 12,
    minHeight: 140,
  },
  modeCardSelected: {
    borderWidth: 2,
    borderColor: "#4f46e5",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modeIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  modeSelectedDesc: {
    fontSize: 12,
    textAlign: "left",
    opacity: 0.85,
    paddingHorizontal: 4,
  },
  playerInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#374151",
  },
  playerInputInvalid: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
