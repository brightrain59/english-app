// 학습 기록 — 문항마다 한 줄(SCHEMA.md 4절). 지금은 localStorage, 나중에 서버로 바꿀 수 있게 이 파일만 고치면 됩니다.
const KEY = "wl.records.v1";
const safe = (fn, d) => { try { return fn(); } catch { return d; } };
export const readAll = () => safe(() => JSON.parse(localStorage.getItem(KEY) ?? "[]"), []);

/** { wordId, activity, tier, correct, attempt, ms? } — ms는 문항을 푸는 데 걸린 시간(제한 없이 기록만). */
export function addRecord(rec) {
  const all = readAll(); all.push({ ...rec, at: new Date().toISOString() });
  safe(() => localStorage.setItem(KEY, JSON.stringify(all)));
}
export const unitRecords = (wordIds, activity) => readAll().filter((r) => wordIds.includes(r.wordId) && (!activity || r.activity === activity));
/** 한 단원의 진단 점수: 문항별 첫 시도 정답 수. 기록이 없으면 null. */
export function diagnosticScore(wordIds, activity) {
  const first = new Map();
  for (const r of unitRecords(wordIds, activity)) if (r.attempt === 1) first.set(r.wordId, r.correct);
  return first.size ? [...first.values()].filter(Boolean).length : null;
}
