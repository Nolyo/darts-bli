import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
} from "react-native";

interface ConfettiOverlayProps {
  visible: boolean;
  durationMs?: number; // durée d'une vague
  pieces?: number; // nombre de confettis
  onEnd?: () => void;
}

type ConfettiPiece = {
  x: number;
  size: number;
  color: string;
  delay: number;
  drift: number;
  rotate: Animated.Value;
  translateY: Animated.Value;
  translateX: Animated.Value;
};

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#eab308",
];

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({
  visible,
  durationMs = 2200,
  pieces = 60,
  onEnd,
}) => {
  const { width, height } = Dimensions.get("window");

  const confetti = useMemo<ConfettiPiece[]>(() => {
    const arr: ConfettiPiece[] = [];
    for (let i = 0; i < pieces; i++) {
      const x = Math.random() * width;
      const size = 6 + Math.random() * 6;
      const color = COLORS[i % COLORS.length];
      const delay = Math.random() * 300;
      const drift = (Math.random() - 0.5) * 60; // petite dérive horizontale
      arr.push({
        x,
        size,
        color,
        delay,
        drift,
        rotate: new Animated.Value(0),
        translateY: new Animated.Value(-40 - Math.random() * 80),
        translateX: new Animated.Value(x),
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, pieces]);

  const runningRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    if (runningRef.current) return;
    runningRef.current = true;

    const animations = confetti.map((p) => {
      return Animated.parallel([
        Animated.timing(p.translateY, {
          toValue: height + 60,
          duration: durationMs + Math.random() * 400,
          delay: p.delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(p.translateX, {
          toValue: p.x + p.drift,
          duration: durationMs + Math.random() * 400,
          delay: p.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 1,
          duration: durationMs + Math.random() * 400,
          delay: p.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(12, animations).start(() => {
      runningRef.current = false;
      onEnd?.();
    });
  }, [visible, durationMs, confetti, height, onEnd]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { zIndex: 9999, elevation: 9999 },
        Platform.OS === "web" ? ({ userSelect: "none" } as any) : null,
      ]}
    >
      {confetti.map((p, idx) => {
        const rotate = p.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: [
            "0deg",
            `${Math.random() > 0.5 ? "360deg" : "-360deg"}`,
          ],
        });
        return (
          <Animated.View
            key={idx}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size * 2,
              backgroundColor: p.color,
              borderRadius: 2,
              transform: [
                { translateX: p.translateX },
                { translateY: p.translateY },
                { rotate },
              ],
            }}
          />
        );
      })}
    </View>
  );
};
