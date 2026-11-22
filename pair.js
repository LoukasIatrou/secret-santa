// Returns {giver: receiver} with nobody drawing themselves or an excluded pair, or null if impossible.
// ponytail: random shuffle + retry, fine for party-sized groups; switch to backtracking if groups get large and heavily constrained.
export function pair(names, exclusions = []) {
  const banned = new Set(exclusions.flatMap(([a, b]) => [`${a}\u0000${b}`, `${b}\u0000${a}`]));
  for (let attempt = 0; attempt < 10000; attempt++) {
    const r = [...names];
    for (let i = r.length - 1; i > 0; i--) {
      const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [r[i], r[j]] = [r[j], r[i]];
    }
    if (names.every((g, i) => g !== r[i] && !banned.has(`${g}\u0000${r[i]}`)))
      return Object.fromEntries(names.map((g, i) => [g, r[i]]));
  }
  return null;
}

// Link payloads: reversed base64 so a glance at the URL doesn't spoil anything (not real secrecy).
export const encode = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).split("").reverse().join("");
export const decode = (s) => JSON.parse(decodeURIComponent(escape(atob(s.split("").reverse().join("")))));
