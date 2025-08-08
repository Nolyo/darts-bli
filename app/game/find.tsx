import React, { useEffect, useState } from "react";
import { useNavigation, router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  useColorScheme,
  StyleSheet,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

import { Container, Text, useThemeColor, View } from "../../components/Themed";
import Game from "../../models/game";
import { GameType } from "../../types";
import styles from "../../constants/Css";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { showError, showSuccess } from "../../utils/notifications";

export default function FindGameScreen() {
  const navigation = useNavigation();
  const [games, setGames] = useState<GameType[]>([]);
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const backgroundColor = useThemeColor({}, "background");
  const theme = useColorScheme();
  const isDark = theme === "dark";

  // Styles dynamiques selon le thème
  const dynamicStyles = {
    card: {
      backgroundColor: isDark
        ? "rgba(31, 41, 55, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      shadowColor: isDark ? "#000" : "#000",
    },
    title: {
      color: isDark ? "#f9fafb" : "#111827",
    },
    subtitle: {
      color: isDark ? "#d1d5db" : "#6b7280",
    },
    players: {
      color: isDark ? "#e5e7eb" : "#374151",
    },
    stats: {
      color: isDark ? "#9ca3af" : "#6b7280",
    },
    statDivider: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)",
    },
  };

  useEffect(() => {
    navigation.setOptions({
      title: "Parties sauvegardées",
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
      showError("Erreur", "Impossible de charger les parties");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteGames() {
    try {
      await Game.multiRemoveFromStorage(selectedGames.map((game) => game.id));
      await getGames();
      setSelectedGames([]);
      showSuccess(
        "Parties supprimées",
        `${selectedGames.length} partie(s) supprimée(s)`
      );
    } catch (error) {
      showError("Erreur", "Impossible de supprimer les parties");
    }
  }

  return (
    <Container>
      {isLoading && (
        <LoadingSpinner text="Chargement des parties..." fullScreen />
      )}

      {!isLoading && games.length === 0 && (
        <View style={styles.flexBoxCenter}>
          <Text style={[styles.noGame, { textAlign: "center", fontSize: 18 }]}>
            😔 Aucune partie sauvegardée
          </Text>
          <Button
            title="Créer une nouvelle partie"
            onPress={() => router.push("/game/new")}
            variant="primary"
            style={{ marginTop: 20 }}
          />
        </View>
      )}

      {!isLoading && games.length > 0 && (
        <ImageBackground
          source={require("../../assets/images/dartsbbli.png")}
          resizeMode="cover"
          style={styles.bgImage}
        >
          <SafeAreaView
            style={{
              ...styles.flexBox,
              borderTopColor: "#334155",
              borderTopWidth: 1,
              backgroundColor,
            }}
          >
            <ScrollView
              style={{ width: "100%" }}
              contentContainerStyle={{ paddingVertical: 16 }}
            >
              {games.map((game) => (
                <Pressable
                  key={game.id}
                  onPress={() =>
                    router.push({
                      pathname: "/game/[id]",
                      params: { id: game.id },
                    })
                  }
                  style={({ pressed }) => [
                    localStyles.card,
                    dynamicStyles.card,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                >
                  {/* Design style Flowbite - une seule zone unie */}
                  <View style={localStyles.cardRow}>
                    <View style={localStyles.iconContainer}>
                      <Text style={localStyles.gameIcon}>🎯</Text>
                    </View>

                    <View style={localStyles.contentContainer}>
                      <Text
                        style={[localStyles.gameTitle, dynamicStyles.title]}
                      >
                        {game.type}
                      </Text>
                      <Text
                        style={[
                          localStyles.gameSubtitle,
                          dynamicStyles.subtitle,
                        ]}
                      >
                        {game.players.map((p) => p.name).join(", ")} •{" "}
                        {game.rows.length} tour{game.rows.length > 1 ? "s" : ""}
                      </Text>
                    </View>

                    <View style={localStyles.rightContainer}>
                      {game.status === "finished" && (
                        <View style={localStyles.statusBadge}>
                          <Text style={localStyles.statusText}>Terminée</Text>
                        </View>
                      )}
                      <BouncyCheckbox
                        size={20}
                        fillColor="#3b82f6"
                        unfillColor="transparent"
                        iconStyle={{ borderColor: "#3b82f6", borderWidth: 1.5 }}
                        innerIconStyle={{ borderWidth: 1.5 }}
                        onPress={(isChecked: boolean) => {
                          if (isChecked) {
                            setSelectedGames([...selectedGames, game]);
                          } else {
                            setSelectedGames(
                              selectedGames.filter(
                                (selectedGame) => selectedGame.id !== game.id
                              )
                            );
                          }
                        }}
                      />
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            {selectedGames.length > 0 && (
              <View style={{ marginBottom: 20, marginHorizontal: 16 }}>
                <Button
                  title={`🗑️ Supprimer ${selectedGames.length} partie${
                    selectedGames.length > 1 ? "s" : ""
                  }`}
                  onPress={deleteGames}
                  variant="danger"
                  size="lg"
                  style={{ width: "100%" }}
                />
              </View>
            )}
          </SafeAreaView>
        </ImageBackground>
      )}
    </Container>
  );
}

const localStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    marginLeft: 5,
  },
  gameIcon: {
    fontSize: 24,
    color: "white",
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
    padding: 10,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  gameSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  rightContainer: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
