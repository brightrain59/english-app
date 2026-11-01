import { getLoaded } from "./store";
// 음성 재생 — public/audio/uNNN/ 아래 mp3, 파일이 없으면 브라우저 내장 음성으로 대체.
const pad = (n, w) => String(n).padStart(w, "0");
export const AUDIO_BASE = import.meta.env?.VITE_AUDIO_BASE ?? "/audio"; // 나중에 별도 호스팅으로 바꿀 때 .env에서 지정

export const audioPath = {
  word: (unit, wordId) => `${AUDIO_BASE}/u${pad(unit, 3)}/w${pad(wordId, 4)}.mp3`,
  example: (unit, wordId) => `${AUDIO_BASE}/u${pad(unit, 3)}/x${pad(wordId, 4)}.mp3`,
  matching: (unit, setNo, tier, q) => `${AUDIO_BASE}/u${pad(unit, 3)}/m_s${setNo}_t${tier}_q${q}.mp3`, // q: 1~4
  paragraph: (unit, setNo, tier) => `${AUDIO_BASE}/u${pad(unit, 3)}/p_s${setNo}_t${tier}.mp3`,
};

let current = null;
export function stopSpeech() {
  if (current) { current.pause(); current = null; }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

function speakFallback(text) {
  if (typeof speechSynthesis === "undefined" || !text) return Promise.resolve();
  return new Promise((res) => {
    const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = 0.9; u.onend = u.onerror = res;
    speechSynthesis.speak(u);
  });
}

/** url의 mp3를 재생. 파일이 없거나 재생 실패 시 fallbackText를 내장 음성으로 읽음. 재생이 끝나면 resolve. */
export function play(url, fallbackText = "") {
  stopSpeech();
  return new Promise((resolve) => {
    const a = new Audio(url); current = a;
    const fb = () => { if (current === a) current = null; speakFallback(fallbackText).then(resolve); };
    a.addEventListener("ended", () => { if (current === a) current = null; resolve(); });
    a.addEventListener("error", fb);
    a.play().catch(fb);
  });
}

/** Matching 정답 문장(줄기 + 정답 보기) — 대본과 같은 규칙. */
export function matchingSentence(stem, option) {
  const s = `${stem} ${option}`.replace(/\s+/g, " ").trim();
  return /[.!?]$/.test(s) ? s : s + ".";
}
/** Paragraph 본문에서 [[…]] 표시를 지운 읽기용 문장. */
export const paragraphReadText = (text) => text.replace(/\[\[([^\]:]+)(?::[^\]]+)?\]\]/g, "$1");

/** 화면에서 단어 글자만 알고 있을 때: 현재 단원에서 wordId를 찾아 재생(대본 규칙의 mp3, 없으면 내장 음성). */
export function playWordText(unit, text) {
  const w = getLoaded(unit)?.words.find((x) => x.word === String(text).replace(/\.mp3$/, ""));
  return play(w ? audioPath.word(unit, w.id) : "", String(text).replace(/\.mp3$/, ""));
}
