// 단계(tier) 배정 — SCHEMA.md 3절. 1=하, 2=중, 3=상. 컷오프는 시범 운영 뒤 이 설정값만 고치면 됩니다.
export const CONFIG = {
  diagnostic: {
    classification: { high: 12, mid: 8 },  // 12~15 → 3, 8~11 → 2, 0~7 → 1
    analogy: { high: 12, mid: 8 },         // 유형별로 따로 보정할 수 있게 분리
  },
  matching: { up: 3, down: 1 },            // 4문항 중 정답 ≥3 → +1, ≤1 → −1
  paragraph: { up: 4, down: 2 },           // 5문항 중 정답 ≥4 → +1, ≤2 → −1
  defaultTier: 2,                          // 진단 결과가 없을 때
};
const clamp = (t) => Math.max(1, Math.min(3, t));

/** 진단 점수(0~15)로 첫 세트의 단계를 정함. score가 null/undefined이면 기본값. */
export function tierFromDiagnostic(kind, score) {
  if (score == null) return CONFIG.defaultTier;
  const c = CONFIG.diagnostic[kind];
  return score >= c.high ? 3 : score >= c.mid ? 2 : 1;
}

/**
 * 다음 세트의 단계. prev = { tier, correct, afterChallengeUp }
 * 'Challenge up' 직후의 점수는 조정에 쓰지 않음(내용이 거의 같아 정답을 기억할 수 있음).
 */
export function nextTier(activity, prev) {
  if (!prev || prev.afterChallengeUp) return prev ? prev.tier : CONFIG.defaultTier;
  const r = CONFIG[activity];
  if (prev.correct >= r.up) return clamp(prev.tier + 1);
  if (prev.correct <= r.down) return clamp(prev.tier - 1);
  return prev.tier;
}
