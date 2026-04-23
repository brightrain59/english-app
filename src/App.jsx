import { useState, useEffect } from "react";
import Home from "./screens/Home";
import Start from "./screens/Start";
import WordsIntro from "./screens/WordsIntro";
import WordsToLearn from "./screens/WordsToLearn";
import ClassificationIntro from "./screens/ClassificationIntro";
import WordClassification from "./screens/WordClassification";
import AnalogyIntro from "./screens/AnalogyIntro";
import WordAnalogy from "./screens/WordAnalogy";
import MatchingIntro from "./screens/MatchingIntro";
import ExpressionMatching from "./screens/ExpressionMatching";
import ParagraphIntro from "./screens/ParagraphIntro";
import Paragraph from "./screens/Paragraph";
import { paragraphData } from "./data/paragraph";  // ⭐ 추가
import { playLevelUp, vibrate } from "./utils/feedback";

export default function App() {
  const [unit, setUnit] = useState(1);
  const [screen, setScreen] = useState("home");
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [unlockedUnits, setUnlockedUnits] = useState(() => {
    const saved = localStorage.getItem("unlockedUnits");
    return saved ? JSON.parse(saved) : [1];
  });
  const [showUnitComplete, setShowUnitComplete] = useState(false);
  const [exercise, setExercise] = useState(0);
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("progress");
    return saved ? JSON.parse(saved) : {};
  });
  const [wordsDone, setWordsDone] = useState(false);
  const [classificationDone, setClassificationDone] = useState(false);
  const [matchingDone, setMatchingDone] = useState(false);
  const [paragraphDone, setParagraphDone] = useState(false);
  const [completedUnits, setCompletedUnits] = useState([]);
    const totalUnits = 14; // 👉 실제 Unit 개수로 수정
  const [showAllUnitsDone, setShowAllUnitsDone] = useState(false);
  const [perfectEffect, setPerfectEffect] = useState(false);
  const [stepEffect, setStepEffect] = useState(false);
  const [streak, setStreak] = useState(0);
  const unitProgress =
    (wordsDone ? 25 : 0) +
    (classificationDone ? 25 : 0) +
    (matchingDone ? 25 : 0) +
    (paragraphDone ? 25 : 0);
  const level = Math.floor(xp / 50) + 1;
  const addXP = () => {
    setXp((prev) => {
      const newXP = prev + 10;
      const newLevel = Math.floor(newXP / 50) + 1;
        if (newLevel > level) {
          setShowLevelUp(true);
          triggerFireworks(1200, 20); // ⭐ 여기로 대체
          playLevelUp();   // 🔊
          vibrate([200, 100, 200, 100, 300]); // 📳
        }
        return newXP;
    });
  };
  const triggerFireworks = (duration = 1500, count = 25) => {
    const particles = Array.from({ length: count }).map(() => ({
      id: Math.random(),
      left: Math.random() * 100,
      delay: Math.random() * 0.5
    }));

    setConfetti(prev => [...prev, ...particles]);

    // ⭐ Perfect 효과 ON
    setPerfectEffect(true);

    // 🔊 사운드 강화
    playLevelUp();
    vibrate([300, 100, 300]);

    setTimeout(() => {
      setConfetti([]);
      setPerfectEffect(false); // ⭐ 효과 OFF
    }, duration);

    setStreak(prev => {
      const next = prev + 1;

    // ⭐ 콤보 사운드
    if (next >= 3) {
      vibrate([100, 50, 100, 50, 200]);
    }

    return next;
    });
  };
  const getLearningComponent = () => {
    if (unit === 1) return "classification";
    if (unit === 2) return "analogy";
    return "classification";
  };
  const saveProgress = (unit, type) => {
    const updated = {
      ...progress,
      [unit]: {
        words: progress[unit]?.words || false,
        classification: progress[unit]?.classification || false,
        matching: progress[unit]?.matching || false,
        paragraph: progress[unit]?.paragraph || false,
        [type]: true
      }
    };
    setProgress(updated);
    localStorage.setItem("progress", JSON.stringify(updated));
    setUnlockedUnits((prev) =>
      prev.includes(unit + 1) ? prev : [...prev, unit + 1]
    );
    setStepEffect(true);
    setTimeout(() => setStepEffect(false), 400);
    // ⭐ 효과 실행
    playLevelUp();
    vibrate([200, 100, 200, 100, 300]);
  };
  const isUnitComplete = (unit) => {
    return (
      progress[unit]?.words &&
      progress[unit]?.classification &&
      progress[unit]?.matching &&
      progress[unit]?.paragraph
    );
  };
  const getUnitProgress = (unit) => {
    const p = progress[unit] || {};
    const total = 4;

    const done =
      (p.words ? 1 : 0) +
      (p.classification ? 1 : 0) +
      (p.matching ? 1 : 0) +
      (p.paragraph ? 1 : 0);

    return Math.floor((done / total) * 100);
  };
  const isAllComplete = (data) => {
    return Object.values(data).every(
      (u) =>
        u.words &&
        u.classification &&
        u.matching &&
        u.paragraph
    );
  };

  // ✅ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("score");
    if (saved) setScore(Number(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("score", score);
  }, [score]);

  const addScore = () => setScore((s) => s + 10);

  const goNext = () => {
    setExercise(prev => {
      const next = prev + 1;

      if (next < paragraphData.length) {
        return next;  // 다음 문제
      } else {
        setShowUnitComplete(true);  // ⭐ popup 실행
        handleUnitComplete(unit);
        return prev;
      }
    });
  };

  const handleUnitComplete = (unitId) => {
    setCompletedUnits((prev) => {
      if (prev.includes(unitId)) return prev;

      const updated = [...prev, unitId];

      // 🔥 여기서만 전체 완료 체크
      if (updated.length === totalUnits) {
        setShowAllUnitsDone(true);
      }

      return updated;
    });
  };

  return (
    <div
      className="container"
      style={{
        transform: perfectEffect ? "scale(1.08)" : "scale(1)",
        transition: "transform 0.3s ease"
      }}
    >
      {screen === "home" && (
        <Home
          goUnit={(id) => {
            setUnit(id);
              setScreen("start");
          }}
          unlockedUnits={unlockedUnits}
          progress={progress}
        />
      )}

      {screen === "start" && (
        <Start
          unit={unit}
          goHome={() => setScreen("home")}
          goWordsIntro={() => setScreen("wordsIntro")}
          goClassification={() => setScreen("classificationIntro")}
          goMatching={() => setScreen("matchingIntro")}
          goParagraph={() => setScreen("paragraphIntro")}
          setWordsDone={setWordsDone}
          setClassificationDone={setClassificationDone}
          setMatchingDone={setMatchingDone}
          setParagraphDone={setParagraphDone}
        />
      )}

      {screen === "wordsIntro" && (
        <WordsIntro
          goBack={() => setScreen("start")}
          goNext={(u) => {
            setUnit(u);
            setScreen("learn");
          }}
          unit={unit}
        />
      )}

      {screen === "learn" && (
        <WordsToLearn
          goBack={() => setScreen("start")}
          goNext={() => setScreen("classificationIntro")}
          setWordsDone={setWordsDone}
          progress={unitProgress}
          saveProgress={saveProgress}
          unit={unit}
        />
      )}
      
      {screen === "classificationIntro" && (
        <ClassificationIntro
          goBack={() => setScreen("start")}
          goNext={() => setScreen("classification")}
        />
      )}

      {screen === "classification" && (
        <WordClassification
          goBack={() => setScreen("start")}
          goMatching={() => setScreen("matchingIntro")}
          addScore={addScore}
          addXP={addXP}
          score={score}
          xp={xp}
          level={level}
          setClassificationDone={setClassificationDone}
          progress={unitProgress}
          saveProgress={saveProgress}
          unit={unit}
        />
      )}
      
      {screen === "AnalogyIntro" && (
        <AnalogyIntro
          goBack={() => setScreen("start")}
          goNext={() => setScreen("analogy")}
        />
      )}

      {screen === "analogy" && (
        <WordAnalogy
          goBack={() => setScreen("start")}
          goMatching={() => setScreen("matchingIntro")}
          addScore={addScore}
          addXP={addXP}
          score={score}
          xp={xp}
          level={level}
          setAnalogyDone={setAnalogyDone}
          progress={unitProgress}
          saveProgress={saveProgress}
          unit={unit}
        />
      )}

      {screen === "matchingIntro" && (
        <MatchingIntro
        goBack={() => setScreen("start")}
        goNext={(ex) => {
          setExercise(ex);          // 🔥 핵심
          setScreen("matching");
        }}
        />
      )}

      {screen === "matching" && (
        <ExpressionMatching
          exercise={exercise}
          goBack={() => setScreen("matchingIntro")}
          goNext={(ex) => {
            if (typeof ex === "number") {
              setExercise(ex);         // 다음 Exercise
            } else {
              setScreen("paragraphIntro");  // 다음 단계
            }
          }}
          progress={unitProgress}
          addScore={addScore}
          addXP={addXP}
          score={score}
          xp={xp}
          level={level}
          setMatchingDone={setMatchingDone}
          saveProgress={saveProgress}
          unit={unit}
          triggerFireworks={triggerFireworks}
        />
      )}

      {screen === "paragraphIntro" && (
        <ParagraphIntro
          goBack={() => setScreen("start")}
          goPrev={() => setScreen("matching")}
          goNext={(ex) => {
            setExercise(ex);
            setScreen("paragraph");
          }}
        />
      )}

      {screen === "paragraph" && (
        <Paragraph
          exercise={exercise}
          goBack={() => setScreen("paragraphIntro")}
          goNext={goNext}   // ⭐ 중요
          progress={unitProgress}
          addXP={addXP}
          score={score}
          level={level}
          xp={xp}
          setParagraphDone={setParagraphDone}
          saveProgress={saveProgress}
          unit={unit}
          triggerFireworks={triggerFireworks}
          handleUnitComplete={handleUnitComplete}
          setStreak={setStreak}
        />
      )}

      {showLevelUp && (
        <div style={{ ...styles.popup, animation: "pop 0.4s ease" }}>
          <div style={styles.sparkle}>✨✨✨</div>
            🎉 LEVEL UP! 🎉
            <br/>
            Lv. {level}
            <br />
          <button 
            style={styles.okBtn}
            onClick={() => {
            setShowLevelUp(false);
            setConfetti([]);   // 🎆 제거
          }}>
            👉 👉 Awesome!
          </button>
        </div>
      )}
      
      {confetti.map((c) => (
        <div
          key={c.id}
          style={{
            position: "fixed",
            left: `${c.left}%`,
            top: "40%",
            fontSize: "20px",
            zIndex: 2000,
            animation: `fall 1s ease ${c.delay}s forwards`
          }}
        >
          🎆
        </div>
      ))}

      {showUnitComplete && (
        <div style={styles.popup}>
          🎆🎆🎆
          <div style={styles.sparkle}>✨✨✨</div>
          <h2>🎉 Unit Complete!</h2>
          <p>Congratulations! 🏆</p>
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                style={styles.mainBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={() => {
                  setShowUnitComplete(false);
                  setScreen("home");
                }}
              >
                  🏠 Go Home
              </button>
              <button
                style={styles.retryBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={() => {
                  setShowUnitComplete(false);
                  setExercise(0);
                  setScreen("paragraph");
                }}
              >
                  🔄 Start Again
              </button>
            </div>
        </div>
      )}

      {streak > 1 && (
        <div style={styles.streak}>
          🔥 {streak} Combo!
        </div>
      )}
      
      {showAllUnitsDone && (
        <div style={styles.allUnitsDone}>
          🏆🏆🏆
        <div style={styles.sparkle}>✨✨✨</div>
        <h2>All Units Complete!</h2>
        <p>You are a Vocabulary Master 🎓</p>
        <button onClick={() => setShowAllUnitsDone(false)}>
          Awesome!
        </button>
        </div>
      )}

      {stepEffect && (
        <div style={styles.stepEffect}>
          ✨ +25%
        </div>
      )}

      {perfectEffect && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.25)",
            pointerEvents: "none",
            zIndex: 1500,
            animation: "flash 0.4s ease"
          }}
        />
      )}
    </div>
  );
}

