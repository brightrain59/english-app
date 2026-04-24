import { useState } from "react";
import TopBar from "../components/TopBar";
import { wordsData } from "../data/words";
import { analogyData } from "../data/analogy";

const sounds = {
  click: new Audio("/sounds/click.mp3"),
  correct: new Audio("/sounds/correct.mp3"),
  wrong: new Audio("/sounds/wrong.mp3"),
  combo: new Audio("/sounds/combo.mp3")
};

function playEffect(name) {
  const audio = sounds[name];
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function playVoice(unit, file) {
  const audio = new Audio(`/audio/unit${unit}/${file}`);
  audio.play().catch(() => {});
}

function createRipple(e) {
  try {
    const button = e.currentTarget;
    // ⭐ 사운드 먼저 실행 (핵심)
    playEffect("click");

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.position = "absolute";
    circle.style.borderRadius = "50%";
    circle.style.background = "rgba(88, 204, 2, 0.25)";
    circle.style.transform = "scale(0)";
    circle.style.animation = "ripple 0.4s ease-out";
    circle.style.pointerEvents = "none";
    circle.style.width = circle.style.height = `${diameter}px`;

    circle.style.left = `${
      e.clientX - button.getBoundingClientRect().left - radius
    }px`;
    circle.style.top = `${
      e.clientY - button.getBoundingClientRect().top - radius
    }px`;

    const oldRipple = button.querySelector(".ripple");
    if (oldRipple) oldRipple.remove();

    circle.classList.add("ripple");
    button.appendChild(circle);
  } catch (err) {
    console.error("Ripple error:", err);
  }
}

export default function WordAnalogy({
  goBack,
  goMatching,
  addScore,
  addXP,
  score,
  xp,
  level,
  setAnalogyDone,
  progress,
  saveProgress,
  unit,
  streak,
  setStreak
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [shake, setShake] = useState(false);

  const unitData = analogyData[unit];

if (!unitData) {
  console.log("❌ unit 문제:", unit);
  return <div>데이터 없음</div>;
}

const questions = unitData.questions;

if (!questions || questions.length === 0) {
  return <div>문제 없음</div>;
}

if (currentIndex >= questions.length) {
  return <div>끝!</div>;
}

const current = questions[currentIndex];

  // ✅ 정답 체크
  const checkAnswer = (choice) => {
    if (choice === current.answer) {
      setStreak(prev => {
        const next = prev + 1;

        // 🔥 콤보 사운드
        if (next >= 5) {
          playEffect("combo");
        } else {
          playEffect("correct");
        }

      return next;
      });

      setWrong(false);
      setShowAnswer(true);

      // ⭐ XP 보너스 (콤보 반영)
      const bonusXP = 10 + streak * 2;
      addXP && addXP(bonusXP);
      addScore && addScore();

    } else {
      playEffect("wrong");
      setWrong(true);
      setStreak(0);

      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.progressBar}>
        <div
          style={{
            width: `${progress}%`,  // ⭐ 여기
            height: "100%",
            background: "#22c55e",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)" // ⭐ 여기
          }}
        />
      </div>
      <TopBar
        title={unitData.title}
        progress={progress}
        score={score}
        level={level}
        onBack={goBack}
      />

      <h2
        style={{ 
          fontSize: "18px",
          fontWeight: "500",
          color: "white",
          marginTop: "30px",
          marginBottom: "10px",
          opacity: 0.9 }}>
        🧠 Word Analogy
      </h2>

      {/* 진행 표시 */}
      <p style={styles.progressText}>
        {currentIndex + 1} / {questions.length}
      </p>

      {/* 문제 */}
      <h2 style={{ marginTop: "30px" }}>{current.question}</h2>

      {/* 선택지 */}
      <div style={{
        ...styles.group,
        animation: shake ? "shake 0.3s" : "none"
      }}>
        {current.choices.map((choice, i) => (
          <button
            key={i}
            style={styles.btn}
            onClick={(e) => {
              if (showAnswer) return;
              checkAnswer(choice);
              createRipple(e);
            }}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* 피드백 */}
      {wrong && <p style={styles.feedback}>😢 Try again!</p>}
      {showAnswer && <p style={styles.feedback}>🎉 Great!</p>}

      {/* 설명 + Next */}
      {showAnswer && (
        <div style={styles.answerBox}>
          <p style={styles.explanation}>{current.explanation}</p>

          <button
            style={styles.nextBtn}
            onClick={(e) => {
              createRipple(e);

              if (currentIndex === questions.length - 1) {
                playEffect("levelup");
                setAnalogyDone(true);
                saveProgress(unit, "analogy");
                setShowComplete(true);
              } else {
                setCurrentIndex(prev => prev + 1);
                setWrong(false);
                setShowAnswer(false);
              }
            }}
          >
            Next ❯
          </button>
        </div>
      )}

      {/* 완료 팝업 */}
      {showComplete && (
        <div style={styles.popup}>
          🎆🎆🎆
          <div style={styles.sparkle}>✨✨✨</div>
          <h2>🎉 Analogy Complete!</h2>

          <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              style={styles.btnPrimary}
              onClick={() => {
                setShowComplete(false);
                goMatching();
              }}
            >
              👉 Next
            </button>

            <button
              style={styles.btnSecondary}
              onClick={() => {
                setShowComplete(false);
                setIndex(0);
                setWrong(false);
                setShowAnswer(false);
              }}
            >
              🔄 Start Again
            </button>
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
    overflow: "hidden"
  },

  progressText: {
    marginTop: "10px",
    fontSize: "14px"
  },

  group: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "30px",
    justifyContent: "center"
  },

  btn: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    color: "black",
    background: "linear-gradient(135deg, #ffffe0, #fafad2)",
    position: "relative",
    overflow: "hidden"
  },

  feedback: {
    marginTop: "15px",
    fontSize: "14px",
    fontWeight: "bold"
  },

  answerBox: {
    marginTop: "15px",
    textAlign: "center"
  },

  explanation: {
    fontSize: "14px",
    marginBottom: "10px"
  },

  nextBtn: {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    cursor: "pointer"
  },

  popup: {
    position: "fixed",
    top: "35%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fef3c7",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },

  btnPrimary: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    cursor: "pointer"
  },

  btnSecondary: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ffffe0, #fafad2)",
    cursor: "pointer"
  }
};