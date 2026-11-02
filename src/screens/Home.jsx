import { useState, useEffect } from "react";
import { units, LEVEL_LABEL } from "../data/units";
import { canOpenUnit, isFreeUnit, redeemCode, refreshAccess, accessSummary, redeemAvailable, REDEEM_ERRORS } from "../lib/access";

const sounds = {
  click: new Audio("/sounds/click.mp3"),
  correct: new Audio("/sounds/correct.mp3"),
  wrong: new Audio("/sounds/wrong.mp3"),
  combo: new Audio("/sounds/combo.mp3"),
  levelup: new Audio("/sounds/levelup.mp3")
};

const SOUND_CONFIG = {
  bgm: 0.12,
  click: 0.4,
  correct: 0.6,
  wrong: 0.5,
  combo: 0.7,
  levelup: 0.8
};

const playEffect = (name) => {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.volume = SOUND_CONFIG[name] || 0.6;
  audio.play();
};

function CircleProgress({ percent }) {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  return (
    <div style={styles.circleWrapper}>
      <svg width="28" height="28">
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke="#ddd"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="14"
          cy="14"
          r={radius}
          stroke="#58cc02"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference * (1 - percent / 100)
          }
          style={{ transition: "0.5s" }}
        />
      </svg>

      <div style={styles.circleText}>{percent}%</div>
    </div>
  );
}


