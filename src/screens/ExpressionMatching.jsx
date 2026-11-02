import { useState, useRef, useEffect } from "react";
import TopBar from "../components/TopBar";
import { getLoaded } from "../lib/store";
import { tierLabel } from "../lib/data";
import { play, stopSpeech, audioPath, matchingSentence } from "../lib/audio";
import { addRecord } from "../lib/records";
import { saveSetResult, tierForSet } from "../lib/sets";

const SOUND_CONFIG = { click: 0.4, correct: 0.6, wrong: 0.5, combo: 0.7, levelup: 0.8 };
const playEffect = (name) => {
  try { const a = new Audio(`/sounds/${name}.mp3`); a.volume = SOUND_CONFIG[name] || 0.6; a.play().catch(() => {}); } catch {}
};

function createRipple(e) {
  try {
    playEffect("click");
    const button = e.currentTarget;
    const d = Math.max(button.clientWidth, button.clientHeight);
    const c = document.createElement("span");
    Object.assign(c.style, { position: "absolute", borderRadius: "50%", background: "rgba(88,204,2,0.25)", transform: "scale(0)", animation: "ripple 0.4s ease-out", pointerEvents: "none", width: `${d}px`, height: `${d}px` });
    const r = button.getBoundingClientRect();
    c.style.left = `${e.clientX - r.left - d / 2}px`; c.style.top = `${e.clientY - r.top - d / 2}px`;
    button.querySelector(".ripple")?.remove(); c.classList.add("ripple"); button.appendChild(c);
  } catch {}
}

