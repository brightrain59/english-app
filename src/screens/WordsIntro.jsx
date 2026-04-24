import TopBar from "../components/TopBar";
import { wordsData } from "../data/words";

function playEffect(name) {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.play().catch(() => {});
}

function createRipple(e) {
  const button = e.currentTarget;

  // ⭐ 사운드 먼저 실행 (핵심)
  playEffect("click")

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

export default function WordsIntro
({ goBack, goNext, unit }) {  
  
  const unitData = wordsData[unit];
  if (!unitData) {
  return <div>Loading...</div>;
  }
  const words = unitData.words;

  return (
    <div style={styles.container}>
      <TopBar 
        title={unitData.title}
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

      {/* 지시문 */}
      <p style={styles.instruction}>
        이번에 학습할 단어를 얼마나 알고 있나요?<br />
        단어의 발음과 의미를 알면 <b>‘I know’</b>,<br />
        모르면 <b>‘I don’t know’</b> 버튼을 클릭하세요.
      </p>

      <p style={{ fontSize: "14px", opacity: 0.9 }}>
        {unitData.words.length} words
      </p>

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
            goNext(unit);
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

  image: {
    width: "120px",
    marginTop: "10px",
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
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "10px",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.1s ease"
  }
};