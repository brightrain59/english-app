import React, { useState, useEffect, useRef } from "react";
import { wordsData } from "../data/words";
import { paragraphData } from "../data/paragraph";
import TopBar from "../components/TopBar";

/* 🔊 효과음 */
function playEffect(name) {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.play().catch(() => {});
}

/* 🔊 학습 음성 */
function playVoice(unit, file) {
  const audio = new Audio(`/audio/unit${unit}/${file}`);
  audio.play().catch(() => {});
}

/* 💧 ripple */
function createRipple(e) {
  const button = e.currentTarget;

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.position = "absolute";
  circle.style.borderRadius = "50%";
  circle.style.background = "rgba(88, 204, 2, 0.25)";
  circle.style.transform = "scale(0)";
  circle.style.animation = "ripple 0.4s ease-out";
  circle.style.pointerEvents = "none";

  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;

  const old = button.querySelector(".ripple");
  if (old) old.remove();

  circle.classList.add("ripple");
  button.appendChild(circle);
}

export default function Paragraph({
  exercise,
  goBack,
  goNext,
  addXP,
  level,
  xp,
  progress,
  saveProgress,
  setParagraphDone,
  unit,
  triggerFireworks,
  handleUnitComplete,
  streak,
  setStreak
}) {
  
  const currentSet = paragraphData[exercise];

  if (!currentSet) {
    return <div style={{ color: "white" }}>Loading...</div>;
  }

  const sentences = currentSet.sentences; // ⭐ 이거 추가

  /* 🧠 상태 */
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    setShowAnswer(false);
    setRating("");        // ⭐ Perfect/Good 초기화
    setFeedback("");
    setActiveBlank(null);
    setResult(null);
    setWrong(false);
        
    if (sentences) {
      setAnswers(
        sentences.map(s => {
          const blanks = s.text.split(/_{3,}/).length - 1;
          return Array(blanks).fill(null);
        })
      );
    }
  }, [sentences]);

  const audioRef = useRef(null);
    useEffect(() => {
      audioRef.current = new Audio(`/audio/unit${unit}/paragraph/ex${exercise + 1}.mp3`);
  }, [exercise]);

  const [feedback, setFeedback] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState(null); 
  const [rating, setRating] = useState("");
  const [wrong, setWrong] = useState(false);

  /* 🎯 선택 */
  const [activeBlank, setActiveBlank] = useState(null);

  const handleBlankClick = (sIdx, bIdx) => {
    setActiveBlank({ sIdx, bIdx });
  };

  const handleClick = (word, e) => {
    createRipple(e);

  if (showAnswer) return;

  handleWordClick(word);
  };

