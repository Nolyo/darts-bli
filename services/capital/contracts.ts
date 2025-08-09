import { DartsType } from "../../types";
import { STANDARD_SECTORS } from "../../utils/dartboard";

export type CapitalContractKey =
  | "S20"
  | "TRIPLE"
  | "S19"
  | "DOUBLE"
  | "S18"
  | "SIDE_BY_SIDE"
  | "S17"
  | "SUITE"
  | "S16"
  | "COULEUR"
  | "S15"
  | "TOTAL_57"
  | "S14"
  | "CENTRE";

export interface CapitalContract {
  key: CapitalContractKey;
  label: string;
  description: string;
}

export const CAPITAL_CONTRACTS: CapitalContract[] = [
  { key: "S20", label: "20", description: "Toucher au moins un 20" },
  {
    key: "TRIPLE",
    label: "Triple",
    description: "Toucher au moins un triple (T)",
  },
  { key: "S19", label: "19", description: "Toucher au moins un 19" },
  {
    key: "DOUBLE",
    label: "Double",
    description: "Toucher au moins un double (D)",
  },
  { key: "S18", label: "18", description: "Toucher au moins un 18" },
  {
    key: "SIDE_BY_SIDE",
    label: "Side by Side",
    description: "Trois secteurs mitoyens (adjacents sur la cible)",
  },
  { key: "S17", label: "17", description: "Toucher au moins un 17" },
  {
    key: "SUITE",
    label: "Suite",
    description: "Trois numéros consécutifs (ex: 7-8-9)",
  },
  { key: "S16", label: "16", description: "Toucher au moins un 16" },
  {
    key: "COULEUR",
    label: "Couleur",
    description:
      "Trois fléchettes dans trois couleurs différentes (blanc, noir, rouge, vert)",
  },
  { key: "S15", label: "15", description: "Toucher au moins un 15" },
  {
    key: "TOTAL_57",
    label: "57",
    description: "Total de 57 points (avec 1 à 3 fléchettes)",
  },
  { key: "S14", label: "14", description: "Toucher au moins un 14" },
  { key: "CENTRE", label: "Centre", description: "Toucher le Bull (25 ou 50)" },
];

function getBoardIndexForNumber(n: number): number | null {
  const idx = STANDARD_SECTORS.indexOf(n);
  return idx >= 0 ? idx : null;
}

function isAdjacentTripletOnBoard(nums: number[]): boolean {
  // nums: three distinct numbers in [1..20]
  if (nums.length !== 3) return false;
  const idxs = nums
    .map((n) => getBoardIndexForNumber(n))
    .filter((i): i is number => i !== null)
    .sort((a, b) => a - b);
  if (idxs.length !== 3) return false;
  // Check circular adjacency: exists k s.t. (i, i+1, i+2) modulo 20
  for (let start = 0; start < 20; start++) {
    const a = start;
    const b = (start + 1) % 20;
    const c = (start + 2) % 20;
    const set = new Set([a, b, c]);
    if (set.has(idxs[0]) && set.has(idxs[1]) && set.has(idxs[2])) return true;
  }
  return false;
}

function isNumericSuite(nums: number[]): boolean {
  if (nums.length !== 3) return false;
  const s = [...new Set(nums)];
  if (s.length !== 3) return false;
  s.sort((a, b) => a - b);
  return s[1] === s[0] + 1 && s[2] === s[1] + 1;
}

type Color = "white" | "black" | "red" | "green";

function colorOfHit(
  score: number,
  multiplier: number,
  base: number | null
): Color | null {
  if (score === 50) return "red";
  if (score === 25) return "green";
  if (multiplier === 3) return "red";
  if (multiplier === 2) return "green";
  if (!base) return null;
  // Approximation: alterner blanc/noir selon l'index du secteur
  const idx = getBoardIndexForNumber(base);
  if (idx === null) return null;
  return idx % 2 === 0 ? "black" : "white";
}

function baseFromScore(score: number): number | null {
  if (score >= 1 && score <= 20) return score;
  return null; // 0, 25, 50 → pas un numéro de 1..20
}

export function evaluateContract(
  key: CapitalContractKey,
  darts: DartsType[]
): boolean {
  const bases: number[] = darts
    .map((d) => baseFromScore(d.score))
    .filter((n): n is number => n !== null);
  const multipliers = darts.map((d) => d.multiplier);
  const total = darts.reduce((acc, d) => acc + d.score * d.multiplier, 0);
  switch (key) {
    case "S20":
      return bases.includes(20);
    case "TRIPLE":
      return multipliers.includes(3);
    case "S19":
      return bases.includes(19);
    case "DOUBLE":
      return multipliers.includes(2);
    case "S18":
      return bases.includes(18);
    case "SIDE_BY_SIDE": {
      const uniq = [...new Set(bases)];
      if (uniq.length < 3) return false;
      // Essayer toutes les combinaisons de 3 distincts
      for (let i = 0; i < uniq.length; i++)
        for (let j = i + 1; j < uniq.length; j++)
          for (let k = j + 1; k < uniq.length; k++) {
            if (isAdjacentTripletOnBoard([uniq[i], uniq[j], uniq[k]]))
              return true;
          }
      return false;
    }
    case "S17":
      return bases.includes(17);
    case "SUITE": {
      const uniq = [...new Set(bases)];
      if (uniq.length < 3) return false;
      // Essayer combinaisons de 3
      for (let i = 0; i < uniq.length; i++)
        for (let j = i + 1; j < uniq.length; j++)
          for (let k = j + 1; k < uniq.length; k++) {
            if (isNumericSuite([uniq[i], uniq[j], uniq[k]])) return true;
          }
      return false;
    }
    case "S16":
      return bases.includes(16);
    case "COULEUR": {
      const colors: (Color | null)[] = darts.map((d) =>
        colorOfHit(d.score, d.multiplier, baseFromScore(d.score))
      );
      const uniq = new Set(colors.filter((c): c is Color => c !== null));
      return uniq.size >= 3;
    }
    case "S15":
      return bases.includes(15);
    case "TOTAL_57":
      return total === 57;
    case "S14":
      return bases.includes(14);
    case "CENTRE":
      return darts.some((d) => d.score === 25 || d.score === 50);
  }
}

export function computeContractPoints(
  key: CapitalContractKey,
  darts: DartsType[]
): number {
  const achieved = evaluateContract(key, darts);
  if (!achieved) return 0;
  if (key === "TOTAL_57") return 57;
  return darts.reduce((acc, d) => acc + d.score * d.multiplier, 0);
}

export function getContractForRound(roundIndex: number): CapitalContract {
  const idx = Math.max(0, Math.min(roundIndex, CAPITAL_CONTRACTS.length - 1));
  return CAPITAL_CONTRACTS[idx];
}
