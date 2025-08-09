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
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Container, Text, useThemeColor, View } from "../../components/Themed";
import { TabBarIcon } from "../(tabs)/_layout";
import Game from "../../models/game";
import { GameType } from "../../types";
import styles from "../../constants/Css";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { PageTransition } from "../../components/ui/PageTransition";
import { showError, showSuccess } from "../../utils/notifications";
import {
  getEstimatedStorageLimitBytes,
  getStorageUsageBytes,
} from "../../utils/storage";

export default function FindGameScreen() {
  const navigation = useNavigation();
  const [games, setGames] = useState<GameType[]>([]);
  const [selectedGames, setSelectedGames] = useState<GameType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usage, setUsage] = useState<{ bytes: number; keys: string[] } | null>(
    null
  );
  const [showFinished, setShowFinished] = useState(false);
  const [corruptedCount, setCorruptedCount] = useState<number>(0);
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
    void refreshUsage();
  }, []);

  async function refreshUsage() {
    const res = await getStorageUsageBytes(/darts.*/);
    setUsage({ bytes: res.bytes, keys: [...res.keys] });
  }

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

  // Analyse des entrées corrompues: JSON invalide ou structure incomplète
  async function scanCorrupted() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const gameKeyRegex = /^darts[0-9A-Za-z]+$/;
      const filtered = keys.filter((k) => gameKeyRegex.test(k));
      const pairs = await AsyncStorage.multiGet(filtered);
      let count = 0;
      for (const [id, value] of pairs) {
        try {
          const g = value ? JSON.parse(value) : null;
          const ok = !!(
            g &&
            typeof g.id === "string" &&
            typeof g.type === "string" &&
            Array.isArray(g.players) &&
            g.players.length > 0 &&
            Array.isArray(g.rows)
          );
          if (!ok) count += 1;
        } catch (e) {
          count += 1;
        }
      }
      setCorruptedCount(count);
    } catch (e) {
      setCorruptedCount(0);
    }
  }

  async function cleanupCorrupted() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const gameKeyRegex = /^darts[0-9A-Za-z]+$/;
      const filtered = keys.filter((k) => gameKeyRegex.test(k));
      const pairs = await AsyncStorage.multiGet(filtered);
      const toRemove: string[] = [];
      for (const [id, value] of pairs) {
        try {
          const g = value ? JSON.parse(value) : null;
          const ok = !!(
            g &&
            typeof g.id === "string" &&
            typeof g.type === "string" &&
            Array.isArray(g.players) &&
            g.players.length > 0 &&
            Array.isArray(g.rows)
          );
          if (!ok) toRemove.push(id);
        } catch (e) {
          toRemove.push(id);
        }
      }
      if (toRemove.length > 0) {
        await Game.multiRemoveFromStorage(toRemove);
        await getGames();
        await scanCorrupted();
        showSuccess(
          "Nettoyage effectué",
          `${toRemove.length} entrée(s) supprimée(s)`
        );
      } else {
        showSuccess("Nettoyage", "Aucune entrée à supprimer");
      }
    } catch (e) {
      showError("Erreur", "Impossible de nettoyer le stockage");
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

  useEffect(() => {
    void scanCorrupted();
  }, [games.length]);

  return (
    <PageTransition>
      <Container>
        {isLoading && (
          <LoadingSpinner text="Chargement des parties..." fullScreen />
        )}

        {!isLoading &&
          (() => {
            const visibleGames = games.filter((g: any) => {
              const ok = Array.isArray(g?.players) && g.players.length > 0;
              const fin = (g?.status ?? "pending") === "finished";
              return ok && (showFinished ? true : !fin);
            });
            if (visibleGames.length !== 0) return null;
            return (
              <View style={styles.flexBoxCenter}>
                <Text
                  style={[styles.noGame, { textAlign: "center", fontSize: 18 }]}
                >
                  😔{" "}
                  {showFinished
                    ? "Aucune partie sauvegardée"
                    : "Aucune partie en cours"}
                </Text>
                <Button
                  title="Créer une nouvelle partie"
                  onPress={() => router.push("/game/new")}
                  variant="primary"
                  style={{ marginTop: 20 }}
                />
              </View>
            );
          })()}

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
              {/* Filtres & stockage */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 4,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 5,
                  }}
                >
                  <View style={{ minWidth: 220, flexShrink: 0 }}>
                    <BouncyCheckbox
                      size={20}
                      fillColor="#10b981"
                      unfillColor="transparent"
                      iconStyle={{ borderColor: "#10b981", borderWidth: 1.5 }}
                      innerIconStyle={{ borderWidth: 1.5 }}
                      isChecked={showFinished}
                      textComponent={
                        <Text style={{ marginLeft: 8 }}>
                          Afficher les parties terminées
                        </Text>
                      }
                      onPress={(checked: boolean) => {
                        setShowFinished(checked);
                        setSelectedGames((prev) =>
                          prev.filter(
                            (g: any) =>
                              checked || (g?.status ?? "pending") !== "finished"
                          )
                        );
                      }}
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 260 }}>
                    {usage &&
                      (() => {
                        const total = getEstimatedStorageLimitBytes();
                        const used = usage.bytes;
                        const percent = Math.min(
                          100,
                          Math.round((used / total) * 100)
                        );
                        const warn = percent >= 80;
                        return (
                          <Card variant={warn ? "elevated" : "outlined"}>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: 10,
                              }}
                            >
                              <Text style={{ fontWeight: "700" }}>
                                Stockage
                              </Text>
                              <Text>
                                {(used / (1024 * 1024)).toFixed(1)} /{" "}
                                {(total / (1024 * 1024)).toFixed(0)} Mo
                              </Text>
                            </View>
                            <View
                              style={{
                                height: 8,
                                backgroundColor: "#1f2937",
                                borderRadius: 4,
                                marginTop: 8,
                              }}
                            >
                              <View
                                style={{
                                  width: `${percent}%`,
                                  height: 8,
                                  backgroundColor: warn ? "#ef4444" : "#10b981",
                                  borderRadius: 4,
                                }}
                              />
                            </View>
                            {warn && (
                              <Text style={{ marginTop: 6, color: "#ef4444" }}>
                                ⚠️ Espace bientôt saturé. Pensez à supprimer des
                                parties.
                              </Text>
                            )}
                          </Card>
                        );
                      })()}
                  </View>
                </View>
              </View>
              <ScrollView
                style={{
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                }}
                contentContainerStyle={{ paddingVertical: 16 }}
              >
                {games
                  .filter((g: any) => {
                    const ok =
                      Array.isArray(g?.players) && g.players.length > 0;
                    const fin = (g?.status ?? "pending") === "finished";
                    return ok && (showFinished ? true : !fin);
                  })
                  .map((game, idx) => (
                    <Pressable
                      key={`${game.id || "game"}-${idx}`}
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
                          <View style={localStyles.titleRow}>
                            <Text
                              style={[
                                localStyles.gameTitle,
                                dynamicStyles.title,
                              ]}
                            >
                              {game.type}
                            </Text>
                            {game.status === "finished" && (
                              <View
                                style={[
                                  localStyles.statusBadge,
                                  { marginLeft: 8 },
                                ]}
                              >
                                <Text style={localStyles.statusText}>
                                  Terminée
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={[
                              localStyles.gameSubtitle,
                              dynamicStyles.subtitle,
                            ]}
                          >
                            {(game.players || [])
                              .map((p: any) => p?.name || "?")
                              .join(", ")}{" "}
                            • {(game.rows || []).length} tour
                            {(game.rows || []).length > 1 ? "s" : ""}
                          </Text>
                        </View>

                        <View style={localStyles.rightContainer}>
                          {(() => {
                            const isSelected = selectedGames.some(
                              (g) => g.id === game.id
                            );
                            const toggle = () => {
                              if (isSelected) {
                                setSelectedGames(
                                  selectedGames.filter(
                                    (sg) => sg.id !== game.id
                                  )
                                );
                              } else {
                                setSelectedGames([...selectedGames, game]);
                              }
                            };
                            return (
                              <Pressable
                                onPress={toggle}
                                hitSlop={10}
                                style={{
                                  width: 28,
                                  height: 28,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <TabBarIcon
                                  name={isSelected ? "check" : "trash"}
                                  color={isSelected ? "#10b981" : "#94a3b8"}
                                  size={20}
                                  style={{
                                    marginRight: 0,
                                    marginBottom: 0,
                                    textAlign: "center",
                                  }}
                                />
                              </Pressable>
                            );
                          })()}
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
              {corruptedCount > 0 && (
                <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
                  <Button
                    title={`🧹 Nettoyer ${corruptedCount} entrée(s) invalide(s)`}
                    onPress={cleanupCorrupted}
                    variant="outline"
                    size="sm"
                  />
                </View>
              )}
            </SafeAreaView>
          </ImageBackground>
        )}
      </Container>
    </PageTransition>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    paddingLeft: 0,
    paddingRight: 0,
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