const handleWordClick = (word) => {
  if (!activeBlank) return;

  const { sIdx, bIdx } = activeBlank;

  setAnswers(prev => {
    const newAnswers = prev.map(arr => [...arr]);

    // 🔥 이미 선택된 단어 제거
    for (let i = 0; i < newAnswers.length; i++) {
      const foundIndex = newAnswers[i].indexOf(word);
      if (foundIndex !== -1) {
        newAnswers[i][foundIndex] = null;
      }
    }

    // 선택한 위치에 넣기
    newAnswers[sIdx][bIdx] = word;

    return newAnswers;
  });
  };

  /* 🎯 전체 정답 체크 */
  const isAllCorrect = currentSet.sentences.every((s, sIdx) => {
  // answers가 없으면 통과
    if (!s.answers || s.answers.length === 0) return true;

    // 배열이 아니면 강제로 배열로 변환
    const correctAnswers = Array.isArray(s.answers)
      ? s.answers
      : [s.answers];

    if (!answers?.[sIdx]) return false;

    return correctAnswers.every((ans, bIdx) => {
      return answers[sIdx]?.[bIdx] === ans;
    });
  });

  /* 🎯 채점 */
  const handleCheck = () => {
  if (isAllCorrect) {
    playEffect("correct");
    setFeedback("🎉 Great!");
    setShowAnswer(true);
    setResult("correct");

    const isPerfect = true;
    setRating(isPerfect ? "Perfect! 🏆" : "Good! 👍");

    addXP && addXP(20 + streak * 2);

    setStreak(prev => {
      const next = prev + 1;
      if (next === 5) playEffect("combo");
      return next;
    });

  } else {
    playEffect("wrong");
    setFeedback("😢 Check the highlighted blanks!");
    setShake(true);
    setWrong(true);
    setStreak(0);
    setResult("wrong");

    setTimeout(() => setShake(false), 500);
  }
};

  /* 🎯 다음 */
  const handleNext = () => {
    const isPerfect = !wrong;

    setRating(isPerfect ? "🏆 Perfect!" : "👍 Good!");

    if (exercise === paragraphData.length - 1) {
      setParagraphDone(true);
      saveProgress(unit, "paragraph");
      handleUnitComplete(unit);

    if (isPerfect) {
      triggerFireworks(); // 🎆
    }
  }

  goNext && goNext();
};

  const fillText = (text, answers) => {
    if (!answers || answers.length === 0) return text;

    let i = 0;
    return text.replace(/_{3,}/g, () => answers[i++] || "");
  };

  const fullText = currentSet.sentences
    .map(s => fillText(s.text, s.answers))
    .join(" ");

  const fullKo = currentSet.sentences
    .map(s => s.ko)
    .join(" ");

  const handleListen = () => {
  const audio = audioRef.current;
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
  audio.playbackRate = 1;
  audio.play();
};

  const handleSlow = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = 0.8;
    audio.play();
  };
  
  const unitData = wordsData[unit];
  if (!unitData) {
  return <div>Loading...</div>;
  }
  const words = unitData.words;

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
        onBack={goBack}
        level={level}
        xp={xp}
        progress={progress}
      />

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

      <div style={styles.subtitle}>
        {currentSet.title}
      </div>

      {/* 🔥 단락 전체 */}
      <div style={styles.paragraph}>
        {currentSet.sentences.map((s, sIdx) => {
          const parts = s.text.split(/_{3,}/);
            return (
              <span key={sIdx}>
                {parts.map((part, i) => {
                  const word = answers[sIdx]?.[i];
                  const isCorrect =
                  s.answers?.[i] === word;

            return (
            <React.Fragment key={i}>
              {part}

              {i < parts.length - 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlankClick(sIdx, i);
                  }}
                  style={{
                    ...styles.blank,

                    // ⭐ 선택된 빈칸 강조
                    ...(activeBlank?.sIdx === sIdx &&
                    activeBlank?.bIdx === i
                      ? styles.blankActive
                      : {}),

                    // ⭐ 실시간 정답/오답 색상
                    ...(word
                      ? isCorrect
                        ? styles.correctLive
                        : styles.wrongLive
                      : {})
                  }}
                >
                  <span style={styles.word}>
                    {word || ""}
                  </span>
                </span>
              )}
            </React.Fragment>
          );
        })}

        {" "}
      </span>
    );
  })}
</div>

      {/* 🔥 선택지 */}
      <div style={styles.choices}>
        {[
          ...new Set(
            currentSet.sentences.flatMap(s => s.choices || [])
          )
        ].map(word => (
          <button
            key={word}
            style={{
              ...styles.choiceBtn,
              ...(shake ? styles.shake : {})
            }}
            onClick={(e) => {
              playEffect("click");
              handleClick(word, e)}}
          >
            {word}
          </button>
        ))}
      </div>

      {/* 🔥 피드백 */}
      {feedback && <p>{feedback}</p>}

      {/* 🔥 버튼 */}
      {!showAnswer ? (
        <button style={styles.checkBtn} onClick={handleCheck}>
          Check All ✔
        </button>
      ) : (
        <div style={styles.resultBox}>

          {/* 영어 전체 */}
          <div style={styles.resultEn}>
            {fullText}
          </div>

          {/* 한국어 전체 */}
          <div style={styles.resultKo}>
            {currentSet.sentences
              .map(s => s.ko)
              .join(" ")}
          </div>

          {/* 팁 */}
          <ul style={styles.resultTips}>
            {[...new Set(currentSet.sentences.flatMap(s => s.tips || []))]
              .map((tip, idx) => (
              <li key={idx}>💡 {tip}</li>
            ))}
          </ul>
          <div style={styles.resultButtons}>
            <button style={styles.btnListen} onClick={handleListen}>
              🔊 Listen
            </button>

            <button style={styles.btnSlow} onClick={handleSlow}>
              🐢 Slow
            </button>

            <button style={styles.btnOk} onClick={handleNext}>
              👍 OK
            </button>
          </div>
        </div>
      )}
                
      <div style={styles.ratingText}>
        {rating}
      </div>
    </div>
  );
}

