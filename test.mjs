import assert from "node:assert";
import { pair, encode, decode } from "./pair.js";

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
console.log("ok");
