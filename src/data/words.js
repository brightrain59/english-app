// 호환 계층: 새 데이터(lib/data.js)를 이전 화면이 읽던 모양으로 보여 줍니다. 단원이 로드되기 전에는 undefined.
import { getLoaded } from "../lib/store";
import { audioPath } from "../lib/audio";
export const wordsData = new Proxy({}, {
  get(_, key) {
    const u = Number(key); const d = getLoaded(u);
    if (!d) return undefined;
    return { title: d.title, theme: d.theme,
      words: d.words.map((w) => ({ ...w, audio: audioPath.word(u, w.id), exampleAudio: audioPath.example(u, w.id) })) };
  },
});
