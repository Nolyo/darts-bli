import { Container, View } from "../../components/Themed";
import { StyleSheet, Dimensions } from "react-native";
import React from "react";
import { ImageBackground } from "react-native";
import { Button } from "../../components/ui/Button";
import { router } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function TabOneScreen() {
  return (
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
    </ImageBackground>
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