export default function ExpressionMatching({
  exercise, goBack, goNext, score, addScore, addXP, level, xp,
  setMatchingDone, progress, unit, saveProgress, triggerFireworks
}) {
  const data = getLoaded(unit);
  const setIdx = Math.min(exercise ?? 0, (data?.matching?.sets.length ?? 1) - 1);
  const set = data?.matching?.sets[setIdx];

  const containerRef = useRef();
  const lastTs = useRef(Date.now());
  const [tier, setTier] = useState(2);
  const [afterChallenge, setAfterChallenge] = useState(false);
  const [round, setRound] = useState(0);            // 같은 세트를 다시 풀 때 증가
  const [selStem, setSelStem] = useState(null);
  const [selOpt, setSelOpt] = useState(null);
  const [matched, setMatched] = useState({});       // stemIdx -> optIdx
  const [attempts, setAttempts] = useState({});     // stemIdx -> 시도 횟수
  const [firstTry, setFirstTry] = useState({});     // stemIdx -> 첫 시도 정답 여부
  const [lines, setLines] = useState([]);
  const [wrongLine, setWrongLine] = useState(null);
  const [shake, setShake] = useState(false);
  const [showAnswer, setShowAnswer] = useState(null); // stemIdx
  const [stars, setStars] = useState([]);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(null);           // { correct, tier }

  // 세트가 바뀌면 단계를 새로 정하고 화면을 비움
  useEffect(() => {
    if (!set) return;
    stopSpeech();
    setTier(tierForSet("matching", unit, setIdx, data.diagnostic.kind, set.wordIds));
    setAfterChallenge(false); setRound(0);
  }, [setIdx, unit]);
  useEffect(() => {
    setSelStem(null); setSelOpt(null); setMatched({}); setAttempts({}); setFirstTry({});
    setLines([]); setWrongLine(null); setShowAnswer(null); setStars([]); setStreak(0); setDone(null);
    lastTs.current = Date.now();
  }, [setIdx, tier, round, unit]);

  if (!data || !set) return <div>Loading...</div>;
  const t = set.tiers[tier];
  const total = t.stems.length;
  const wordOf = (id) => data.words.find((w) => w.id === id);
  const sentenceOf = (i) => matchingSentence(t.stems[i], t.options[t.pairs[i].option]);

  const center = (el) => {
    const r = el.getBoundingClientRect(), c = containerRef.current.getBoundingClientRect();
    return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 };
  };

  const evaluate = (i, j) => {
    const pair = t.pairs[i];
    const n = (attempts[i] ?? 0) + 1;
    const ok = pair.option === j;
    const ms = Date.now() - lastTs.current;
    addRecord({ wordId: pair.wordId, activity: "matching", tier, correct: ok, attempt: n, ms });
    setAttempts((a) => ({ ...a, [i]: n }));
    const e1 = document.querySelector(`[data-id="s${i}"]`), e2 = document.querySelector(`[data-id="o${j}"]`);
    const p1 = e1 && center(e1), p2 = e2 && center(e2);

    if (ok) {
      lastTs.current = Date.now();
      if (p1 && p2) setLines((l) => [...l, { p1, p2 }]);
      setMatched((m) => ({ ...m, [i]: j }));
      setFirstTry((f) => (i in f ? f : { ...f, [i]: n === 1 }));
      setSelStem(null); setSelOpt(null); setWrongLine(null);
      setShowAnswer(i);
      addScore && addScore(); addXP && addXP(10 + streak * 2);
      playEffect("correct");
      setStreak((s) => { if (s + 1 === 5) playEffect("combo"); return s + 1; });
      setStars((s) => [...s, ...Array.from({ length: 6 }).map(() => ({ id: Math.random(), left: Math.random() * 80 + 10, delay: Math.random() * 0.3 }))]);
      setTimeout(() => play(audioPath.matching(unit, set.setNo, tier, i + 1), sentenceOf(i)), 150);
    } else {
      setFirstTry((f) => (i in f ? f : { ...f, [i]: false }));
      playEffect("wrong"); setShake(true); setStreak(0);
      if (p1 && p2) setWrongLine({ p1, p2 });
      setTimeout(() => { setShake(false); setWrongLine(null); setSelStem(null); setSelOpt(null); }, 500);
    }
  };

  const pickStem = (i, e) => {
    createRipple(e);
    if (showAnswer !== null || i in matched || shake) return;
    setSelStem(i);
    if (selOpt !== null) evaluate(i, selOpt);
  };
  const pickOpt = (j, e) => {
    createRipple(e);
    if (showAnswer !== null || Object.values(matched).includes(j) || shake) return;
    setSelOpt(j);
    if (selStem !== null) evaluate(selStem, j);
  };

  const finishIfComplete = () => {
    if (Object.keys(matched).length < total) return false;
    const correct = Object.values(firstTry).filter(Boolean).length;
    saveSetResult("matching", unit, setIdx, { tier, correct, afterChallengeUp: afterChallenge });
    if (correct === total) triggerFireworks && triggerFireworks();
    setDone({ correct, tier });
    if (setIdx === data.matching.sets.length - 1) { setMatchingDone(true); saveProgress(unit, "matching"); }
    return true;
  };

  const isLast = setIdx === data.matching.sets.length - 1;
  const cardBg = (kind, idx) => {
    if (kind === "s" ? idx in matched : Object.values(matched).includes(idx)) return "linear-gradient(135deg, #f0e7da, #ffeda8)";
    if (kind === "s" ? selStem === idx : selOpt === idx) return "#ddd";
    return kind === "s" ? "#e0f2fe" : "#fff7ed";
  };
  const ai = showAnswer;

  return (
    <div style={styles.container}>
      <div style={styles.progressBar}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#22c55e", transition: "width 0.5s" }} />
      </div>
      <TopBar title={data.title} progress={progress} onBack={goBack} score={score} level={level} xp={xp} />

      <div style={styles.starLayer}>
        {stars.map((s) => (
          <div key={s.id} style={{ position: "absolute", left: `${s.left}%`, animation: "starBurst 1s ease-out", animationDelay: `${s.delay}s` }}>⭐</div>
        ))}
      </div>

      <h2 style={styles.subtitle}>🔗 Expression Matching, Exercise {setIdx + 1}</h2>
      <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px" }}>
        Level: {tierLabel[tier]} ({tier}/3){afterChallenge ? " · Challenge" : ""}
      </div>

      <div style={styles.columnsWrapper} ref={containerRef}>
        <svg style={styles.svg}>
          {lines.map((l, i) => (
            <path key={i} d={`M ${l.p1.x} ${l.p1.y} Q ${(l.p1.x + l.p2.x) / 2} ${(l.p1.y + l.p2.y) / 2 - 40} ${l.p2.x} ${l.p2.y}`}
              stroke="#9400d3" strokeWidth="2" fill="none" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawCurve 0.5s forwards" }} />
          ))}
          {wrongLine && <line x1={wrongLine.p1.x} y1={wrongLine.p1.y} x2={wrongLine.p2.x} y2={wrongLine.p2.y} stroke="red" strokeWidth="2" style={{ animation: "flash 0.5s" }} />}
        </svg>

        <div style={styles.columns}>
          <div style={styles.column}>
            {t.stems.map((s, i) => (
              <button key={i} data-id={`s${i}`} onClick={(e) => pickStem(i, e)}
                style={{ ...styles.card, background: cardBg("s", i), ...(shake && selStem === i ? styles.shake : {}) }}>
                {s} …
              </button>
            ))}
          </div>
          <div style={styles.column}>
            {t.options.map((o, j) => (
              <button key={j} data-id={`o${j}`} onClick={(e) => pickOpt(j, e)}
                style={{ ...styles.card, background: cardBg("o", j), ...(shake && selOpt === j ? styles.shake : {}) }}>
                … {o}
              </button>
            ))}
          </div>
        </div>

        {ai !== null && (
          <div style={styles.answerBox}>
            <p style={styles.feedback}>🎉 Great!</p>
            <p style={styles.answerEn}>{sentenceOf(ai)}</p>
            <p style={styles.answerKo}>{t.pairs[ai].ko}</p>
            <p style={styles.tip}>🎯 {wordOf(t.pairs[ai].wordId)?.word}</p>
            <div style={styles.btnRow}>
              <button style={styles.repeatBtn} onClick={(e) => { createRipple(e); play(audioPath.matching(unit, set.setNo, tier, ai + 1), sentenceOf(ai)); }}>🔁 Repeat</button>
              <button style={styles.slowBtn} onClick={(e) => { createRipple(e); play(audioPath.matching(unit, set.setNo, tier, ai + 1), sentenceOf(ai), 0.8); }}>🐢 Slow</button>
              <button style={styles.okBtn} onClick={(e) => { createRipple(e); stopSpeech(); setShowAnswer(null); finishIfComplete(); }}>👍 OK</button>
            </div>
          </div>
        )}
      </div>

      {done && (
        <div style={styles.popup}>
          🎆 🎆 🎆
          <h2 style={{ color: "#333" }}>{done.correct === total ? "🏆 Perfect!" : "👍 Good!"}</h2>
          <div style={{ color: "#333", fontSize: "14px" }}>First try: {done.correct} / {total}</div>
          <div style={{ marginTop: "12px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={styles.mainBtn} onClick={(e) => { createRipple(e); setDone(null); isLast ? goNext() : goNext(setIdx + 1); }}>
              👉 {isLast ? "Next" : "Next set"}
            </button>
            {tier < 3 && (
              <button style={styles.retryBtn} onClick={(e) => { createRipple(e); setAfterChallenge(true); setTier(tier + 1); }}>⬆ Challenge up</button>
            )}
            <button style={styles.retryBtn} onClick={(e) => { createRipple(e); setAfterChallenge(true); setRound((r) => r + 1); }}>🔄 Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 스타일 */
const styles = {
  container: {
    minHeight: "100vh",
    position: "relative",
    background: "linear-gradient(to bottom, #4facfe, #00c6ff)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    color: "white"
  },

  progressBar: {
    width: "100%",
    height: "8px",
    marginBottom: "10px",
    background: "#e5e7eb",
    borderRadius: "10px",
    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden"
  },

  streak: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#ffeb3b",
    marginTop: "5px",
    textShadow: "0 2px 6px rgba(0,0,0,0.3)"
  },

  starLayer: {
    position: "absolute",
    top: "60px",
    left: 0,
    width: "100%",
    pointerEvents: "none",
    zIndex: 1 
  },

  columnsWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "500px"
  },
  
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0
  },

  subtitle: {
    fontSize: "18px",
    fontWeight: "500",
    color: "white",
    lineHeight: "1.8",
    marginTop: "30px",
    marginBottom: "0px"
  },

  card: {
    textAlign: "left",
    fontSize: "14px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    color: "black",
    transition: "0.15s",
    zIndex: 1
  },

  columns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "10px"
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  leftCard: {
    background: "#e0f2fe"   // 🔵 문장
  },

  rightCard: {
    background: "#fff7ed"   // 🟠 옵션
  },

  feedback: { fontWeight: "bold", margin: "0 0 6px" },
  noteText: { color: "#555", fontSize: "12px", textAlign: "left", marginTop: "10px", lineHeight: 1.5 },
  answerBox: {
    marginTop: "20px",
    textAlign: "center",
    background: "rgba(255,255,255,0.2)",
    padding: "12px",
    borderRadius: "10px",
    animation: "fadeIn 0.3s ease"
  },

  answerEn: {
    color: "black",
    fontSize: "14px"
  },

  answerKo: {
    fontSize: "13px"
  },

  tip: {
    color: "black",
    fontSize: "13px"
  },

  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    marginTop: "10px",
    flexWrap: "wrap"
  },

  repeatBtn: {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#dbeafe",
  cursor: "pointer",
  transition: "0.15s"
 },

slowBtn: {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#fde68a",
  cursor: "pointer",
  transition: "0.15s"
 },

okBtn: {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
  color: "black",
  cursor: "pointer",
  transition: "0.15s"
 },

  nextBtn: {
    marginTop: "10px",
    padding: "6px 16px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "white",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  },

  done: {
    marginTop: "40px",
    color: "white",
    fontSize: "16px"
  },

  popup: {
    position: "fixed",
    top: "40%",
    left: "50%",
    width: "100%",
    maxWidth: "300px",
    transform: "translate(-50%, -50%)",
    background: "#fef3c7",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    zIndex: 1000,
    pointerEvents: "auto"
  },

  mainBtn: {
    marginTop: "24px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    color: "black",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    cursor: "pointer"
  },

  retryBtn: {
    marginTop: "24px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    color: "#9400d3",
    background: "linear-gradient(135deg, #ffffe0, #fafad2)",
    cursor: "pointer"
  },

  shake: {
    animation: "shake 0.3s"
  },

  resultText: {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "10px",
    color: "#fff",
    textShadow: "0 2px 6px rgba(0,0,0,0.3)"
  }
};