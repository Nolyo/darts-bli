// Utilitaires pour gérer la logique de clic sur une cible de fléchettes
// Conversion coordonnées cartésiennes -> polaires puis résolution secteur/anneau

export interface DartResolution {
  score: number;
  multiplier: number; // 0 (miss), 1 (simple), 2 (double), 3 (triple)
}

// Ordre standard des secteurs dans le sens des aiguilles d'une montre en partant du 20 en haut
export const STANDARD_SECTORS: number[] = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

export interface ResolveHitOptions {
  // Seuils en proportion du rayon maximal (R)
  bull50Radius?: number; // 50 (inner bull)
  bull25Radius?: number; // 25 (outer bull)
  tripleInnerRadius?: number;
  tripleOuterRadius?: number;
  doubleInnerRadius?: number;
  doubleOuterRadius?: number;
}

const DEFAULT_OPTIONS: Required<ResolveHitOptions> = {
  bull50Radius: 0.06,
  bull25Radius: 0.12,
  // élargir légèrement les zones pour faciliter le tap
  tripleInnerRadius: 0.52,
  tripleOuterRadius: 0.62,
  doubleInnerRadius: 0.87,
  doubleOuterRadius: 0.97,
};

/**
 * Résout le score/multiplicateur d'un appui sur la cible.
 * x, y: coordonnées locales de l'appui dans le composant (origine en haut-gauche)
 * width, height: dimensions du composant (carré recommandé)
 */
export function resolveHit(
  x: number,
  y: number,
  width: number,
  height: number,
  options?: ResolveHitOptions
): DartResolution {
  const opts = { ...DEFAULT_OPTIONS, ...(options || {}) };

  // Garde-fous contre valeurs invalides
  if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
    return { score: 0, multiplier: 1 };
  }
  if (width <= 0 || height <= 0) {
    return { score: 0, multiplier: 1 };
  }

  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = cy - y; // axe Y vers le bas → on inverse pour avoir Y vers le haut

  const r = Math.hypot(dx, dy);
  const R = Math.min(cx, cy);
  if (!isFinite(r) || !isFinite(R) || R <= 0) {
    return { score: 0, multiplier: 1 };
  }
  const p = r / R; // rayon relatif [0..∞)

  // En dehors de la cible → "miss". On compte comme 0 (x1) pour rester cohérent avec une fléchette lancée.
  if (p > 1) {
    return { score: 0, multiplier: 1 };
  }

  // Angle en degrés, 0° en haut, sens horaire
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  // 0° en haut, sens horaire
  const fromTop = (90 - deg + 360) % 360;
  // Index via centre du secteur sans ligne à 0° : floor((fromTop + 9) / 18)
  const rawIndex = Math.floor((fromTop + 9) / 18);
  const sectorIndex = Number.isFinite(rawIndex)
    ? ((rawIndex % 20) + 20) % 20
    : 0; // clamp to [0,19]
  const base = STANDARD_SECTORS[sectorIndex] ?? 20;

  // Anneaux (priorité bull, puis double/triple)
  if (p <= opts.bull50Radius) return { score: 50, multiplier: 1 };
  if (p <= opts.bull25Radius) return { score: 25, multiplier: 1 };
  if (p >= opts.doubleInnerRadius && p <= opts.doubleOuterRadius)
    return { score: base, multiplier: 2 };
  if (p >= opts.tripleInnerRadius && p <= opts.tripleOuterRadius)
    return { score: base, multiplier: 3 };

  // Sinon simple
  return { score: base, multiplier: 1 };
}

/**
 * Renvoie des styles proportionnels pour dessiner des anneaux avec des `View` bordurées (sans SVG).
 * Utile pour donner un feedback visuel des zones de la cible.
 */
export function computeRingMetrics(
  size: number,
  pOuter: number,
  pInner: number
) {
  const outer = size * pOuter;
  const inner = size * pInner;
  const borderWidth = Math.max(1, (outer - inner) / 2);
  const diameter = outer * 2;
  const offset = size / 2 - outer;
  return { diameter, borderWidth, offset, radius: outer };
}
