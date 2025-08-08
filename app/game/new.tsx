import { SafeAreaView, StyleSheet, TextInput } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { Container, Text, Title, View } from "../../components/Themed";
import { useEffect, useState, useRef } from "react";
import { router, useNavigation } from "expo-router";
import Player from "../../models/player";
import { useGame } from "../../hooks/useGame";
import { showError } from "../../utils/notifications";
import type { GameModeType } from "../../types";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Card } from "../../components/ui/Card";

export const PointsMode: Record<GameModeType, number> = {
  "501": 501,
  "301": 301,
  Capital: 1000,
};

const GAME_MODES: GameModeType[] = ["501", "301", "Capital"];

export default function NewScreen() {
  const navigation = useNavigation();
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
    <Container style={{ justifyContent: "flex-start" }}>
      <Title style={{ marginVertical: 20 }}>🎯 Nouvelle partie</Title>

      <SafeAreaView style={{ width: "100%", flex: 1, paddingHorizontal: 20 }}>
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 12, fontWeight: "600" }}>
            Mode de jeu
          </Text>
          <SelectDropdown
            data={GAME_MODES}
            onSelect={(selectedItem: GameModeType) => {
              setGameType(selectedItem);
              // Reset players with new scores when changing game mode
              const updatedPlayers = localPlayers.map((player) => {
                const newScore = PointsMode[selectedItem];
                player.setScore(newScore);
                return player;
              });
              setLocalPlayers([...updatedPlayers]);
            }}
            defaultValue={gameType}
            defaultButtonText="Choisir un mode"
            buttonStyle={styles.dropdown}
            buttonTextStyle={styles.dropdownText}
            dropdownStyle={styles.dropdownContainer}
            rowStyle={styles.dropdownRow}
            rowTextStyle={styles.dropdownRowText}
          />
        </Card>

        <View style={{ marginBottom: 20 }}>
          <Button
            title="➕ Ajouter un joueur"
            onPress={handleAddPlayer}
            variant="outline"
            size="md"
            style={{ width: "100%" }}
          />
        </View>

        <View style={{ gap: 12 }}>
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
      <Modal visible={showConfirm} onClose={handleCloseConfirm} size="sm">
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
  );
}

const styles = StyleSheet.create({
  dropdown: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "left",
  },
  dropdownContainer: {
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownRow: {
    paddingVertical: 12,
  },
  dropdownRowText: {
    fontSize: 16,
    color: "#374151",
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
