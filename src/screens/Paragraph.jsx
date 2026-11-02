import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";
import TopBar from "../components/TopBar";
import { getLoaded } from "../lib/store";
import { parseBlanks, tierLabel } from "../lib/data";
import { play, stopSpeech, audioPath, paragraphReadText } from "../lib/audio";
import { addRecord } from "../lib/records";
import { saveSetResult, tierForSet } from "../lib/sets";

const VOL = { click: 0.4, correct: 0.6, wrong: 0.5, combo: 0.7 };
const playEffect = (name) => {
  try { const a = new Audio(`/sounds/${name}.mp3`); a.volume = VOL[name] || 0.6; a.play().catch(() => {}); } catch {}
};

export default function Paragraph({
  exercise, goBack, goNext, addXP, level, xp, score, progress, saveProgress,
  setParagraphDone, unit, triggerFireworks, addScore
}) {
  const data = getLoaded(unit);
  const setIdx = Math.min(exercise ?? 0, (data?.paragraph?.sets.length ?? 1) - 1);
  const set = data?.paragraph?.sets[setIdx];

  const [tier, setTier] = useState(2);
  const [afterChallenge, setAfterChallenge] = useState(false);
  const [round, setRound] = useState(0);
  const [active, setActive] = useState(null);       // 선택한 빈칸 번호
  const [placed, setPlaced] = useState({});         // 빈칸 번호 -> 칩 번호
  const [locked, setLocked] = useState({});         // 확인에서 맞은 빈칸
  const [wrong, setWrong] = useState({});
  const [checks, setChecks] = useState(0);
  const [firstTry, setFirstTry] = useState(null);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [startTs, setStartTs] = useState(Date.now());

  useEffect(() => {
    if (!set) return;
    stopSpeech();
    setTier(tierForSet("paragraph", unit, setIdx, data.diagnostic.kind, set.wordIds));
    setAfterChallenge(false); setRound(0);
  }, [setIdx, unit]);
  useEffect(() => {
    stopSpeech();
    setActive(null); setPlaced({}); setLocked({}); setWrong({}); setChecks(0); setFirstTry(null);
    setDone(null); setPlaying(false); setShake(false); setStartTs(Date.now());
    setParagraphDone && setParagraphDone(false);
  }, [setIdx, tier, round, unit]);

  const t = set?.tiers[tier];
  const parts = useMemo(() => (t ? parseBlanks(t.text) : []), [t]);
  const blanks = parts.filter((p) => p.type === "blank");
  const chips = useMemo(
    () => blanks.map((b, i) => ({ id: i, text: b.answer })).sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase())),
    [blanks]
  );
  if (!data || !set || !t) return <div>Loading...</div>;

  const total = blanks.length;
  const isLast = setIdx === data.paragraph.sets.length - 1;
  const usedChips = Object.values(placed);
  const allFilled = Object.keys(placed).length === total;
  const canCheck = allFilled && !shake && Object.keys(locked).length < total;
  // 빈칸 → 단어 id (기본형으로 찾고, 못 찾으면 순서대로)
  const wordIdOf = (b, i) => data.words.find((w) => set.wordIds.includes(w.id) && w.word.toLowerCase() === b.lemma.toLowerCase())?.id ?? set.wordIds[i];

  const clickBlank = (b) => {
    if (shake || done || locked[b]) return;
    setWrong({});
    if (b in placed) { setPlaced(({ [b]: _, ...r }) => r); setActive(b); return; }
    setActive(b);
  };
  const clickChip = (c, e) => {
    if (shake || done || usedChips.includes(c)) return;
    playEffect("click");
    setWrong({});
    const target = active !== null && !(active in placed) && !locked[active]
      ? active : [...Array(total).keys()].find((i) => !(i in placed));
    if (target === undefined) return;
    setPlaced((p) => ({ ...p, [target]: c }));
    const next = [...Array(total).keys()].find((i) => i !== target && !(i in placed) && !locked[i]);
    setActive(next ?? null);
  };

  const check = () => {
    if (!canCheck) return;
    const n = checks + 1, ms = Date.now() - startTs; setStartTs(Date.now());
    const nowLocked = { ...locked }, nowWrong = {}; let right = 0;
    blanks.forEach((b, i) => {
      if (locked[i]) return;
      const ok = chips[chips.findIndex((c) => c.id === placed[i])].text === b.answer;
      addRecord({ wordId: wordIdOf(b, i), activity: "paragraph", tier, correct: ok, attempt: n, ms });
      if (ok) { nowLocked[i] = true; right++; addScore && addScore(); addXP && addXP(10); } else nowWrong[i] = true;
    });
    setChecks(n); setLocked(nowLocked);
    if (n === 1) setFirstTry(right);
    if (!Object.keys(nowWrong).length) {
      playEffect("correct");
      const correct = n === 1 ? right : firstTry;
      saveSetResult("paragraph", unit, setIdx, { tier, correct, afterChallengeUp: afterChallenge });
      if (correct === total) triggerFireworks && triggerFireworks();
      if (isLast) { saveProgress(unit, "paragraph"); setParagraphDone && setParagraphDone(true); }
      setDone({ correct });
    } else {
      playEffect("wrong"); setWrong(nowWrong); setShake(true);
      setTimeout(() => {
        setPlaced((p) => Object.fromEntries(Object.entries(p).filter(([i]) => !nowWrong[i])));
        setWrong({}); setShake(false);
        setActive(Number(Object.keys(nowWrong)[0]));
      }, 1100);
    }
  };

  const listen = async () => {
    if (playing) { stopSpeech(); setPlaying(false); return; }
    setPlaying(true);
    await play(audioPath.paragraph(unit, set.setNo, tier), paragraphReadText(t.text));
    setPlaying(false);
  };

  let bi = -1;
  return (
    <div style={styles.container}>
      <div style={styles.progressBar}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#22c55e", transition: "width 0.5s" }} />
      </div>
      <TopBar title={data.title} onBack={goBack} level={level} xp={xp} score={score} progress={progress} />

      <h2 style={{ fontSize: "18px", fontWeight: 500, color: "white", marginTop: "30px", marginBottom: "4px", opacity: 0.9 }}>
        📝 Paragraph Completion, Exercise {setIdx + 1}
      </h2>
      <div style={{ fontSize: "12px", opacity: 0.9 }}>Level: {tierLabel[tier]} ({tier}/3){afterChallenge ? " · Challenge" : ""}</div>
      <div style={styles.subtitle}>{set.title}{set.titleKo ? ` · ${set.titleKo}` : ""}</div>

      <div style={styles.paragraph}>
        {parts.map((p, k) => {
          if (p.type === "text") return <React.Fragment key={k}>{p.value}</React.Fragment>;
          const b = ++bi, chip = placed[b] !== undefined ? chips.find((c) => c.id === placed[b]) : null;
          const style = { ...styles.blank,
            ...(active === b && !chip ? styles.blankActive : {}),
            ...(locked[b] ? styles.correctLive : wrong[b] ? styles.wrongLive : {}) };
          return (
            <span key={k} data-blank={b} onClick={() => clickBlank(b)} style={style}>
              <span style={styles.word}>{done ? p.answer : chip?.text ?? ""}</span>
            </span>
          );
        })}
      </div>

      {!done && (
        <>
          <div style={styles.choices}>
            {chips.map((c) => (
              <button key={c.id} style={{ ...styles.choiceBtn, ...(usedChips.includes(c.id) ? styles.chipUsed : {}) }} onClick={(e) => clickChip(c.id, e)}>
                {c.text}
              </button>
            ))}
          </div>
          <div style={styles.hint}>
            {shake ? "😢 빨간 빈칸을 다시 채워 보세요." : allFilled ? "Check를 눌러 확인하세요." : "빈칸을 누르고, 아래 단어를 골라 넣으세요."}
          </div>
          <button style={{ ...styles.checkBtn, padding: "10px 28px", opacity: canCheck ? 1 : 0.45 }} disabled={!canCheck} onClick={check}>✔ Check</button>
        </>
      )}

      {done && (
        <div style={styles.resultBox}>
          <div style={styles.ratingText}>{done.correct === total ? "🏆 Perfect!" : "👍 Good!"} · First check: {done.correct} / {total}</div>
          <div style={styles.resultKo}>{t.ko}</div>
          {t.glossary?.length > 0 && (
            <div style={styles.gloss}>📖 {t.glossary.map((g) => `${g.en} = ${g.ko}`).join(" · ")}</div>
          )}
          <div style={styles.resultButtons}>
            <button style={styles.btnListen} onClick={listen}>{playing ? "⏹ Stop" : "🔊 Listen"}</button>
          </div>
          <div style={{ ...styles.resultButtons, flexWrap: "wrap" }}>
            <button style={styles.btnOk} onClick={() => { stopSpeech(); goNext && goNext(); }}>👉 {isLast ? "Finish" : "Next set"}</button>
            {tier < 3 && <button style={styles.btnSlow} onClick={() => { setAfterChallenge(true); setTier(tier + 1); }}>⬆ Challenge up</button>}
            <button style={styles.btnSlow} onClick={() => { setAfterChallenge(true); setRound((r) => r + 1); }}>🔄 Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
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
  
  subtitle: {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1.8",
    marginTop: "10px",
    color: "#333"
  },

  paragraph: {
    marginTop: "20px",
    fontSize: "15px",
    gap: "10px",
    lineHeight: "1.8",
    textAlign: "left",
    maxWidth: "400px",
    wordBreak: "keep-all",    // ⭐ 단어 단위 유지
    whiteSpace: "normal",     // ⭐ 줄바꿈 허용
    marginLeft: "auto",       // ⭐ 가운데 정렬
    marginRight: "auto"
    },

  blank: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "60px",   // ⭐ 90 → 50
    height: "24px",     // ⭐ 26 → 24
    margin: "0 2px",    // ⭐ 6 → 2
    padding: "0 4px",
    maxWidth: "120px",  // ⭐ 너무 커지는 것 방지
    borderRadius: "6px",
    backgroundColor: "rgba(255,255,255,0.15)",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.15s ease"
  },

  blankActive: {
    backgroundColor: "#ffffff",   // ⭐ 확실한 대비
    color: "#333",                // 글자색 변경
    border: "1px solid #0000CD",  // ⭐ 초록 테두리
    transform: "scale(1.08)",     // ⭐ 살짝 확대
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)", // ⭐ 떠 보이게
    transition: "all 0.15s ease"
  },

  blankHover: {
    backgroundColor: "rgba(255,255,255,0.25)"
  },

  word: {
    fontSize: "14px",
    padding: "0 4px",
    letterSpacing: "0.3px",
    display: "inline-block",
    animation: "popIn 0.2s ease"
  },

  choices: {
    marginTop: "20px",
    marginBottom: "20px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },

  choiceBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    cursor: "pointer"
  },

  checkBtn: {
    marginTop: "20px",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "black",
    cursor: "pointer",
    transition: "0.15s"
    },

  correctLive: {
    backgroundColor: "#ADEBB3",
    color: "#333",
    transform: "scale(1.05)"
  },

  wrongLive: {
    backgroundColor: "#9370db",
    color: "#fff",
    animation: "shake 0.3s"
  },

  nextBtn: {
    marginTop: "10px",
    padding: "8px 16px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    border: "none",
    cursor: "pointer"
  },

  shake: {
    animation: "shake 0.3s"
  },

  resultBox: {
    marginTop: "5px",
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "left"
  },

  resultItem: {
    marginBottom: "16px",
    textAlign: "left",
    lineHeight: "1.8",
    animation: "fadeIn 0.3s ease"
  },


  resultEn: {
    color: "black",
    fontSize: "15px",
    fontWeight: "500",
    marginBottom: "4px",
    textAlign: "left"
  },

  resultKo: {
    fontSize: "14px",
    marginTop: "10px",
    textAlign: "left"
  },

  resultTips: {
    color: "black",
    paddingLeft: "16px",
    fontSize: "14px",
    textAlign: "left"
  },

  resultButtons: {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginTop: "12px"
},

  btnListen: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#dbeafe",
    cursor: "pointer",
    transition: "0.15s"
  },

  btnSlow: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#fde68a",
    cursor: "pointer",
    transition: "0.15s"
  },

  btnOk: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "black",
    cursor: "pointer",
    transition: "0.15s"
 },

  chipUsed: { opacity: 0.35, cursor: "default" },
  gloss: { fontSize: "12px", color: "#fff", opacity: 0.95, marginTop: "6px", textAlign: "left", lineHeight: 1.6 },
  hint: { fontSize: "13px", minHeight: "20px", margin: "8px 0", textAlign: "center" },
  ratingText: {
    marginTop: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff"
  }
};