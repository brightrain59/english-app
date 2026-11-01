// Word Ladder 1200 — 데이터 불러오기. 레벨 파일은 필요할 때만 내려받습니다.
export const LEVELS = [
  { lv: 1, label: "중1", units: [1, 20] },
  { lv: 2, label: "중2", units: [21, 40] },
  { lv: 3, label: "중3", units: [41, 60] },
  { lv: 4, label: "고1", units: [61, 80] },
];
export const levelOfUnit = (u) => Math.ceil(u / 20);
export const isClassificationUnit = (u) => u % 2 === 1; // 홀수 = Word Classification, 짝수 = Word Analogy
export const tierLabel = { 1: "하", 2: "중", 3: "상" };

const loaders = {
  1: () => Promise.all([import("../data/wl/words.level1.js"), import("../data/wl/classification.level1.js"), import("../data/wl/analogy.level1.js"), import("../data/wl/matching.level1.js"), import("../data/wl/paragraph.level1.js")]),
  2: () => Promise.all([import("../data/wl/words.level2.js"), import("../data/wl/classification.level2.js"), import("../data/wl/analogy.level2.js"), import("../data/wl/matching.level2.js"), import("../data/wl/paragraph.level2.js")]),
  3: () => Promise.all([import("../data/wl/words.level3.js"), import("../data/wl/classification.level3.js"), import("../data/wl/analogy.level3.js"), import("../data/wl/matching.level3.js"), import("../data/wl/paragraph.level3.js")]),
  4: () => Promise.all([import("../data/wl/words.level4.js"), import("../data/wl/classification.level4.js"), import("../data/wl/analogy.level4.js"), import("../data/wl/matching.level4.js"), import("../data/wl/paragraph.level4.js")]),
};
const cache = {};

/** 레벨 데이터 전체(5종)를 불러옵니다. */
export function loadLevel(lv) {
  return (cache[lv] ??= loaders[lv]().then(([w, c, a, m, p]) => ({
    words: w.wordsData, classification: c.classificationData, analogy: a.analogyData,
    matching: m.matchingData, paragraph: p.paragraphData,
  })));
}

/**
 * 한 단원의 데이터. 진단(diagnostic)은 홀수 단원이면 classification, 짝수 단원이면 analogy.
 * 반환: { unit, title, words, diagnostic:{kind, items}, matching:{sets}, paragraph:{sets} }
 */
export async function loadUnit(u) {
  const d = await loadLevel(levelOfUnit(u));
  const cls = isClassificationUnit(u);
  const diag = (cls ? d.classification : d.analogy)[u];
  return {
    unit: u,
    title: d.words[u].title,
    theme: d.words[u].theme,
    words: d.words[u].words,
    diagnostic: { kind: cls ? "classification" : "analogy", items: diag.items },
    matching: d.matching[u],
    paragraph: d.paragraph[u],
  };
}

/** 단원 제목 목록(홈 화면용). 레벨 파일을 모두 불러오지 않고 단원 선택에 필요한 것만 읽습니다. */
export async function loadUnitTitles(lv) {
  const d = await loadLevel(lv);
  const [a, b] = LEVELS[lv - 1].units;
  return Array.from({ length: b - a + 1 }, (_, i) => ({ unit: a + i, title: d.words[a + i].title, theme: d.words[a + i].theme }));
}

/** Paragraph 본문의 [[surface]] / [[surface:lemma]] 표기를 조각으로 나눕니다. */
export function parseBlanks(text) {
  const out = []; const re = /\[\[([^\]:]+)(?::([^\]]+))?\]\]/g; let last = 0, m, n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
    out.push({ type: "blank", index: n++, answer: m[1], lemma: m[2] ?? m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}
