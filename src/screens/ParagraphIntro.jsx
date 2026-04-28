import { useState } from "react";
import TopBar from "../components/TopBar";
import { wordsData } from "../data/words";
import { paragraphData } from "../data/paragraph";

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

export default function ParagraphIntro({ goBack, goNext, unit }) {
  const [selectedExercise, setSelectedExercise] = useState(0);
  
  const wordUnit = wordsData[unit];
  if (!wordUnit) {
  return <div>Loading...</div>;
  }
  const words = wordUnit.words;

  return (
      <div style={styles.container}>
        <TopBar 
          title={wordUnit.title}
          onBack={goBack} />

      <h2
        style={{ 
          fontSize: "18px",
          fontWeight: "500",
          color: "white",
          marginTop: "30px",
          marginBottom: "10px",
          opacity: 0.9 }}>
        📝 Words in a Paragraph
      </h2>

        {/* 지시문 */}
        <p style={styles.instruction}>
        이제 글에서 단어를 연습하세요. 빈칸에<br />
        가장 알맞은 단어를 넣으세요. 빈칸 클릭 후<br />
        아래 단어 중에서 하나를 골라 클릭하세요.
        </p>

      <div style={styles.exerciseRow}>
        {[0, 1, 2].map((i) => (
        <button
          key={i}
          style={{
          ...styles.exerciseBtn,
          background: selectedExercise === i ? "linear-gradient(135deg, #ADEBB3, #32CD32)" : "linear-gradient(135deg, #f0d0e7, #fff0f5)",
          color: selectedExercise === i ? "white" : "black"
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={() => setSelectedExercise(i)}
        >
            {selectedExercise === i ? "✅ " : ""}
            Exercise {i + 1}
        </button>
        ))}
      </div>

      {/* 이미지 */}
      <img
        src="/start.png"
        alt="start"
        style={styles.image}
      />

      <button 
        style={styles.startBtn}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        onClick={(e) => {
          createRipple(e);
          setTimeout(() => {
          goNext(selectedExercise);   // ✔ 이건 맞음
  }, 120);
        }}>
          Start 🚀
      </button>
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

  instruction: {
    color: "#333",
    fontSize: "14px",
    lineHeight: "1.6",
    marginTop: "20px",
    marginBottom: "10px"
  },

  exerciseRow: {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
  justifyContent: "center"
  },

exerciseBtn: {
  height: "24px",
  padding: "0 16px",
  borderRadius: "8px",
  border: "none",
  background: "white",
  cursor: "pointer",
  justifyContent: "center",
  fontWeight: "400",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  transition: "all 0.2s"
  },

  image: {
    width: "120px",
    marginTop: "20px",
    marginBottom: "10px",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },

  startBtn: {
    height: "24px",
    padding: "0 24px",
    borderRadius: "6px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "black",
    fontSize: "12px",
    cursor: "pointer",
    marginTop: "5px",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.1s ease"
  }
};