import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleProp,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

type Direction = "right" | "left" | "bottom" | "top";

interface PageTransitionProps {
  children: ReactNode;
  durationMs?: number;
  direction?: Direction;
  style?: StyleProp<ViewStyle>;
  /**
   * Par défaut, les transitions natives sont gérées par React Navigation.
   * On n'active donc ce wrapper QUE sur le web, sauf si true.
   */
  enabledOnNative?: boolean;
}

function getInitialOffset(direction: Direction, width: number, height: number) {
  switch (direction) {
    case "right":
      return { axis: "x" as const, value: width };
    case "left":
      return { axis: "x" as const, value: -width };
    case "bottom":
      return { axis: "y" as const, value: height };
    case "top":
      return { axis: "y" as const, value: -height };
    default:
      return { axis: "x" as const, value: width };
  }
}

export function PageTransition({
  children,
  durationMs = 240,
  direction = "right",
  style,
  enabledOnNative = false,
}: PageTransitionProps) {
  const { width, height } = useWindowDimensions();

  // Sur natif, laisser React Navigation gérer les animations
  if (Platform.OS !== "web" && !enabledOnNative) {
    return <>{children}</>;
  }

  // Accessibilité: respect de prefers-reduced-motion sur le web
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  useEffect(() => {
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      "matchMedia" in window
    ) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(!!mq.matches);
      const listener = () => setReducedMotion(!!mq.matches);
      // @ts-ignore - addEventListener support varie selon environnements
      mq.addEventListener?.("change", listener);
      // @ts-ignore
      return () => mq.removeEventListener?.("change", listener);
    }
  }, []);
  if (reducedMotion) {
    return <>{children}</>;
  }

  const { axis, value } = getInitialOffset(direction, width, height);
  const translate = useRef(new Animated.Value(value)).current;
  const opacity = useRef(new Animated.Value(0.12)).current;

  useFocusEffect(
    React.useCallback(() => {
      // réinitialise avant l'animation d'entrée
      translate.setValue(value);
      opacity.setValue(0.12);

      Animated.parallel([
        Animated.timing(translate, {
          toValue: 0,
          duration: durationMs,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: durationMs,
          useNativeDriver: true,
        }),
      ]).start();

      // Pas d'animation de sortie (le routeur démonte immédiatement sur web)
      return () => {
        // reset léger pour éviter flash si la vue revient rapidement
        translate.setValue(value);
        opacity.setValue(0.12);
      };
    }, [value, durationMs, translate, opacity])
  );

  const animatedStyle: StyleProp<ViewStyle> = {
    flex: 1,
    opacity,
    transform:
      axis === "x" ? [{ translateX: translate }] : [{ translateY: translate }],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}

export default PageTransition;
