import { Container, View } from "../../components/Themed";
import { StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { ImageBackground } from "react-native";
import { Button } from "../../components/ui/Button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal } from "../../components/ui/Modal";
import { PageTransition } from "../../components/ui/PageTransition";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function TabOneScreen() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTip, setActiveTip] = useState<
    "score" | "multiplier" | "undo" | null
  >(null);

  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      if (!seen) setShowOnboarding(true);
    })();
  }, []);

  const confirmOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "1");
    setShowOnboarding(false);
  };
  const closeOnboardingLater = () => {
    setShowOnboarding(false);
  };

  const toggleTip = (tip: "score" | "multiplier" | "undo") => {
    setActiveTip(activeTip === tip ? null : tip);
  };
  return (
    <PageTransition>
      <ImageBackground
        source={require("../../assets/images/dartsbbli.png")}
        resizeMode="cover"
        style={styles.image}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.container}>
          <Button
            title="🎯 Nouvelle partie"
            onPress={() => router.push("/game/new")}
            variant="primary"
            size="lg"
            style={styles.button}
          />

          <Button
            title="🔍 Chercher une partie"
            onPress={() => router.push("/game/find")}
            variant="outline"
            size="lg"
            style={styles.button}
          />
        </View>
        <Modal
          visible={showOnboarding}
          onClose={closeOnboardingLater}
          size="lg"
          contentMaxHeightPercent={96}
          showCloseButton={false}
        >
          <View style={{ gap: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ height: 36 }} />
              <Button
                title="Fermer"
                onPress={closeOnboardingLater}
                variant="outline"
                size="sm"
              />
            </View>

            <View style={{ gap: 8 }}>
              <Button
                title="🧭 Comment marquer"
                onPress={() => toggleTip("score")}
                variant={activeTip === "score" ? "primary" : "outline"}
                size="md"
              />
              <Button
                title="🎯 Multiplicateurs (S/D/T)"
                onPress={() => toggleTip("multiplier")}
                variant={activeTip === "multiplier" ? "primary" : "outline"}
                size="md"
              />
              <Button
                title="↩️ Annuler une fléchette"
                onPress={() => toggleTip("undo")}
                variant={activeTip === "undo" ? "primary" : "outline"}
                size="md"
              />
            </View>

            {activeTip && (
              <View
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "rgba(59, 130, 246, 0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(59, 130, 246, 0.2)",
                }}
              >
                {activeTip === "score" && (
                  <View style={{ gap: 6 }}>
                    <View>
                      <Button
                        title="Astuce: visez 20/19 pour monter vite"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                      />
                    </View>
                    <View>
                      <Button
                        title="Checkout: finissez sur un double"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                      />
                    </View>
                  </View>
                )}
                {activeTip === "multiplier" && (
                  <View style={{ gap: 6 }}>
                    <View>
                      <Button
                        title="Simple (S): valeur x1"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                      />
                    </View>
                    <View>
                      <Button
                        title="Double (D): valeur x2"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                      />
                    </View>
                    <View>
                      <Button
                        title="Triple (T): valeur x3"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                      />
                    </View>
                  </View>
                )}
                {activeTip === "undo" && (
                  <View style={{ gap: 6 }}>
                    <View>
                      <Button
                        title="Supprimer la dernière fléchette"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                      />
                    </View>
                    <View>
                      <Button
                        title="Annuler un tour (si bust)"
                        onPress={() => {}}
                        variant="outline"
                        size="sm"
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
              <Button
                title="Plus tard"
                onPress={closeOnboardingLater}
                variant="outline"
                size="md"
                style={{ flex: 1 }}
              />
              <Button
                title="J'ai compris"
                onPress={confirmOnboarding}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </PageTransition>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 32,
    gap: 24,
  },
  image: {
    width: screenWidth,
    height: screenHeight,
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.8,
    width: "105%",
    height: "100%",
    marginLeft: "-5%",
    marginTop: "-5%",
  },
  button: {
    width: "100%",
    maxWidth: 300,
  },
});