/* 🎨 스타일 */
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
  
  subtitle: {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1.8",
    marginTop: "10px",
    color: "#333"
  },

  paragraph: {
    marginTop: "20px",
    fontSize: "15px",
    gap: "10px",
    lineHeight: "1.8",
    textAlign: "left",
    maxWidth: "400px",
    wordBreak: "keep-all",    // ⭐ 단어 단위 유지
    whiteSpace: "normal",     // ⭐ 줄바꿈 허용
    marginLeft: "auto",       // ⭐ 가운데 정렬
    marginRight: "auto"
    },

  blank: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "60px",   // ⭐ 90 → 50
    height: "24px",     // ⭐ 26 → 24
    margin: "0 2px",    // ⭐ 6 → 2
    padding: "0 4px",
    maxWidth: "120px",  // ⭐ 너무 커지는 것 방지
    borderRadius: "6px",
    backgroundColor: "rgba(255,255,255,0.15)",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.15s ease"
  },

  blankActive: {
    backgroundColor: "#ffffff",   // ⭐ 확실한 대비
    color: "#333",                // 글자색 변경
    border: "1px solid #0000CD",  // ⭐ 초록 테두리
    transform: "scale(1.08)",     // ⭐ 살짝 확대
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)", // ⭐ 떠 보이게
    transition: "all 0.15s ease"
  },

  blankHover: {
    backgroundColor: "rgba(255,255,255,0.25)"
  },

  word: {
    fontSize: "14px",
    padding: "0 4px",
    letterSpacing: "0.3px",
    display: "inline-block",
    animation: "popIn 0.2s ease"
  },

  choices: {
    marginTop: "20px",
    marginBottom: "20px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },

  choiceBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    cursor: "pointer"
  },

  checkBtn: {
    marginTop: "20px",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "black",
    cursor: "pointer",
    transition: "0.15s"
    },

  correctLive: {
    backgroundColor: "#ADEBB3",
    color: "#333",
    transform: "scale(1.05)"
  },

  wrongLive: {
    backgroundColor: "#9370db",
    color: "#fff",
    animation: "shake 0.3s"
  },

  nextBtn: {
    marginTop: "10px",
    padding: "8px 16px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    border: "none",
    cursor: "pointer"
  },

  shake: {
    animation: "shake 0.3s"
  },

  resultBox: {
    marginTop: "5px",
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "left"
  },

  resultItem: {
    marginBottom: "16px",
    textAlign: "left",
    lineHeight: "1.8"
  },


  resultEn: {
    color: "black",
    fontSize: "15px",
    fontWeight: "500",
    marginBottom: "4px",
    textAlign: "left"
  },

  resultKo: {
    fontSize: "14px",
    marginTop: "10px",
    textAlign: "left"
  },

  resultTips: {
    color: "black",
    paddingLeft: "16px",
    fontSize: "14px",
    textAlign: "left"
  },

  resultButtons: {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginTop: "12px"
},

  btnListen: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#dbeafe",
    cursor: "pointer",
    transition: "0.15s"
  },

  btnSlow: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#fde68a",
    cursor: "pointer",
    transition: "0.15s"
  },

  btnOk: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "black",
    cursor: "pointer",
    transition: "0.15s"
 },

  ratingText: {
    marginTop: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff"
  }
};