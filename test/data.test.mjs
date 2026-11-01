import fs from "node:fs";
import assert from "node:assert/strict";
import { loadUnit } from "../src/lib/data.js";
import { audioPath } from "../src/lib/audio.js";
// 80개 단원이 모두 불러와지고, 대본 CSV(6,000줄)의 파일명과 앱이 계산하는 파일명이 일치하는지 확인
const csv = fs.readFileSync(process.argv[2], "utf8").split("\n").slice(1).filter(Boolean).map(l => l.match(/^"([^"]+)"/)[1]);
const expected = new Set(csv); const got = new Set();
for (let u = 1; u <= 80; u++) {
  const d = await loadUnit(u);
  assert.equal(d.words.length, 15); assert.equal(d.diagnostic.items.length, 15);
  assert.equal(d.diagnostic.kind, u % 2 ? "classification" : "analogy");
  assert.equal(d.matching.sets.length, 3); assert.equal(d.paragraph.sets.length, 3);
  const strip = p => p.replace(/^\/audio\//, "");
  for (const w of d.words) { got.add(strip(audioPath.word(u, w.id))); got.add(strip(audioPath.example(u, w.id))); }
  for (const s of d.matching.sets) for (const t of [1, 2, 3]) for (let q = 1; q <= 4; q++) got.add(strip(audioPath.matching(u, s.setNo, t, q)));
  for (const s of d.paragraph.sets) for (const t of [1, 2, 3]) got.add(strip(audioPath.paragraph(u, s.setNo, t)));
}
assert.equal(got.size, 6000); assert.equal(expected.size, 6000);
for (const f of expected) assert.ok(got.has(f), "앱에서 만들지 못하는 파일명: " + f);
console.log("data tests OK — 80 units, 6000 audio names match the script");