const styles = {
  popup: {
    position: "fixed",
    top: "20%",
    left: "50%",
    width: "100%",
    maxWidth: "250px",
    transform: "translate(-50%, -50%)",
    background: "#fef3c7",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    zIndex: 1000
  },

  allUnitsDone: {
    position: "fixed",
    top: "30%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fef3c7",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
    zIndex: 1000
  },

  sparkle: {
    fontSize: "30px",
    marginBottom: "10px"
  },

  completeBox: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #4facfe, #00f2fe)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    textAlign: "center"
  },

  completeCard: {
    background: "rgba(255,255,255,0.1)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.4s ease"
  },

  mainBtn: {
    marginTop: "20px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    color: "black",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    cursor: "pointer",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto"
  },

  retryBtn: {
    marginTop: "20px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    color: "#9400d3",
    background: "linear-gradient(135deg, #ffffe0, #fafad2)",
    cursor: "pointer",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto"
  },

  okBtn: {
    marginTop: "16px",
    padding: "8px 24px",
    borderRadius: "12px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #32CD32, #ADEBB3)", // 초록 그라데이션
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    transition: "all 0.15s ease"
  },

  stepEffect: {
    position: "fixed",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#22c55e",
    animation: "popIn 0.4s ease",
    zIndex: 2000
  },

  streak: {
    position: "fixed",
    top: "10%",
    right: "10%",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#f97316",
    animation: "popIn 0.3s ease",
    zIndex: 2000
}
};