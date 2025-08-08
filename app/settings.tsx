import { StyleSheet, useColorScheme, ScrollView } from "react-native";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Container, Text, View } from "../components/Themed";
import { Card } from "../components/ui/Card";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { bluePrimary } from "../constants/Css";
import { useGameStore } from "../stores/gameStore";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const currentTheme = useColorScheme();
  const isDark = currentTheme === "dark";
  const checkoutHelpEnabled =
    (useGameStore() as any).checkoutHelpEnabled ?? true;
  const hapticsEnabled = (useGameStore() as any).hapticsEnabled ?? false;
  const soundsEnabled = (useGameStore() as any).soundsEnabled ?? true;
  const preferDarkTheme = (useGameStore() as any).preferDarkTheme ?? false;
  const setCheckoutHelpEnabled = (useGameStore() as any)
    .setCheckoutHelpEnabled as (b: boolean) => void;
  const setHapticsEnabled = (useGameStore() as any).setHapticsEnabled as (
    b: boolean
  ) => void;
  const setSoundsEnabled = (useGameStore() as any).setSoundsEnabled as (
    b: boolean
  ) => void;
  const setPreferDarkTheme = (useGameStore() as any).setPreferDarkTheme as (
    b: boolean
  ) => void;

  // Styles dynamiques selon le thème
  const dynamicStyles = {
    settingItem: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.02)",
    },
    aboutContainer: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.02)",
    },
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
  };

  useEffect(() => {
    navigation.setOptions({ title: "Réglages" });
  }, [navigation]);

  return (
    <Container style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Réglages</Text>
          <Text style={styles.subtitle}>
            Personnalisez votre expérience de jeu
          </Text>
        </View>

        {/* Section Jeu */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Paramètres de jeu</Text>

          <View style={[styles.settingItem, dynamicStyles.settingItem]}>
            <View style={styles.settingItemContent}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>
                  Aide au checkout (finir plus vite)
                </Text>
                <Text style={styles.settingDescription}>
                  Affiche des suggestions de flèches pour terminer (double-out)
                </Text>
              </View>
              <BouncyCheckbox
                isChecked={checkoutHelpEnabled}
                onPress={(checked: boolean) => setCheckoutHelpEnabled(checked)}
                fillColor={bluePrimary}
                unfillColor="transparent"
                iconStyle={{ borderColor: bluePrimary, borderWidth: 2 }}
                innerIconStyle={{ borderWidth: 2 }}
                size={24}
                disableText
              />
            </View>
          </View>

          <View style={[styles.settingItem, dynamicStyles.settingItem]}>
            <View style={styles.settingItemContent}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Haptics</Text>
                <Text style={styles.settingDescription}>
                  Vibrations à l’impact et aux notifications
                </Text>
              </View>
              <BouncyCheckbox
                isChecked={hapticsEnabled}
                onPress={(checked: boolean) => setHapticsEnabled(checked)}
                fillColor={bluePrimary}
                unfillColor="transparent"
                iconStyle={{ borderColor: bluePrimary, borderWidth: 2 }}
                innerIconStyle={{ borderWidth: 2 }}
                size={24}
                disableText
              />
            </View>
          </View>
        </Card>

        {/* Section Apparence */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Apparence</Text>

          <View style={[styles.settingItem, dynamicStyles.settingItem]}>
            <View style={styles.settingItemContent}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Mode sombre</Text>
                <Text style={styles.settingDescription}>
                  Basculer entre le thème clair et sombre
                </Text>
              </View>
              <BouncyCheckbox
                isChecked={currentTheme === "dark"}
                onPress={() => {}}
                fillColor={bluePrimary}
                unfillColor="transparent"
                iconStyle={{ borderColor: bluePrimary, borderWidth: 2 }}
                innerIconStyle={{ borderWidth: 2 }}
                size={24}
                disableText
                disabled
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Thème sombre par défaut (app):
            </Text>
          </View>

          <View style={[styles.settingItem, dynamicStyles.settingItem]}>
            <View style={styles.settingItemContent}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>
                  Activer le thème sombre par défaut
                </Text>
                <Text style={styles.settingDescription}>
                  Utiliser le thème sombre dès le lancement (si supporté)
                </Text>
              </View>
              <BouncyCheckbox
                isChecked={preferDarkTheme}
                onPress={(checked: boolean) => setPreferDarkTheme(checked)}
                fillColor={bluePrimary}
                unfillColor="transparent"
                iconStyle={{ borderColor: bluePrimary, borderWidth: 2 }}
                innerIconStyle={{ borderWidth: 2 }}
                size={24}
                disableText
              />
            </View>
          </View>
        </Card>

        {/* Section À propos */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ À propos</Text>

          <View style={[styles.aboutContainer, dynamicStyles.aboutContainer]}>
            <View
              style={[
                styles.aboutItem,
                { borderBottomColor: dynamicStyles.borderColor },
              ]}
            >
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.1.0 (Beta)</Text>
            </View>

            <View style={[styles.aboutItem, styles.aboutItemLast]}>
              <Text style={styles.aboutLabel}>Développé avec</Text>
              <Text style={styles.aboutValue}>React Native + Expo</Text>
            </View>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎯 Dart's Bli - Votre compagnon de fléchettes
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 4, // Léger retrait pour l'ombre
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  settingItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.15)",
  },
  infoText: {
    fontSize: 13,
    color: "#3b82f6",
    lineHeight: 18,
  },
  aboutContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  aboutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  aboutLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  aboutValue: {
    fontSize: 16,
    opacity: 0.7,
  },
  aboutItemLast: {
    borderBottomWidth: 0,
  },
  footer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: "center",
  },
});
