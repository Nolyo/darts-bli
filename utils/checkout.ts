export type FinishType = "classic" | "double";

type Hit = {
  label: string; // ex: T20, D20, 20, Bull
  value: number; // points scored by this hit
  isDouble: boolean;
};

const singles: Hit[] = Array.from({ length: 20 }, (_, i) => i + 1)
  .reverse()
  .map((n) => ({ label: `${n}`, value: n, isDouble: false }))
  .concat([{ label: "25", value: 25, isDouble: false }]);

const triples: Hit[] = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10].map(
  (n) => ({ label: `T${n}`, value: 3 * n, isDouble: false })
);

const doubles: Hit[] = Array.from({ length: 20 }, (_, i) => i + 1)
  .map((n) => ({ label: `D${n}`, value: 2 * n, isDouble: true }))
  .reverse();

const bull: Hit = { label: "Bull", value: 50, isDouble: true };

// Ordered preference of first/second darts for route search
const preferredFirstHits: Hit[] = [
  ...triples,
  ...singles,
  { ...bull, isDouble: false },
];

function canFinishWithLastDart(
  target: number,
  finishType: FinishType
): Hit | null {
  if (finishType === "double") {
    if (target === 50) return bull;
    const d = doubles.find((h) => h.value === target);
    return d ?? null;
  }

  // classic: any exact hit works
  if (target === 50) return bull;
  const t = triples.find((h) => h.value === target);
  if (t) return t;
  const s = singles.find((h) => h.value === target);
  if (s) return s;
  const d = doubles.find((h) => h.value === target);
  return d ?? null;
}

export function getCheckoutSuggestions(
  remaining: number,
  finishType: FinishType
): string[][] {
  // Guardrails
  if (remaining < 2) return [];
  if (finishType === "double" && remaining > 170) return [];
  if (finishType === "classic" && remaining > 170) return [];

  const suggestions: string[][] = [];

  // 1 dart finish
  const one = canFinishWithLastDart(remaining, finishType);
  if (one) suggestions.push([one.label]);

  // 2 darts finish: first any, last must match
  for (const first of preferredFirstHits) {
    const rem = remaining - first.value;
    if (rem <= 0) continue;
    const last = canFinishWithLastDart(rem, finishType);
    if (last) suggestions.push([first.label, last.label]);
    if (suggestions.length >= 5) break;
  }
  if (suggestions.length >= 5) return dedupeRoutes(suggestions).slice(0, 5);

  // 3 darts finish: first, second any, last must match
  for (const first of preferredFirstHits) {
    const rem1 = remaining - first.value;
    if (rem1 <= 0) continue;
    for (const second of preferredFirstHits) {
      const rem2 = rem1 - second.value;
      if (rem2 <= 0) continue;
      const last = canFinishWithLastDart(rem2, finishType);
      if (last) suggestions.push([first.label, second.label, last.label]);
      if (suggestions.length >= 8) break;
    }
    if (suggestions.length >= 8) break;
  }

  return dedupeRoutes(suggestions).slice(0, 8);
}

function dedupeRoutes(routes: string[][]): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const r of routes) {
    const key = r.join("-");
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  }
  return out;
}

export function formatSuggestion(route: string[]): string {
  return route.join(" • ");
}
