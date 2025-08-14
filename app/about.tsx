import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, ScrollView } from "react-native";

import { Container, Text, View } from "../components/Themed";
import { useNavigation, router } from "expo-router";
import { useEffect } from "react";
import { PageTransition } from "../components/ui/PageTransition";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import * as Updates from "expo-updates";
let AppModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AppModule = require("expo-application");
} catch (e) {
  AppModule = null;
}

export default function AboutScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: "A propos de l'App" });
  }, [navigation]);

  const skills = [
    "Expo",
    "React Native",
    "TypeScript",
    "IA: DALL·E 3 (logo), Claude 4, GPT-5",
  ];

  return (
    <PageTransition direction="bottom">
      <Container
        style={{
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <Text style={styles.title}>À propos</Text>
            <Text style={{ opacity: 0.7, marginTop: 6, textAlign: "center" }}>
              Dart's Bli — compagnon de fléchettes
            </Text>
          </View>

          <Card variant="elevated" style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>
              📱 Application
            </Text>
            <Text>
              Version actuelle : 1.1.0 (Beta) ({Platform.OS.toLocaleUpperCase()}
              )
            </Text>
            <View style={styles.list}>
              <View style={styles.item}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.item}>
                  Runtime: {Updates.runtimeVersion || "inconnue"}
                </Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.item}>
                  Channel: {Updates.channel || "non défini"}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.item}>
                  Build: {AppModule?.nativeBuildVersion || "inconnu"}
                </Text>
              </View>
              {Updates.updateId ? (
                <View style={styles.item}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.item}>
                    Update ID: {String(Updates.updateId).slice(0, 10)}...
                  </Text>
                </View>
              ) : (
                <View style={styles.item}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.item}>Update: embedded</Text>
                </View>
              )}
            </View>
          </Card>

          <Card variant="outlined" style={{ marginBottom: 16, padding: 10 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>
              🛠️ Technologies
            </Text>
            <View style={styles.list}>
              {skills.map((item, index) => (
                <View key={index} style={styles.item}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card variant="elevated" style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 12 }}>
              🔗 Liens rapides
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                flexWrap: "wrap",
                backgroundColor: "transparent",
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                title="Réglages"
                variant="outline"
                size="md"
                onPress={() => router.push("/settings")}
              />
              <Button
                title="Nouvelle partie"
                variant="primary"
                size="md"
                onPress={() => router.push("/game/new")}
              />
              <Button
                title="Parties sauvegardées"
                variant="secondary"
                size="md"
                onPress={() => router.push("/game/find")}
              />
            </View>
          </Card>

          <Card
            variant="outlined"
            style={{
              marginBottom: 16,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>
              Made with ❤️ by <Text style={{ fontWeight: "bold" }}>Nolyo</Text>
            </Text>
          </Card>

          <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        </ScrollView>
      </Container>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  text: {
    margin: 20,
    fontSize: 16,
    textAlign: "center",
  },

  // Styles ajoutés pour la liste
  list: {
    marginTop: 12,
    gap: 8,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    backgroundColor: "rgb(53, 53, 53)",
    borderRadius: 10,
  },
  bullet: {
    fontSize: 18,
    marginRight: 8,
    color: "#4F46E5", // joli violet
  },
  listText: {
    fontSize: 16,
    color: "#ffffff",
  },
});
