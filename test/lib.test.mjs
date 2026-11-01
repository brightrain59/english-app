import assert from "node:assert/strict";
import { tierFromDiagnostic, nextTier } from "../src/lib/tiers.js";
import { parseBlanks } from "../src/lib/data.js";
import { audioPath, matchingSentence, paragraphReadText } from "../src/lib/audio.js";
// 진단 → 첫 세트 단계
assert.equal(tierFromDiagnostic("classification", 15), 3); assert.equal(tierFromDiagnostic("classification", 12), 3);
assert.equal(tierFromDiagnostic("classification", 11), 2); assert.equal(tierFromDiagnostic("analogy", 8), 2);
assert.equal(tierFromDiagnostic("analogy", 7), 1); assert.equal(tierFromDiagnostic("analogy", 0), 1);
assert.equal(tierFromDiagnostic("analogy", null), 2);
// 세트 간 조정
assert.equal(nextTier("matching", { tier: 2, correct: 3 }), 3); assert.equal(nextTier("matching", { tier: 3, correct: 4 }), 3);
assert.equal(nextTier("matching", { tier: 2, correct: 2 }), 2); assert.equal(nextTier("matching", { tier: 2, correct: 1 }), 1);
assert.equal(nextTier("matching", { tier: 1, correct: 0 }), 1);
assert.equal(nextTier("paragraph", { tier: 2, correct: 4 }), 3); assert.equal(nextTier("paragraph", { tier: 2, correct: 3 }), 2);
assert.equal(nextTier("paragraph", { tier: 2, correct: 2 }), 1);
assert.equal(nextTier("paragraph", { tier: 1, correct: 5, afterChallengeUp: true }), 1); // 도전 직후 점수는 무시
assert.equal(nextTier("matching", null), 2);
// 빈칸 분해
const p = parseBlanks("I [[ride]] a [[gift]]. We [[practiced:practice]] daily.");
assert.deepEqual(p.filter(x => x.type === "blank").map(x => [x.answer, x.lemma]), [["ride", "ride"], ["gift", "gift"], ["practiced", "practice"]]);
assert.equal(paragraphReadText("We [[practiced:practice]] daily."), "We practiced daily.");
// 경로
assert.equal(audioPath.word(1, 1), "/audio/u001/w0001.mp3"); assert.equal(audioPath.example(37, 555), "/audio/u037/x0555.mp3");
assert.equal(audioPath.matching(2, 3, 1, 4), "/audio/u002/m_s3_t1_q4.mp3"); assert.equal(audioPath.paragraph(80, 1, 3), "/audio/u080/p_s1_t3.mp3");
assert.equal(matchingSentence("She is able to", "speak English well"), "She is able to speak English well.");
console.log("lib tests OK");
