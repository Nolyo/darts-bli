import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { useColorScheme } from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const useButtonStyles = () => {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const colors = {
    primary: "#0ea5e9",
    primaryText: "#ffffff",
    secondary: isDark ? "#374151" : "#f3f4f6",
    secondaryText: isDark ? "#ffffff" : "#111827",
    outline: isDark ? "rgba(0, 0, 0, 0.40)" : "rgba(255, 255, 255, 0.95)",
    outlineText: isDark ? "#ffffff" : "#111827",
    ghost: "transparent",
    ghostText: isDark ? "#ffffff" : "#111827",
    danger: "#ef4444",
    dangerText: "#ffffff",
    disabled: isDark ? "#4b5563" : "#d1d5db",
    disabledText: isDark ? "#9ca3af" : "#6b7280",
  };

  const sizes = {
    sm: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 14 },
    md: { paddingHorizontal: 16, paddingVertical: 10, fontSize: 16 },
    lg: { paddingHorizontal: 20, paddingVertical: 14, fontSize: 18 },
  };

  return { colors, sizes, isDark };
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  children,
}) => {
  const { colors, sizes, isDark } = useButtonStyles();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      ...sizes[size],
    };

    if (disabled || loading) {
      return {
        ...baseStyle,
        backgroundColor: colors.disabled,
        borderWidth: 0,
      };
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: colors.outline,
          borderWidth: 2,
          borderColor: isDark ? "#ffffff" : "#374151",
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: colors.ghost,
        };
      case "danger":
        return {
          ...baseStyle,
          backgroundColor: colors.danger,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: "600",
      fontSize: sizes[size].fontSize,
    };

    if (disabled || loading) {
      return {
        ...baseStyle,
        color: colors.disabledText,
      };
    }

    switch (variant) {
      case "primary":
        return { ...baseStyle, color: colors.primaryText };
      case "secondary":
        return { ...baseStyle, color: colors.secondaryText };
      case "outline":
        return { ...baseStyle, color: colors.outlineText };
      case "ghost":
        return { ...baseStyle, color: colors.ghostText };
      case "danger":
        return { ...baseStyle, color: colors.dangerText };
      default:
        return baseStyle;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && { opacity: 0.8 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={getTextStyle().color}
          style={{ marginRight: 8 }}
        />
      )}
      {children || <Text style={[getTextStyle(), textStyle]}>{title}</Text>}
    </Pressable>
  );
};
