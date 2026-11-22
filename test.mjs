import assert from "node:assert";
import { pair, encode, decode, lock, unlock } from "./pair.js";

const names = ["Ana", "Ben", "Cleo", "Dimitris", "Eli"];
for (let k = 0; k < 500; k++) {
  const p = pair(names, [["Ana", "Ben"]]);
  assert.deepStrictEqual(Object.keys(p).sort(), [...names].sort());
  assert.deepStrictEqual(Object.values(p).sort(), [...names].sort());
  for (const [g, r] of Object.entries(p)) assert.notStrictEqual(g, r);
  assert.ok(p.Ana !== "Ben" && p.Ben !== "Ana");
}
assert.strictEqual(pair(["A", "B"], [["A", "B"]]), null);
assert.deepStrictEqual(decode(encode({ g: "Ζωή 🎄", r: "Ben" })), { g: "Ζωή 🎄", r: "Ben" });
const locked = await lock({ p: { Ζωή: "Ben" } }, "koz2026 ");
assert.deepStrictEqual(await unlock(locked, "KOZ2026"), { p: { Ζωή: "Ben" } });
await assert.rejects(unlock(locked, "wrong"));
console.log("ok");
