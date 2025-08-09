import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  LayoutChangeEvent,
  GestureResponderEvent,
} from "react-native";
import { resolveHit, STANDARD_SECTORS } from "../../utils/dartboard";

interface DartTargetProps {
  onResolveHit: (score: number, multiplier: number) => void;
  disabled?: boolean;
}

// Cible interactive (sans SVG) suffisamment grande, avec anneaux visibles
export const DartTarget: React.FC<DartTargetProps> = ({
  onResolveHit,
  disabled = false,
}) => {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const containerRef = useRef<View>(null);
  const [size, setSize] = useState<number>(0);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    const h = e.nativeEvent.layout.height;
    const s = Math.min(w, h);
    setSize(s);
  }, []);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (disabled || size <= 0) return;

      // Sur iOS/Android, locationX/Y existent. Sur Web, fallback avec pageX/pageY - mesure du conteneur
      const anyEvt: any = e.nativeEvent as any;
      const hasLocal =
        typeof anyEvt.locationX === "number" &&
        typeof anyEvt.locationY === "number";

      if (hasLocal) {
        const { score, multiplier } = resolveHit(
          anyEvt.locationX,
          anyEvt.locationY,
          size,
          size
        );
        onResolveHit(score, multiplier);
        return;
      }

      // Fallback Web
      const pageX: number | undefined = anyEvt.pageX ?? anyEvt.clientX;
      const pageY: number | undefined = anyEvt.pageY ?? anyEvt.clientY;
      if (typeof pageX !== "number" || typeof pageY !== "number") return;

      containerRef.current?.measure?.((x, y, width, height, px, py) => {
        const localX = pageX - (px ?? 0);
        const localY = pageY - (py ?? 0);
        const w = typeof width === "number" && width > 0 ? width : size;
        const h = typeof height === "number" && height > 0 ? height : size;
        const lx = Number.isFinite(localX) ? localX : 0;
        const ly = Number.isFinite(localY) ? localY : 0;
        const { score, multiplier } = resolveHit(lx, ly, w, h);
        onResolveHit(score, multiplier);
      });
    },
    [disabled, size, onResolveHit]
  );

  const colors = useMemo(
    () => ({
      background: isDark ? "#0b1220" : "#f3f4f6",
      ring: isDark ? "#334155" : "#cbd5e1",
      // Convention simple: triple rouge, double vert
      double: "#10b981",
      triple: "#ef4444",
      single: isDark ? "#10b981" : "#059669",
      bull25: "#3b82f6",
      bull50: isDark ? "#93c5fd" : "#2563eb",
      sectorLine: isDark ? "rgba(148,163,184,0.35)" : "rgba(30,41,59,0.35)",
      number: isDark ? "#e5e7eb" : "#111827",
    }),
    [isDark]
  );

  const labelFontSize = useMemo(
    () => Math.max(11, Math.min(18, size * 0.06)),
    [size]
  );

  return (
    <View style={styles.wrapper}>
      <View
        ref={containerRef}
        onLayout={handleLayout}
        style={[
          styles.board,
          { backgroundColor: colors.background },
          Platform.OS === "web" ? ({ userSelect: "none" } as any) : null,
        ]}
      >
        {/* Anneaux (visuels simples, non contractuels) */}
        <View
          style={[
            styles.circle,
            styles.singleArea,
            { borderColor: colors.single },
          ]}
        />
        <View
          style={[
            styles.ring,
            styles.tripleRing,
            { borderColor: colors.triple },
          ]}
        />
        <View
          style={[
            styles.ring,
            styles.doubleRing,
            { borderColor: colors.double },
          ]}
        />
        {/* Traits de séparation des 20 secteurs */}
        {size > 0 &&
          Array.from({ length: 20 }).map((_, i) => {
            const lineHeight = size * 0.96;
            const top = size / 2 - lineHeight / 2;
            const left = size / 2 - 1; // largeur 2px
            // Lignes = frontières des secteurs (tous les 18°), décalées de +9°
            // pour que le centre du 20 soit pile au nord (aucune ligne à 0°)
            const angle = i * 18 + 9;
            return (
              <View
                key={`sector-line-${i}`}
                style={[
                  styles.sectorLine,
                  {
                    height: lineHeight,
                    top,
                    left,
                    backgroundColor: colors.sectorLine,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}
        {/* Numéros des secteurs */}
        {size > 0 &&
          STANDARD_SECTORS.map((num, i) => {
            const cx = size / 2;
            const cy = size / 2;
            // Centre du secteur i (20=0) : 0°, 18°, 36° ...
            const deg = i * 18;
            const rad = (deg * Math.PI) / 180;
            const w = Math.max(24, labelFontSize + 8);
            const h = Math.max(20, labelFontSize + 6);
            // Placer le label au-dessus de la zone double, quitte à déborder un peu
            const R = size / 2;
            const padding = Math.max(8, labelFontSize / 2 + 2);
            const rLabel = R * 0.97 + padding * 0.4; // 0.97 = doubleOuterRadius → léger débordement
            const x = cx + rLabel * Math.sin(rad);
            const y = cy - rLabel * Math.cos(rad);
            return (
              <View
                key={`label-${num}-${i}`}
                style={[
                  styles.label,
                  {
                    width: w,
                    height: h,
                    left: x - w / 2,
                    top: y - h / 2,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.number,
                    fontSize: labelFontSize,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  {num}
                </Text>
              </View>
            );
          })}
        <View style={[styles.bull25, { backgroundColor: colors.bull25 }]} />
        <View style={[styles.bull50, { backgroundColor: colors.bull50 }]} />
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          style={[
            StyleSheet.absoluteFillObject,
            Platform.OS === "web" ? ({ cursor: "pointer" } as any) : null,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  board: {
    width: "92%",
    aspectRatio: 1,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(148,163,184,0.4)",
  },
  circle: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 2,
  },
  ring: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 12,
  },
  sectorLine: {
    position: "absolute",
    width: 2,
    borderRadius: 9999,
  },
  singleArea: {
    // grande zone centrale (simple) pour faciliter le clic
    width: "96%",
    height: "96%",
  },
  tripleRing: {
    // Diamètre ≈ moyenne (tripleInner=0.52, tripleOuter=0.62) → 0.57
    width: "57%",
    height: "57%",
  },
  doubleRing: {
    // Diamètre ≈ moyenne (doubleInner=0.87, doubleOuter=0.97) → 0.92
    width: "92%",
    height: "92%",
  },
  bull25: {
    position: "absolute",
    // Diamètre p=0.12 → 12%
    width: "12%",
    height: "12%",
    borderRadius: 9999,
  },
  bull50: {
    position: "absolute",
    // Diamètre p=0.06 → 6%
    width: "6%",
    height: "6%",
    borderRadius: 9999,
  },
  label: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
