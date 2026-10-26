// Búsqueda con tolerancia a errores de tipeo (Levenshtein por token)

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const prev = new Array<number>(b.length + 1);
  const cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export { normalize as normalizeQuery };

// Sugiere una corrección si la consulta no encaja con el vocabulario
export function suggestCorrection(
  query: string,
  vocabulary: string[],
  maxDistance = 2
): string | null {
  const qTokens = normalize(query).split(" ").filter(Boolean);
  if (!qTokens.length) return null;
  const vocabTokens = new Set<string>();
  for (const v of vocabulary) {
    for (const t of normalize(v).split(" ")) {
      if (t.length >= 3) vocabTokens.add(t);
    }
  }
  const vocabList = Array.from(vocabTokens);
  if (!vocabList.length) return null;

  let changed = false;
  const fixed = qTokens.map((token) => {
    if (token.length < 3 || vocabList.includes(token)) return token;
    let best = token;
    let bestDist = Infinity;
    for (const cand of vocabList) {
      if (Math.abs(cand.length - token.length) > maxDistance) continue;
      const d = levenshtein(token, cand);
      if (d < bestDist) {
        bestDist = d;
        best = cand;
      }
    }
    if (bestDist <= maxDistance && best !== token) {
      changed = true;
      return best;
    }
    return token;
  });

  return changed ? fixed.join(" ") : null;
}
