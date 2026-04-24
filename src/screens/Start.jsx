import TopBar from "../components/TopBar";
import { useState } from "react";
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

export default function Start({
  goHome,
  goWordsIntro,
  goClassification,
  goAnalogy,
  goMatching,
  goParagraph,
  unit,
  progress,
  setWordsDone,
  setClassificationDone,
  setMatchingDone,
  setParagraphDone
}) {

  const [open, setOpen] = useState(false);

  const unitData = wordsData[unit];

  const activityMap = {
    1: "Word Classification",
    2: "Word Analogy",
    3: "Word Classification",
    4: "Word Analogy",
  };

  const activityName = activityMap[unit] || "Word Classification";
  
  return (
    <div style={styles.container}>
      <TopBar title={unitData.title} onBack={goHome} />

      <h2
        style={{ 
          fontSize: "18px",
          color: "white",
          marginTop: "30px",
          marginBottom: "10px" }}>
        Table of Contents
      </h2>

      {/* Words to Learn */}
      <div style={styles.menu}>
        <div>
        <button
          style={{
            ...styles.menuBtn}}
          onClick={(e) => {
            createRipple(e);       // ⭐ 추가
            setOpen(!open);        // 기존 기능 유지
            }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
          }}

          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.2)";
          }}
        >
          <span style={styles.text}> 📖 Words to Learn</span>
          <span 
            style={{
              ...styles.arrow, 
              transform: open ? "rotate(90deg)" : "translateX(0px)",
            }}
          >
            ❯
          </span>
        </button>
        

        {/* ⭐ 단어 미리보기 */}
        {open && (
          <div style={styles.preview}>
            {unitData.words.slice(0, 5).map((w, i) => (
              <div key={i} style={styles.wordItem}>
                {w.word}
              </div>
            ))}

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
                setWordsDone(false);		
                setClassificationDone(false);
                setMatchingDone(false);
                setParagraphDone(false);
                setTimeout(() => {
                  goWordsIntro(unit);
                }, 120);
              }}>
              Start 🚀
            </button>
          </div>
        )}
      </div>
        <MenuButton
          text={
            progress?.[unit]?.classification
              ? `✅ ${activityName}`
              : `🧠 ${activityName}`
          }
          onClick={unit === 1 ? goClassification : goAnalogy}>
          <span style={styles.arrow}>❯</span>
        </MenuButton>
        <MenuButton
          text={
            progress?.[unit]?.matching
              ? "✅ Expression Matching"
              : "🔗 Expression Matching"
          }
          onClick={goMatching} >
          <span style={styles.arrow}>❯</span>
        </MenuButton>
        <MenuButton
          text={
            progress?.[unit]?.paragraph
              ? "✅ Words in a Paragraph"
              : "📝 Words in a Paragraph"
          }
          onClick={goParagraph} >
          <span style={styles.arrow}>❯</span>
        </MenuButton>
      </div>
    </div>
  );
}

function MenuButton({ text, onClick, children }) {
  return (
    <button
      style={styles.card}
      onClick={(e) => {
        createRipple(e);   // ⭐ 추가
        onClick();         // 기존 이동 유지
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
      }}

      onMouseOut={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.2)";
      }}
    >
      <span style={styles.text}>{text}</span>
      {children}   {/* ⭐ 이거 추가 */}
    </button>
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

  text: {
    whiteSpace: "nowrap",   // ⭐ 핵심
    position: "relative",
    zIndex: 1
  },

  arrow: {
    fontSize: "14px",
    opacity: 0.6,
    transition: "0.2s",
    position: "relative",   // ⭐ 추가
    zIndex: 1               // ⭐ 추가
  },

  menuBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "300px",
    height: "36px",
    padding: "0 12px",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    background: "#ffffff",
    color: "#161e2b",
    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    position: "relative",
    overflow: "hidden"
  },

  menu: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
    maxWidth: "240px"
  },

  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "36px",
    padding: "0 12px",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    background: "#ffffff",
    color: "#161e2b",
    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    position: "relative",
    overflow: "hidden"
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
    overflow: "hidden"
  },

  row: {
    display: "flex",
    alignItems: "center",
    width: "100%"
  }
};