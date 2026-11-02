import { useState, useRef, useEffect, useLayoutEffect } from "react";
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
  const [round, setRound] = useState(0);              // 같은 세트를 다시 풀 때 증가
  const [sel, setSel] = useState(null);               // { kind: "s"|"o", idx }
  const [links, setLinks] = useState({});             // stemIdx -> optIdx (아직 확인 전 포함)
  const [locked, setLocked] = useState({});           // 확인에서 맞은 stemIdx -> true
  const [wrong, setWrong] = useState({});             // 방금 확인에서 틀린 stemIdx -> true
  const [checks, setChecks] = useState(0);            // Check를 누른 횟수
  const [firstTry, setFirstTry] = useState(null);     // 첫 Check의 정답 수
  const [lineData, setLineData] = useState([]);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(null);             // { correct, tier }
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!set) return;
    stopSpeech();
    setTier(tierForSet("matching", unit, setIdx, data.diagnostic.kind, set.wordIds));
    setAfterChallenge(false); setRound(0);
  }, [setIdx, unit]);
  useEffect(() => {
    stopSpeech();
    setSel(null); setLinks({}); setLocked({}); setWrong({}); setChecks(0); setFirstTry(null);
    setDone(null); setPlaying(false); lastTs.current = Date.now();
  }, [setIdx, tier, round, unit]);

  // 연결선 위치: 연결이 바뀔 때마다 카드 좌표로 다시 계산
  useLayoutEffect(() => {
    const calc = () => {
      const box = containerRef.current?.getBoundingClientRect(); if (!box) return;
      const c = (el) => { const r = el.getBoundingClientRect(); return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }; };
      setLineData(Object.entries(links).map(([i, j]) => {
        const a = document.querySelector(`[data-id="s${i}"]`), b = document.querySelector(`[data-id="o${j}"]`);
        return a && b ? { i: Number(i), p1: c(a), p2: c(b) } : null;
      }).filter(Boolean));
    };
    calc(); window.addEventListener("resize", calc); return () => window.removeEventListener("resize", calc);
  }, [links, setIdx, tier, round, done]);

  if (!data || !set) return <div>Loading...</div>;
  const t = set.tiers[tier];
  const total = t.stems.length;
  const wordOf = (id) => data.words.find((w) => w.id === id);
  const sentenceOf = (i) => matchingSentence(t.stems[i], t.options[t.pairs[i].option]);
  const urlOf = (i) => audioPath.matching(unit, set.setNo, tier, i + 1);
  const isLast = setIdx === data.matching.sets.length - 1;
  const linkedOpts = Object.values(links);
  const allLinked = Object.keys(links).length === total;
  const canCheck = allLinked && !shake && Object.keys(locked).length < total;

  const click = (kind, idx, e) => {
    createRipple(e);
    if (shake || done) return;
    if (kind === "s" && locked[idx]) return;
    if (kind === "o" && Object.entries(links).some(([i, j]) => j === idx && locked[i])) return;
    setWrong({});
    // 이미 연결된 카드를 누르면 연결을 끊음
    if (kind === "s" && idx in links) { setLinks(({ [idx]: _, ...r }) => r); setSel(null); return; }
    if (kind === "o" && linkedOpts.includes(idx)) {
      setLinks((l) => Object.fromEntries(Object.entries(l).filter(([, j]) => j !== idx))); setSel(null); return;
    }
    if (sel && sel.kind !== kind) {
      const i = kind === "s" ? idx : sel.idx, j = kind === "o" ? idx : sel.idx;
      setLinks((l) => ({ ...l, [i]: j })); setSel(null);
    } else setSel({ kind, idx });
  };

  const check = (e) => {
    createRipple(e);
    if (!canCheck) return;
    const n = checks + 1; const ms = Date.now() - lastTs.current; lastTs.current = Date.now();
    const nowLocked = { ...locked }, nowWrong = {};
    let rightNow = 0;
    for (let i = 0; i < total; i++) {
      if (locked[i]) continue;
      const ok = t.pairs[i].option === links[i];
      addRecord({ wordId: t.pairs[i].wordId, activity: "matching", tier, correct: ok, attempt: n, ms });
      if (ok) { nowLocked[i] = true; rightNow++; addScore && addScore(); addXP && addXP(10); } else nowWrong[i] = true;
    }
    setChecks(n); setLocked(nowLocked);
    if (n === 1) setFirstTry(rightNow);
    if (Object.keys(nowWrong).length === 0) {
      playEffect("correct");
      const correct = n === 1 ? rightNow : firstTry;
      saveSetResult("matching", unit, setIdx, { tier, correct, afterChallengeUp: afterChallenge });
      if (correct === total) triggerFireworks && triggerFireworks();
      if (isLast) { setMatchingDone(true); saveProgress(unit, "matching"); }
      setDone({ correct, tier });
    } else {
      playEffect("wrong"); setWrong(nowWrong); setShake(true);
      setTimeout(() => {          // 틀린 연결만 풀어서 다시 고르게 함
        setLinks((l) => Object.fromEntries(Object.entries(l).filter(([i]) => !nowWrong[i])));
        setWrong({}); setShake(false);
      }, 1100);
    }
  };

  const playAll = async () => {
    if (playing) { stopSpeech(); setPlaying(false); return; }
    setPlaying(true);
    for (let i = 0; i < total; i++) { await play(urlOf(i), sentenceOf(i)); }
    setPlaying(false);
  };

  const cardBg = (kind, idx) => {
    const stem = kind === "s" ? (idx in links ? idx : undefined) : Object.keys(links).find((i) => links[i] === idx);
    if (stem !== undefined) {
      if (locked[stem]) return "linear-gradient(135deg, #f0e7da, #ffeda8)";
      if (wrong[stem]) return "#fecaca";
      return "#e9d5ff";
    }
    if (sel && sel.kind === kind && sel.idx === idx) return "#ddd";
    return kind === "s" ? "#e0f2fe" : "#fff7ed";
  };

  return (
    <div style={styles.container}>
      <TopBar title={data.title} progress={progress} onBack={goBack} score={score} level={level} xp={xp} />

      <h2 style={styles.subtitle}>🔗 Expression Matching, Exercise {setIdx + 1}</h2>
      <div style={{ fontSize: "14px", marginBottom: "4px" }}>
        난이도: {tierLabel[tier]}{afterChallenge ? " · Challenge" : ""}
      </div>

      <div style={styles.columnsWrapper} ref={containerRef}>
        <svg style={styles.svg}>
          {lineData.map((l) => (
            <path key={l.i} d={`M ${l.p1.x} ${l.p1.y} Q ${(l.p1.x + l.p2.x) / 2} ${(l.p1.y + l.p2.y) / 2 - 40} ${l.p2.x} ${l.p2.y}`}
              stroke={wrong[l.i] ? "#ff6b6b" : locked[l.i] ? "#ffd84d" : "#e9d5ff"} strokeWidth="2.5" fill="none"
              strokeDasharray={locked[l.i] || wrong[l.i] ? "none" : "6 4"} />
          ))}
        </svg>

        <div style={styles.columns}>
          <div style={styles.column}>
            {t.stems.map((s, i) => (
              <button key={i} data-id={`s${i}`} onClick={(e) => click("s", i, e)}
                style={{ ...styles.card, background: cardBg("s", i), ...(shake && wrong[i] ? styles.shake : {}) }}>
                {s} …
              </button>
            ))}
          </div>
          <div style={styles.column}>
            {t.options.map((o, j) => (
              <button key={j} data-id={`o${j}`} onClick={(e) => click("o", j, e)}
                style={{ ...styles.card, background: cardBg("o", j) }}>
                … {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!done && (
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "15px", minHeight: "22px", marginBottom: "10px" }}>
            {shake ? "😢 빨간색 연결을 다시 골라 보세요." : allLinked ? "연결을 확인하려면 Check를 누르세요." : "왼쪽과 오른쪽을 하나씩 눌러 4개의 문장을 만드세요."}
          </div>
          <button style={{ ...styles.okBtn, padding: "11px 32px", fontSize: "16px", opacity: canCheck ? 1 : 0.45 }} disabled={!canCheck} onClick={check}>
            ✔ Check
          </button>
        </div>
      )}

      {done && (
        <div style={styles.answerBox}>
          <p style={styles.feedback}>{done.correct === total ? "🏆 Perfect!" : "👍 Good!"} · First check: {done.correct} / {total}</p>
          {t.pairs.map((pr, i) => (
            <div key={i} style={styles.sentRow}>
              <button style={styles.repeatBtn} onClick={(e) => { createRipple(e); play(urlOf(i), sentenceOf(i)); }}>🔊</button>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.answerEn}>{sentenceOf(i)}</div>
                <div style={styles.answerKo}>{pr.ko}</div>
                <div style={styles.tip}>🎯 {wordOf(pr.wordId)?.word}</div>
              </div>
            </div>
          ))}
          <div style={styles.btnRow}>
            <button style={styles.slowBtn} onClick={(e) => { createRipple(e); playAll(); }}>{playing ? "⏹ Stop" : "▶ Play all"}</button>
          </div>
          <div style={{ ...styles.btnRow, marginTop: "14px" }}>
            <button style={styles.mainBtn} onClick={(e) => { createRipple(e); stopSpeech(); isLast ? goNext() : goNext(setIdx + 1); }}>
              👉 {isLast ? "Next" : "Next set"}
            </button>
            {tier < 3 && <button style={styles.retryBtn} onClick={(e) => { createRipple(e); setAfterChallenge(true); setTier(tier + 1); }}>⬆ Challenge up</button>}
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
    background: "transparent",
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
    fontSize: "15px",
    lineHeight: 1.35,
    padding: "11px 12px",
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

  sentRow: { display: "flex", gap: "8px", alignItems: "flex-start", margin: "8px 0", color: "#fff" },
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
    color: "#111",
    fontSize: "16px",
    fontWeight: 500
  },

  answerKo: {
    fontSize: "15px",
    color: "#fff"
  },

  tip: {
    color: "#fff",
    fontSize: "14px",
    opacity: 0.95
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