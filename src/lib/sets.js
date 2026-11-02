// 세트 결과 보관 + 단계(tier) 배정. Matching/Paragraph 공통. 세트 1은 진단 점수로, 세트 2·3은 직전 세트 결과로 정함.
import { tierFromDiagnostic, nextTier } from "./tiers";
import { diagnosticScore } from "./records";
const KEY = "wl.sets.v1";
const safe = (fn, d) => { try { return fn(); } catch { return d; } };
const readAll = () => safe(() => JSON.parse(localStorage.getItem(KEY) ?? "{}"), {});
const k = (activity, unit, setIdx) => `${activity}:${unit}:${setIdx}`;

/** 세트 결과 저장: { tier, correct, afterChallengeUp } */
export function saveSetResult(activity, unit, setIdx, res) {
  const all = readAll(); all[k(activity, unit, setIdx)] = res;
  safe(() => localStorage.setItem(KEY, JSON.stringify(all)));
}
export const getSetResult = (activity, unit, setIdx) => readAll()[k(activity, unit, setIdx)] ?? null;

/** setIdx(0~2)번째 세트에서 시작할 단계. */
export function tierForSet(activity, unit, setIdx, diagnosticKind, wordIds) {
  if (setIdx === 0) return tierFromDiagnostic(diagnosticKind, diagnosticScore(wordIds, diagnosticKind));
  const prev = getSetResult(activity, unit, setIdx - 1);
  if (prev) return nextTier(activity, prev);
  return tierFromDiagnostic(diagnosticKind, diagnosticScore(wordIds, diagnosticKind)); // 앞 세트를 건너뛰고 들어온 경우
}