function rippleAt(e, color = "rgba(29,111,216,0.28)") {
  const b = e.currentTarget;
  const r = b.getBoundingClientRect();
  const d = Math.max(r.width, r.height);
  const c = document.createElement("span");
  c.className = "ripple";
  c.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px;background:${color}`;
  b.querySelector(".ripple")?.remove();
  b.appendChild(c);
  setTimeout(() => c.remove(), 450);
}

export default function Home({ goUnit, unlockedUnits, progress }) {
  const [level, setLevel] = useState(() => {
    try { const v = Number(localStorage.getItem("wl.homeLevel")); return v >= 1 && v <= 4 ? v : 1; } catch { return 1; }
  });
  const pickLevel = (lv) => {
    setLevel(lv);
    try { localStorage.setItem("wl.homeLevel", String(lv)); } catch {}
  };
  const [lockedUnit, setLockedUnit] = useState(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => { refreshAccess().then(() => setTick((t) => t + 1)); }, []);
  const submitCode = async () => {
    if (!code.trim() || busy) return;
    setBusy(true); setMsg("");
    const r = await redeemCode(code);
    setBusy(false);
    if (r.ok) { setCode(""); setMsg("✅ 이용권이 등록되었어요!"); setTick((t) => t + 1); }
    else setMsg(`⚠️ ${REDEEM_ERRORS[r.error] ?? REDEEM_ERRORS.invalid}`);
  };
  const owned = accessSummary();
  const levelUnits = units.filter((u) => u.level === level);
  const doneIn = (lv) => units.filter((u) => {
    const p = progress[u.id] || {};
    return u.level === lv && p.words && (p.classification || p.analogy) && p.matching && p.paragraph;
  }).length;
  const unlockAudio = () => {
    const audio = new Audio();
    audio.src = "/sounds/bgm1.mp3";
    audio.play().then(() => {
      audio.pause();   // ⭐ 중요
    }).catch(() => {});
  };

const totalXP = Object.values(progress).reduce((acc, u) => {
  return acc + (u.words ? 10 : 0)
             + ((u.classification || u.analogy) ? 10 : 0)
             + (u.matching ? 10 : 0)
             + (u.paragraph ? 10 : 0);
}, 0);

const completedUnits = Object.values(progress).filter(u =>
  u.words &&
  (u.classification || u.analogy) &&
  u.matching &&
  u.paragraph
).length;

  return (
    <div style={styles.container}>
      <h1 
        style={{ 
          fontSize: "clamp(20px, 6vw, 28px)",
          color: "#fff",
          fontWeight: "bold",
          marginBottom: "14px",
          marginTop: "0",
          letterSpacing: "0.1px"    // ⭐ 추가 (0.5~1.5px 추천)
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}><img src="/ladder-student.png" alt="" style={{ height: "64px" }} />Word Ladder 1200</span>
      </h1>
      <img src="/study.png" 
        style={{
          width: "120px",
          marginTop: "10px",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)" 
        }} 
      />
      <p style={{ 
        fontSize: "14px", 
        color: "#ffd84d",
        fontSize: "15px"
      }}>
        English vocabulary, step by step!
      </p>
      <div style={styles.statsBox}>
        <div>🏆 Completed Units: {completedUnits}</div>
        <div>⭐ Total XP: {totalXP}</div>
      </div>
      <button style={styles.codeBtn} onClick={() => { setMsg(""); setCodeOpen(true); }}>
        🎟 이용권 코드 입력
      </button>
      <h2
        style={{ 
            fontSize: "18px",
            color: "#fff",
            marginTop: "10px",
            marginBottom: "10px" }}>
        Select a Level
      </h2>
      <div style={styles.tabs}>
        {[1, 2, 3, 4].map((lv) => (
          <button
            key={lv}
            onClick={(e) => { rippleAt(e); pickLevel(lv); }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            style={{ ...styles.tab, ...(lv === level ? styles.tabOn : {}) }}
          >
            <div style={{ fontWeight: "bold" }}>Level {lv}</div>
            <div style={{ fontSize: "11px" }}>{LEVEL_LABEL[lv]} · {doneIn(lv)}/20</div>
          </button>
        ))}
      </div>
      <h2 style={{ fontSize: "15px", color: "#fff", margin: "10px 0 2px" }}>
        Level {level} · Units {(level - 1) * 20 + 1}–{level * 20}
      </h2>

    {levelUnits.map((u) => {
      const isUnlocked = canOpenUnit(u.id);
      const p = progress[u.id] || {};

      const percent = Math.floor(
        ((p.words ? 1 : 0) +
        (p.classification || p.analogy ? 1 : 0) +   // ⭐ 핵심
        (p.matching ? 1 : 0) +
        (p.paragraph ? 1 : 0)) / 4 * 100
      );
      const isComplete = percent === 100;

      return (
      <button
        key={u.id}
        style={{
          ...styles.card,
          background: !isUnlocked
            ? "rgba(255,255,255,0.22)"
            : isComplete
            ? "#d9f99d"
            : "white",
          color: isUnlocked ? "#111" : "#fff",
          border: isUnlocked ? "none" : "1px dashed rgba(255,255,255,0.6)",
          animation: isComplete ? "shine 1s ease" : "none"
        }}
        onClick={(e) => {
          rippleAt(e);
          if (!isUnlocked) { setLockedUnit(u.id); return; }
          unlockAudio();
          goUnit(u.id);
        
          setTimeout(() => {
            console.log("audio unlocked");
            console.log("screen:", screen);
          }, 100);
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.transform = "scale(1.03)")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        <div style={styles.row}>
          <span style={{ textAlign: "left", minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>
              {isUnlocked ? "📘" : "🔒"} Unit {u.id}
              {isFreeUnit(u.id) && <span style={styles.freeTag}>FREE</span>}
              {!isUnlocked && <span style={styles.premTag}>Premium</span>}
            </div>
            <div style={{ fontSize: "13px", opacity: 0.85, marginTop: "2px" }}>{u.title}</div>
          </span>

          {isUnlocked && <CircleProgress percent={Math.floor(percent)} />}
        </div>

        {/* 진행바 */}
        {isUnlocked && <div style={styles.progressBg}>
          <div
            style={{
              
              ...styles.progressFill,
              width: `${percent}%`
            }}
          />
        </div>}

        {isComplete && (
          <div style={styles.complete}>🏆 Complete!</div>
        )}
      </button>
    );
    })}
      {codeOpen && (
        <div style={styles.modalBg} onClick={() => setCodeOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 8px", color: "#333" }}>🎟 이용권 코드</h3>
            {owned.length > 0 && (
              <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "8px", marginBottom: "10px", fontSize: "13px", color: "#166534", textAlign: "left" }}>
                {owned.map((o) => <div key={o.label}>✔ {o.label} · {o.until.toLocaleDateString("ko-KR")}까지</div>)}
              </div>
            )}
            <input
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && submitCode()}
              placeholder="XXXX-XXXX-XXXX" maxLength={20} autoCapitalize="characters" autoCorrect="off" spellCheck={false}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px", fontSize: "16px", letterSpacing: "1px", textAlign: "center", borderRadius: "8px", border: "1px solid #ccc", color: "#333" }}
            />
            <div style={{ minHeight: "36px", fontSize: "13px", color: "#555", margin: "8px 0" }}>
              {msg || (redeemAvailable() ? "구매한 이용권 코드를 입력하세요." : "이용권 기능을 준비하고 있어요.")}
            </div>
            <button style={styles.modalBtn} disabled={busy} onClick={submitCode}>{busy ? "확인 중…" : "등록"}</button>
            <button style={{ ...styles.modalBtn, background: "#e5e7eb", marginLeft: "8px" }} onClick={() => setCodeOpen(false)}>닫기</button>
          </div>
        </div>
      )}
      {lockedUnit !== null && (
        <div style={styles.modalBg} onClick={() => setLockedUnit(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "28px" }}>🔒</div>
            <h3 style={{ margin: "8px 0", color: "#333" }}>Unit {lockedUnit} · Premium</h3>
            <p style={{ color: "#555", fontSize: "14px", lineHeight: 1.6, margin: "0 0 12px" }}>
              이 단원은 이용권 코드가 필요해요.<br />
              지금은 Unit 1, 2, 21, 22, 41, 42, 61, 62를 무료로 체험할 수 있어요.
            </p>
            <button style={styles.modalBtn} onClick={() => { setLockedUnit(null); setMsg(""); setCodeOpen(true); }}>🎟 코드 입력</button>
            <button style={{ ...styles.modalBtn, background: "#e5e7eb", marginLeft: "8px" }} onClick={() => setLockedUnit(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
const styles = {
  freeTag: { marginLeft: "8px", padding: "1px 7px", borderRadius: "999px", background: "#16a34a", color: "#fff", fontSize: "11px", fontWeight: 700, verticalAlign: "middle" },
  premTag: { marginLeft: "8px", padding: "1px 7px", borderRadius: "999px", background: "rgba(255,255,255,0.3)", color: "#fff", fontSize: "11px", verticalAlign: "middle" },
  codeBtn: { marginTop: "6px", padding: "6px 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.2)", color: "white", cursor: "pointer", fontSize: "13px" },
  modalBg: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modal: { background: "#fff", borderRadius: "14px", padding: "20px", maxWidth: "300px", width: "100%", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  modalBtn: { padding: "8px 24px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #ADEBB3, #32CD32)", cursor: "pointer", color: "black" },
  tabs: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", width: "100%", maxWidth: "300px" },
  tab: { padding: "6px 2px", borderRadius: "8px", border: "2px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "white", cursor: "pointer", fontSize: "12px", position: "relative", overflow: "hidden", transition: "transform 0.15s ease, background 0.15s" },
  tabOn: { background: "white", color: "#1d6fd8", borderColor: "white" },
  container: {
    minHeight: "100vh",
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px",
    color: "white"
  },

  statsBox: {
    background: "rgba(255,255,255,0.2)",
    padding: "10px 20px",
    borderRadius: "12px",
    marginTop: "5px",
    marginBottom: "10px",
    textAlign: "center",
    fontSize: "14px"
  },

  card: {
    width: "100%",
    maxWidth: "340px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    marginTop: "6px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.2s ease"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  progressBg: {
    height: "6px",
    background: "#ddd",
    borderRadius: "10px",
    marginTop: "5px"
  },

  progressFill: {
    height: "100%",
    background: "#58cc02",
    borderRadius: "10px",
    transition: "0.3s"
  },

  circleWrapper: {
    position: "relative",
    width: "36px",
    height: "36px"
  },

  circleText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "9px",
    fontWeight: "bold",
    color: "#333"
  },

  complete: {
    marginTop: "5px",
    fontSize: "12px",
    color: "#166534",
    fontWeight: "bold"
  }
};