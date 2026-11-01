import { getLoaded } from "../lib/store";
export const classificationData = new Proxy({}, {
  get(_, key) {
    const d = getLoaded(Number(key));
    if (!d || d.diagnostic.kind !== "classification") return undefined;
    return d.diagnostic.items.map((it) => ({ wordId: it.wordId, word: it.word, translation: it.translation, choices: it.groupWords, answer: it.answer, explanation: it.explanation }));
  },
});
