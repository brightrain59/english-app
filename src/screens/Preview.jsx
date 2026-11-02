import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "../components/TopBar";
import { wordsData } from "../data/words";
import { play, stopSpeech } from "../lib/audio";
import { getFlags, toggleFlag } from "../lib/records";

const POS = { n: "명사", v: "동사", adj: "형용사", adv: "부사", prep: "전치사", conj: "접속사", pron: "대명사", det: "한정사" };
const posLabel = (pos) => (pos ? pos.split("/").map((p) => POS[p.trim()] ?? p.trim()).join(" · ") : "");

// 예문 안의 목표 단어(와 -s, -ed, -ing 등 변화형)를 굵게
function Highlight({ text, word }) {
  const re = useMemo(() => {
    const base = word.replace(/e$/, "");
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b(${esc(word)}|${esc(base)}[a-z]{0,4})\\b`, "i");
  }, [word]);
  const m = re.exec(text);
  if (!m) return <>{text}</>;
  return (<>{text.slice(0, m.index)}<b style={{ color: "#1d4ed8" }}>{m[0]}</b>{text.slice(m.index + m[0].length)}</>);
}

/**
 * Preview — 단원의 15개 단어를 미리 살펴보는 화면.
 *  1) 목록에서 단어를 고르면 카드가 열립니다.
 *  2) 단계: 0 = 단어·발음만, 1 = 뜻 + 예문, 2 = 예문 번역. 단어 카드를 누를 때마다 한 단계씩 나옵니다.
 *     레벨 1(중1, 단원 1~20)은 처음부터 모두 보입니다.
 *  3) 15개의 뜻을 모두 확인하면 완료. 정답 판정은 없습니다.
 */
export default function Preview({ goBack, goNext, setWordsDone, progress, unit, saveProgress }) {
  const unitData = wordsData[unit];
  const words = unitData?.words ?? [];
  const showAll = unit <= 20;                 // 레벨 1(중1)은 뜻·예문·번역을 바로 보여 줌
  const startStage = showAll ? 2 : 0;

  const [view, setView] = useState("list");   // "list" | "card"
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState(startStage);
  const [seen, setSeen] = useState(() => new Set());
  const [flags, setFlags] = useState(getFlags);
  const [done, setDone] = useState(false);
  const [popup, setPopup] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => () => stopSpeech(), []);
  const w = words[index];
  const markSeen = (i) => setSeen((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));

  // 모두 확인하면 완료 처리(한 번만)
  useEffect(() => {
    if (!doneRef.current && seen.size === words.length && words.length > 0) {
      doneRef.current = true; setDone(true);
      setWordsDone(true); saveProgress(unit, "words"); setPopup(true);
    }
  }, [seen, words.length]);   // eslint-disable-line react-hooks/exhaustive-deps

  const open = (i) => {
    setIndex(i); setStage(startStage); setView("card");
    if (showAll) markSeen(i);
    play(words[i].audio, words[i].word);          // 열릴 때 단어 발음 한 번
  };
  const advance = () => {                         // 카드를 누르면 한 단계 더
    if (stage < 2) { const s = stage + 1; setStage(s); if (s >= 1) markSeen(index); }
  };
  const go = (d) => { const i = index + d; if (i >= 0 && i < words.length) open(i); };
  const flag = () => setFlags({ ...toggleFlag(w.id) });

  if (!unitData) return <div>Loading...</div>;
  const pct = Math.round((seen.size / words.length) * 100);

  return (
    <div style={S.container}>
      <TopBar title={unitData.title} progress={progress} onBack={view === "card" ? () => { stopSpeech(); setView("list"); } : goBack} />
      <h2 style={S.h2}>📖 Preview <span style={S.ko}>미리보기</span></h2>

      {view === "list" && (
        <>
          <p style={S.instruction}>
            단어를 눌러 뜻과 예문을 확인하세요.<br />
            {showAll ? "🔊 버튼으로 단어와 예문의 발음을 들을 수 있어요." : "카드를 한 번 누르면 뜻과 예문, 한 번 더 누르면 예문 번역이 나와요."}<br />
            헷갈리는 단어는 ⭐로 표시해 두세요.
          </p>
          <div style={S.count}>{seen.size} / {words.length} 확인 <span style={{ opacity: 0.8 }}>({pct}%)</span></div>
          <div style={S.grid}>
            {words.map((x, i) => (
              <button key={x.id} style={{ ...S.chip, ...(seen.has(i) ? S.chipSeen : null) }} onClick={() => open(i)}>
                <span>{x.word}</span>
                <span style={S.marks}>{flags[x.id] ? "⭐" : ""}{seen.has(i) ? "✓" : ""}</span>
              </button>
            ))}
          </div>
          {done && <button style={S.next} onClick={goNext}>Next ❯</button>}
        </>
      )}

      {view === "card" && w && (
        <>
          <div style={S.counter}>{index + 1} / {words.length}</div>
          <div style={S.card} onClick={advance} role="button">
            <div style={S.word}>{w.word}</div>
            <div style={S.pos}>{posLabel(w.pos)}</div>
            <button style={S.speak} onClick={(e) => { e.stopPropagation(); play(w.audio, w.word); }} aria-label="단어 발음 듣기">🔊 단어</button>

            {stage >= 1 ? (
              <>
                <div style={S.meaning}>{w.meaning}</div>
                <div style={S.example}>{w.example.split(" / ").map((t, k) => <div key={k}><Highlight text={t} word={w.word} /></div>)}</div>
                <button style={S.speak} onClick={(e) => { e.stopPropagation(); play(w.exampleAudio, w.example); }} aria-label="예문 듣기">🔊 예문</button>
                {stage >= 2
                  ? <div style={S.exampleKo}>{w.example_ko.split(" / ").map((t, k) => <div key={k}>{t}</div>)}</div>
                  : <div style={S.hint}>한 번 더 누르면 예문 번역이 나와요</div>}
              </>
            ) : (
              <div style={S.hint}>카드를 누르면 뜻과 예문이 나와요</div>
            )}
          </div>

          <button style={{ ...S.flag, ...(flags[w.id] ? S.flagOn : null) }} onClick={flag}>
            {flags[w.id] ? "⭐ 헷갈려요 (표시됨)" : "☆ 헷갈려요"}
          </button>
          <div style={S.nav}>
            <button style={S.navBtn} disabled={index === 0} onClick={() => go(-1)}>❮ 이전</button>
            <button style={S.navBtn} onClick={() => { stopSpeech(); setView("list"); }}>목록</button>
            <button style={S.navBtn} disabled={index === words.length - 1} onClick={() => go(1)}>다음 ❯</button>
          </div>
        </>
      )}

      {popup && (
        <div style={S.popup}>
          🎆🎆🎆
          <h2>🎉 Preview Complete!</h2>
          <div style={{ marginTop: 15, display: "flex", gap: 10, justifyContent: "center" }}>
            <button style={S.btnPrimary} onClick={() => { setPopup(false); goNext(); }}>👉 Next</button>
            <button style={S.btnSecondary} onClick={() => { setPopup(false); setView("list"); }}>🔄 Review</button>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  container: { minHeight: "100vh", background: "linear-gradient(to bottom, #4facfe, #00c6ff)", display: "flex", flexDirection: "column", alignItems: "center", padding: 20, color: "white" },
  h2: { fontSize: 18, fontWeight: 500, color: "white", marginTop: 30, marginBottom: 10, opacity: 0.9 },
  ko: { fontSize: 13, opacity: 0.85, marginLeft: 6 },
  instruction: { color: "#333", fontSize: 14, lineHeight: 1.6, marginTop: 10, marginBottom: 10, textAlign: "center" },
  count: { fontSize: 14, marginBottom: 12 },
  grid: { boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%", maxWidth: 380 },
  chip: { background: "#fff", color: "#111", border: "none", borderRadius: 10, padding: "12px 6px", fontSize: 15, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, boxShadow: "0 4px 10px rgba(0,0,0,0.15)" },
  chipSeen: { background: "#dcfce7" },
  marks: { fontSize: 12, minHeight: 16 },
  next: { marginTop: 18, height: 32, padding: "0 28px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #ADEBB3, #32CD32)", color: "black", fontSize: 14, cursor: "pointer" },
  counter: { fontSize: 13, opacity: 0.9, marginBottom: 8 },
  card: { boxSizing: "border-box", width: "100%", maxWidth: 380, minHeight: 260, background: "#fff", color: "#111", borderRadius: 16, padding: "22px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.2)", cursor: "pointer", textAlign: "center" },
  word: { fontSize: 32, fontWeight: 700 },
  pos: { fontSize: 13, color: "#6b7280", minHeight: 16 },
  speak: { border: "none", borderRadius: 16, background: "#e0f2fe", color: "#0369a1", fontSize: 13, padding: "6px 14px", cursor: "pointer" },
  meaning: { fontSize: 20, fontWeight: 600, marginTop: 6 },
  example: { fontSize: 16, lineHeight: 1.5, color: "#222" },
  exampleKo: { fontSize: 14, lineHeight: 1.5, color: "#4b5563" },
  hint: { fontSize: 12, color: "#9ca3af", marginTop: 6 },
  flag: { marginTop: 14, border: "none", borderRadius: 16, background: "rgba(255,255,255,0.85)", color: "#92400e", fontSize: 13, padding: "8px 16px", cursor: "pointer" },
  flagOn: { background: "#fde68a" },
  nav: { display: "flex", gap: 10, marginTop: 16 },
  navBtn: { height: 32, padding: "0 16px", borderRadius: 8, border: "none", background: "#fff", color: "#111", fontSize: 14, cursor: "pointer" },
  popup: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", color: "#111", padding: 24, borderRadius: 16, textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.35)", zIndex: 10 },
  btnPrimary: { padding: "8px 16px", border: "none", borderRadius: 8, background: "#32CD32", color: "white", cursor: "pointer" },
  btnSecondary: { padding: "8px 16px", border: "none", borderRadius: 8, background: "#e5e7eb", color: "#111", cursor: "pointer" },
};
