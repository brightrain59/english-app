import { useState } from "react";
import TopBar from "../components/TopBar";
import { wordsData } from "../data/words";
import { analogyData } from "../data/analogy";

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
  setStreak,
  setComboFlash
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [wrong, setWrong] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [shake, setShake] = useState(false);

  const unitData = analogyData[unit];

if (!unitData) {
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
        if (next >= 7 && next % 3 === 0) {
          playEffect("combo");
          setComboFlash(false);        // ⭐ 추가
            setTimeout(() => setComboFlash(true), 10);
            setTimeout(() => setComboFlash(false), 400);
        } else {
          playEffect("correct");
        }

      return next;
      });

      setWrong(false);
      setShowAnswer(true);

      // ⭐ XP 보너스 (콤보 반영)
      const bonusXP = 10 + Math.floor(streak / 2);
      addXP && addXP(bonusXP);
      addScore && addScore();

    } else {
      playEffect("wrong");
      setWrong(true);
      setShake(true);
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
      <p style={{ 
        ...styles.question
        }}>
          {current.question}</p>

      {/* 선택지 */}
      <div style={{
        ...styles.group,
        animation: shake ? "shake 0.3s" : "none"
      }}>
        {current.choices.map((choice, i) => (
          <button
            key={choice}
            style={{
              ...styles.btn,
              background:
                  selected === choice
                    ? choice === current.answer
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
                setSelected(choice);
                if (choice === current.answer) {
                  playEffect("correct");
                  addScore && addScore();
                  addXP && addXP(); }
                if (choice !== current.answer) {
                  playEffect("wrong");
                  setTimeout(() => {
                    setSelected(null);
                  }, 600);
                }
                createRipple(e);
                checkAnswer(choice) }}>
                {choice}
          </button>
        ))}
      </div>

      {/* 피드백 */}
      {selected && (
        <p style={styles.feedback}>
          {selected === current.answer ? "🎉 Great!" : "😢 Try again!"}
        </p>
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
                  if (currentIndex === questions.length - 1) {
                    playEffect("levelup");
                    const type = unit === 2 ? "analogy" : "classification";
                    setAnalogyDone(true);
                    saveProgress(unit, type);
                    setShowComplete(true);   // ⭐ popup 띄움
                  } else {
                    setCurrentIndex(prev => prev + 1);
                  };
                  setWrong(false);
                  setShowAnswer(false);
                  setSelected(null);
                }, 120);
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
                setCurrentIndex(0);
                setStep(0);
                setSelected(null);
                setShowAnswer(false);
                setWrong(false);
                setShake(false);
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
    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden"
  },

  progressText: {
    marginTop: "10px",
    fontSize: "14px"
  },

  question: {
    marginTop: "10px",
    marginBottome: "20px",
    fontSzie: "16px",
    color: "#ffc60a"
  },

  group: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
    justifyContent: "center"
  },

  btn: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: "14px",
    color: "black",
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
    textAlign: "center",
    animation: "fadeIn 0.3s ease"
  },

  explanation: {
    fontSize: "14px",
    marginBottom: "10px"
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