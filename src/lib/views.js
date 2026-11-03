// 화면이 읽는 단원 데이터. loadUnit()으로 단원이 로드된 뒤에만 값이 있고, 그 전에는 undefined.
import { getLoaded } from "./store";
import { audioPath } from "./audio";

export const LEVEL_LABEL = { 1: "중1", 2: "중2", 3: "중3", 4: "고1" };

/** { title, theme, words:[{..., audio, exampleAudio}] } */
export function wordsOf(u) {
  const d = getLoaded(u);
  if (!d) return undefined;
  return {
    title: d.title, theme: d.theme,
    words: d.words.map((w) => ({ ...w, audio: audioPath.word(u, w.id), exampleAudio: audioPath.example(u, w.id) })),
  };
}

/** Word Classification 문항(홀수 단원) */
export function classificationOf(u) {
  const d = getLoaded(u);
  if (!d || d.diagnostic.kind !== "classification") return undefined;
  return d.diagnostic.items.map((it) => ({
    wordId: it.wordId, word: it.word, translation: it.translation, choices: it.groupWords,
    answer: it.answer, explanation: it.explanation,
  }));
}

/** Word Analogy 문항(짝수 단원) */
export function analogyOf(u) {
  const d = getLoaded(u);
  if (!d || d.diagnostic.kind !== "analogy") return undefined;
  return {
    title: d.title,
    questions: d.diagnostic.items.map((it) => ({
      wordId: it.wordId, word: it.word, question: it.question, answer: it.answer,
      choices: it.choices, explanation: it.explanation,
    })),
  };
}
