import React from "react";
import { View, StyleSheet, Text, useColorScheme } from "react-native";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface MultiplierSelectorProps {
  dartScore: number;
  onMultiplierSelect: (multiplier: number) => void;
  visible: boolean;
}

export const MultiplierSelector: React.FC<MultiplierSelectorProps> = ({
  dartScore,
  onMultiplierSelect,
  visible,
}) => {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  if (!visible) return null;

  const canHaveMultipliers =
    dartScore !== 25 && dartScore !== 50 && dartScore !== 0;
  const displayScore = dartScore === 50 ? "Bull" : dartScore.toString();

  const multipliers = [
    { value: 1, label: "Simple", color: "#10b981" },
    { value: 2, label: "Double", color: "#f59e0b" },
    { value: 3, label: "Triple", color: "#ef4444" },
  ];

  const availableMultipliers = canHaveMultipliers
    ? multipliers
    : [multipliers[0]]; // Only simple for special scores

  return (
    <View style={styles.container}>
      <Card style={styles.card} variant="elevated">
        <Text
          style={[styles.scoreText, { color: isDark ? "#ffffff" : "#111827" }]}
        >
          {displayScore}
        </Text>
        <Text
          style={[styles.subtitle, { color: isDark ? "#d1d5db" : "#6b7280" }]}
        >
          Choisissez le multiplicateur
        </Text>

        <View style={styles.multiplierGrid}>
          {availableMultipliers.map((multiplier) => (
            <Button
              key={multiplier.value}
              title={multiplier.label}
              onPress={() => onMultiplierSelect(multiplier.value)}
              style={[
                styles.multiplierButton,
                { backgroundColor: multiplier.color },
              ]}
              textStyle={styles.multiplierButtonText}
            />
          ))}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
    zIndex: 10,
  },
  card: {
    minWidth: 280,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  multiplierGrid: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  multiplierButton: {
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  multiplierButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
