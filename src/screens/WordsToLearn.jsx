import { useState } from "react";
import TopBar from "../components/TopBar";
import { wordsData } from "../data/words";

const sounds = {
  click: new Audio("/sounds/click.mp3"),
  correct: new Audio("/sounds/correct.mp3"),
  wrong: new Audio("/sounds/wrong.mp3"),
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
  const button = e.currentTarget;

  // ⭐ 사운드 먼저 실행 (핵심)
  playEffect("click");

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  // ⭐ Duolingo 스타일 색
  circle.style.position = "absolute";
  circle.style.borderRadius = "50%";
  circle.style.background = "rgba(88, 204, 2, 0.25)"; // 초록빛
  circle.style.transform = "scale(0)";
  circle.style.animation = "ripple 0.4s ease-out";
  circle.style.pointerEvents = "none";
  circle.style.zIndex = "0";

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

  // ⭐ 클릭 눌림 효과 (Duolingo 느낌)
  button.style.transform = "scale(0.97)";
  setTimeout(() => {
    button.style.transform = "scale(1)";
  }, 150);
}

export default function WordsToLearn({ 
  goBack,
  goNext,
  setWordsDone,
  progress,
  unit,
  saveProgress,
  handleNext
  }) {
  
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const unitData = wordsData[unit];
  const words = unitData.words;
  const handleKnow = () => {
    goNextWord();
  };
  const handleDontKnow = () => {
  setShowAnswer(true);
  };
  const goNextWord = () => {
    // ⭐ 마지막 단어일 때
    if (index >= words.length - 1) {
      setWordsDone(true);
      saveProgress(unit, "words");
      setShowComplete(true);   // popup 띄우기
      return;                  // ❗ 더 이상 진행 안 함
    }

    // ⭐ 일반 진행
    setIndex((prev) => prev + 1);
    setShowAnswer(false);
  };
  const handleClickEffect = (e, callback) => {
    createRipple(e);

    setTimeout(() => {
      if (callback) callback();
    }, 120);
  };
  const playVoice = (word) => {
    const audio = new Audio(`/audio/unit${unit}/${word}.mp3`);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

return (
  <>
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
        onBack={goBack} />

      <h2
        style={{ 
          fontSize: "18px",
          fontWeight: "500",
          color: "white",
          marginTop: "30px",
          marginBottom: "10px",
          opacity: 0.9 }}>
        📖 Words to Learn
      </h2>

      <div style={styles.card}>
        {index < words.length ? words[index].word : "Preview Done!"}
      </div>

      <div style={styles.row}>
        <button
          style={styles.knowBtn} 
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={(e) => handleClickEffect(e, handleKnow)}>
          I know 👍
        </button>

        <button
          style={styles.dontKnowBtn} 
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={(e) => handleClickEffect(e, handleDontKnow)}>
          I don’t know 👎
        </button>    
      </div>

      {showAnswer && index < words.length && (
        <>
          <p style={styles.meaning}>
            {words[index].meaning}
          </p>

          <div style={styles.row}>
            <button
              style={styles.listenBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {

                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={(e) =>
                handleClickEffect(e, () => playVoice(words[index].word))
              }>
              🔊 Listen
            </button>

            <button
              style={styles.nextBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={(e) => handleClickEffect(e, goNextWord)}>
              Next ❯
            </button>
          </div>
        </>
      )}
    </div>

    {/* ⭐ container 밖으로 이동 */}
    {showComplete && (
      <div style={styles.popup}>
        🎆🎆🎆
        <div style={styles.sparkle}>✨✨✨</div>
          <h2>🎉 Preview Complete!</h2>

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
              handleNext();
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
              setIndex(0);
            }}
          >
            🔄 Review Again
          </button>
        </div>
      </div>
    )}
  </>
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
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden"
  },

  card: {
    width: "150px",
    height: "50px",
    borderRadius: "8px",
    background: "#eee",
    color: "black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px", //
    marginTop: "30px"
  },

  knowBtn: {
    flex: 1,
    width: "130px",
    height: "30px",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "white",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "20px",
    position: "relative",
    overflow: "hidden"
  },
  
  dontKnowBtn: {
    flex: 1,
    width: "130px",
    height: "30px",
    background: "linear-gradient(135deg, 	#FFA500, #ff8000)",
    color: "white",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginTop: "20px",
    position: "relative",
    overflow: "hidden"
  },

  meaning: {
    fontSize: "13px",
    marginTop: "12px",
    textAlign: "center"
  },

  listenBtn: {
    flex: 1,
    width: "100px",
    height: "30px",
    background: "linear-gradient( #ffffe0, #fafad2)",
    color: "black",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: "none",
    margin: "5px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.1s ease"
  },

  nextBtn: {
    flex: 1,
    width: "100px",
    height: "30px",
    background: "linear-gradient( #fafad2, #ffffe0)",
    color: "black",
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: "none",
    margin: "5px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.1s ease"
  },

  row: {
    display: "flex",
    gap: "10px",
    marginTop: "15px"
  },

  btnActive: {
    transform: "scale(0.95)"
},

  popup: {
    position: "fixed",
    top: "36%",
    left: "50%",
    width: "100%",
    maxWidth: "250px",
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