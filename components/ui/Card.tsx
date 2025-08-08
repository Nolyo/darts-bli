import React from "react";
import { View, ViewStyle, useColorScheme, StyleProp } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "default",
  padding = "md",
}) => {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: isDark ? "#374151" : "#ffffff",
    };

    const paddingMap = {
      none: 0,
      sm: 12,
      md: 16,
      lg: 24,
    };

    const cardStyle: ViewStyle = {
      ...baseStyle,
      padding: paddingMap[padding],
    };

    switch (variant) {
      case "elevated":
        return {
          ...cardStyle,
          shadowColor: isDark ? "#000000" : "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case "outlined":
        return {
          ...cardStyle,
          borderWidth: 1,
          borderColor: isDark ? "#4b5563" : "#e5e7eb",
        };
      default:
        return cardStyle;
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
