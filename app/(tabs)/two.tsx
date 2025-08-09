import { StyleSheet } from "react-native";
import { Container, Text, View } from "../../components/Themed";
import { PageTransition } from "../../components/ui/PageTransition";

export default function TabTwoScreen() {
  return (
    <PageTransition>
      <Container style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🎮</Text>
          <Text style={styles.title}>Nouveau jeu</Text>
          <Text style={styles.subtitle}>Bientôt disponible</Text>
          <Text style={styles.description}>
            Un nouveau jeu passionnant arrivera prochainement !
          </Text>
          <View style={styles.statusContainer}>
            <Text style={styles.status}>🚧 En développement</Text>
          </View>
        </View>
      </Container>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.7,
  },
  statusContainer: {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 165, 0, 0.3)",
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff6b00",
  },
});
