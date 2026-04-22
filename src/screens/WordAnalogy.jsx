import { useState } from "react";
import TopBar from "../components/TopBar";
import { analogyData } from "../data/analogy";

const SOUND_ON = false;

function playClickSound() {
  if (!SOUND_ON) return;
  const audio = new Audio("/sounds/click.mp3");
  audio.play().catch(() => {});
}

function createRipple(e) {
  try {
    const button = e.currentTarget;
    playClickSound();
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
  unit
}) {
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const question = analogyData[index];

  // ✅ 정답 체크
  const checkAnswer = (choice) => {
    if (choice === question.answer) {
      setWrong(false);
      setShowAnswer(true);
      addScore && addScore();
      addXP && addXP();
    } else {
      setWrong(true);
    }
  };

  return (
    <div style={styles.container}>
      {/* 진행 바 */}
      <div style={styles.progressBar}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#22c55e",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />
      </div>

      <TopBar
        title="🧠 Word Analogy"
        progress={progress}
        score={score}
        level={level}
        onBack={goBack}
      />

      {/* 진행 표시 */}
      <p style={styles.progressText}>
        {index + 1} / {analogyData.length}
      </p>

      {/* 문제 */}
      <h2 style={{ marginTop: "30px" }}>{question.question}</h2>

      {/* 선택지 */}
      <div style={styles.group}>
        {question.choices.map((choice, i) => (
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
          <p style={styles.explanation}>{question.explanation}</p>

          <button
            style={styles.nextBtn}
            onClick={(e) => {
              createRipple(e);

              if (index === analogyData.length - 1) {
                setAnalogyDone(true);
                saveProgress(unit, "analogy");
                setShowComplete(true);
              } else {
                setIndex(index + 1);
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
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden"
  },

  progressText: {
    marginTop: "10px",
    fontSize: "12px"
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
    fontSize: "13px",
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