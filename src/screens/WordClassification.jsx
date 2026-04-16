import { useState } from "react";
import TopBar from "../components/TopBar";
import { classificationData } from "../data/classification";

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

export default function WordClassification({ 
  goBack,
  goMatching,
  addScore,
  addXP,
  score,
  xp,
  level,
  setClassificationDone,
  progress,
  saveProgress,
  unit
}) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const questions = classificationData;



  const current = questions[step];
    if (!current || !current.words.includes(current.answer)) {
    return <div>Data Error ⚠️</div>;
    }

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
        title="🧠 Word Classification"
        progress={progress}
        score={score}
        level={level}
        onBack={goBack}
      />

      {/* 진행 표시 */}
      <p style={styles.progressText}>
        {step + 1} / {questions.length}
      </p>

      {/* 단어 버튼 */}
      <div style={styles.group}>
        {current.words.map((w) => (
          <button
            key={w}
            style={{
              ...styles.btn,
              background:
                  selected === w
                    ? w === current.answer
                    ? "linear-gradient(135deg, #ADEBB3, #32CD32)"
                    : "linear-gradient(135deg, #663399, #9370db)"
                  : "linear-gradient(135deg, #ffffe0, #fafad2)"    
            }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onClick={(e) => {
                // ❌ 정답 맞춘 경우만 막기
                if (selected === current.answer) return;
                setSelected(w);
                if (w === current.answer) {
                addScore && addScore();
                addXP && addXP(); }
                if (w !== current.answer) {
                setTimeout(() => {
                  setSelected(null);
                }, 600);
                }
                createRipple(e); }} >
                {w}
          </button>
        ))}
      </div>

      {/* 피드백 */}
      {selected && (
        <p style={styles.feedback}>
          {selected === current.answer ? "🎉 Great!" : "😢 Try again!"}
        </p>
      )}

      {/* Explanation 버튼 */}
      {selected === current.answer && !showAnswer && (
        <button
          style={styles.checkBtn}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
          onClick={(e) => {
            createRipple(e);
            setShowAnswer(true);
            }}
        >
          Explanation 📖
        </button>
      )}

      {/* 설명 + Next */}
      {showAnswer && (
        <div style={styles.answerBox}>
          <p style={styles.explanation}>
            {current.explanation}
          </p>

          <button
            style={styles.nextBtn}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            onClick={(e) => {
              createRipple(e);
            
            setTimeout(() => {
              if (step === questions.length - 1) {
                setClassificationDone(true);
                saveProgress(unit, "classification");
                setShowComplete(true);   // ⭐ popup 띄움
              } else {
                setStep(step + 1);
              };
              setSelected(null);
              setShowAnswer(false);
            }, 120);
            }}
          >
            Next ❯
          </button>
        </div>
      )}
          
      {/* ⭐ container 밖으로 이동 */}
      {showComplete && (
        <div style={styles.popup}>
          🎆🎆🎆
          <div style={styles.sparkle}>✨✨✨</div>
            <h2>🎉 Classification Complete!</h2>

          <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              style={styles.btnPrimary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={() => {
                setShowComplete(false);
                goMatching();
              }}
            >
                👉 Next
            </button>

            <button
              style={styles.btnSecondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={() => {
                setShowComplete(false);
                setStep(0);
                setSelected(null);
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
    marginTop: "40px",
    justifyContent: "center"
  },

  btn: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
    color: "black",
    position: "relative",
    overflow: "hidden"
  },

  checkBtn: {
    marginTop: "10px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ffffe0, #fafad2)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  },

  nextBtn: {
    marginTop: "20px",
    padding: "6px 14px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "black",
    cursor: "pointer",
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

  done: {
    marginTop: "10px",
    color: "black",
    fontSize: "18px"
  },

  popup: {
    position: "fixed",
    top: "35%",
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

  btnPrimary: {
    marginTop: "24px",
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

  btnSecondary: {
    marginTop: "24px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    color: "#9400d3",
    background: "linear-gradient(135deg, #ffffe0, #fafad2)",
    cursor: "pointer",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto"
  }
};