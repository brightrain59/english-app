import { getLoaded } from "../lib/store";
export const analogyData = new Proxy({}, {
  get(_, key) {
    const d = getLoaded(Number(key));
    if (!d || d.diagnostic.kind !== "analogy") return undefined;
    return { title: d.title, questions: d.diagnostic.items.map((it) => ({ wordId: it.wordId, word: it.word, question: it.question, answer: it.answer, choices: it.choices, explanation: it.explanation })) };
  },
});
