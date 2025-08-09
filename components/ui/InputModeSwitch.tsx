import React, { useMemo } from "react";
import { Pressable, StyleSheet, View, useColorScheme } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export type InputMode = "grid" | "board";

interface InputModeSwitchProps {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}

export const InputModeSwitch: React.FC<InputModeSwitchProps> = ({
  mode,
  onChange,
}) => {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const colors = useMemo(
    () => ({
      track: isDark ? "#0f172a" : "#e5e7eb",
      thumb: isDark ? "#111827" : "#ffffff",
      active: isDark ? "#ffffff" : "#111827",
      inactive: isDark ? "#6b7280" : "#9ca3af",
      border: isDark ? "#334155" : "#cbd5e1",
      gridBg: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.18)",
      gridAccent: "#10b981",
      boardBg: isDark ? "rgba(59,130,246,0.20)" : "rgba(59,130,246,0.20)",
      boardAccent: "#3b82f6",
    }),
    [isDark]
  );

  const isBoard = mode === "board";
  const thumbLeft = isBoard ? 52 : 4; // positions du pouce

  const handleToggle = () => {
    onChange(isBoard ? "grid" : "board");
  };

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isBoard }}
      onPress={handleToggle}
      style={[
        styles.track,
        { backgroundColor: colors.track, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.side,
          !isBoard
            ? { backgroundColor: colors.gridBg, borderColor: colors.gridAccent }
            : null,
        ]}
      >
        <FontAwesome
          name="th"
          size={16}
          color={!isBoard ? colors.gridAccent : colors.inactive}
        />
      </View>
      <View
        style={[
          styles.side,
          isBoard
            ? {
                backgroundColor: colors.boardBg,
                borderColor: colors.boardAccent,
              }
            : null,
        ]}
      >
        <FontAwesome
          name="bullseye"
          size={16}
          color={isBoard ? colors.boardAccent : colors.inactive}
        />
      </View>
      <View
        style={[
          styles.thumb,
          {
            left: thumbLeft,
            backgroundColor: colors.thumb,
            borderColor: isBoard ? colors.boardAccent : colors.gridAccent,
          },
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 96,
    height: 36,
    borderRadius: 20,
    borderWidth: 1,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  side: {
    width: 44,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
  },
  thumb: {
    position: "absolute",
    top: 4,
    width: 40,
    height: 28,
    borderRadius: 16,
    borderWidth: 1,
  },
});
