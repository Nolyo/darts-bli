import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";

import { Container, Text, View } from "../components/Themed";
import Separator from "../components/Separator";
import { useNavigation } from "expo-router";
import { useEffect } from "react";

export default function AboutScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: "A propos de l'App" });
  }, [navigation]);

  return (
    <Container>
      <Text style={styles.title}>A propos</Text>
      <Separator />

      <Text style={styles.text}>
        Cette application est un projet personnel de développement d'une
        application mobile.
      </Text>
      <Text
        style={[
          styles.text,
          {
            fontWeight: "bold",
            textDecorationStyle: "solid",
            textDecorationColor: "#ccc",
            textDecorationLine: "underline",
            marginBottom: 5,
          },
        ]}
      >
        Librairie utilisée :
      </Text>
      <View style={{ flexDirection: "column" }}>
        <Text>- Expo</Text>
        <Text>- React Native</Text>
        <Text>- Typescript</Text>
        <Text>- IA (DALL.E 3 logo, Claude 4 et GPT 5 pour le code)</Text>
      </View>
      <Text style={styles.text}>
        Version actuelle :1.1.0 (Beta) ({Platform.OS.toLocaleUpperCase()})
      </Text>
      <Text style={styles.text}>
        Made with ❤️ by <Text style={{ fontWeight: "bold" }}>Nolyo</Text>
      </Text>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Container>
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
});
