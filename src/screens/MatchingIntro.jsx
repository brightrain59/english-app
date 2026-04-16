import { useState } from "react";
import TopBar from "../components/TopBar";
import { matchingData } from "../data/matching";

function playClickSound() {
  const audio = new Audio("/sounds/click.mp3");
  audio.play().catch(() => {});
}

function createRipple(e) {
  const button = e.currentTarget;

    // ⭐ 사운드 먼저 실행 (핵심)
  playClickSound();

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

export default function MatchingIntro({ goBack, goNext }) {

  const [selectedExercise, setSelectedExercise] = useState(0);
  
  return (
    <div style={styles.container}>
      <TopBar 
        title={"🔗 Expression Matching"}
        onBack={goBack} />

      {/* 지시문 */}
      <p style={styles.instruction}>
        왼쪽 열의 표현 하나를 클릭하세요. 그런 다음<br />
        오른쪽 열의 표현 하나를 클릭하여 문장을 만드세요.<br />
        반드시 4개의 자연스러운 문장을 만드세요.
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
          goNext(selectedExercise);
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
    color: "white",
    fontSize: "14px",
    lineHeight: "1.6",
    marginTop: "40px",
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
    marginTop: "10px",
    opacity: 0.9
  },

  startBtn: {
    height: "24px",
    padding: "0 16px",
    borderRadius: "6px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "black",
    fontSize: "12px",
    cursor: "pointer",
    marginTop: "5px",
    position: "relative",
    overflow: "hidden"
  }
};