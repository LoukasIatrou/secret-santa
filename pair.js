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

// Code-locked group links: AES-GCM with a key derived from the group code. Wrong code => unlock throws.
const te = new TextEncoder();
const b64 = (u) => btoa(String.fromCharCode(...u)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
async function keyFor(code, salt) {
  const base = await crypto.subtle.importKey("raw", te.encode(code.trim().toUpperCase()), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
export async function lock(obj, code) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFor(code, salt), te.encode(JSON.stringify(obj)));
  return "k." + b64(new Uint8Array([...salt, ...iv, ...new Uint8Array(ct)]));
}
export async function unlock(s, code) {
  const u = unb64(s.slice(2));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: u.slice(16, 28) }, await keyFor(code, u.slice(0, 16)), u.slice(28));
  return JSON.parse(new TextDecoder().decode(pt));
}
