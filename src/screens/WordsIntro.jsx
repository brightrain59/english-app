import TopBar from "../components/TopBar";
import { wordsData } from "../data/words";

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
        📖 Preview
      </h2>

      {/* 지시문 */}
      <p style={styles.instruction}>
        이번 단원에서 배울 단어를 미리 살펴봅니다. 단어를 눌러 <b>뜻과 예문</b>을 확인하고, 🔊 버튼으로 <b>단어와 예문의 발음</b>을 들어 보세요. {unit <= 20
          ? "헷갈리는 단어는 ⭐로 표시해 두세요."
          : "카드를 한 번 누르면 뜻과 예문, 한 번 더 누르면 예문 번역이 나와요. 헷갈리는 단어는 ⭐로 표시해 두세요."}
      </p>

      <p style={{ fontSize: "14px", opacity: 0.9 }}>
        {wordUnit.words.length} words
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
    background: "transparent",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    color: "white"
  },

  instruction: {
    maxWidth: "330px",
    wordBreak: "keep-all",
    textAlign: "center",
    marginLeft: "auto",
    marginRight: "auto",
    color: "#fff",
    fontSize: "16px",
    lineHeight: "1.8",
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
    height: "44px",
    padding: "0 36px",
    borderRadius: "6px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "black",
    fontSize: "17px",
    cursor: "pointer",
    marginTop: "10px",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.1s ease"
  }
};