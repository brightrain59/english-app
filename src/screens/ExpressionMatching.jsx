import { useState, useRef, useEffect } from "react";
import { wordsData } from "../data/words";
import { matchingData } from "../data/matching";
import TopBar from "../components/TopBar";

/* 🔊 효과음 */
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

/* 🔊 학습 음성 */
function playVoice(unit, file) {
  const audio = new Audio(`/audio/unit${unit}/${file}`);
  audio.play().catch(() => {});
}

/* 💧 ripple */
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

  const old = button.querySelector(".ripple");
    if (old) old.remove();

  circle.classList.add("ripple");
  button.appendChild(circle);
  } catch {}
}

export default function ExpressionMatching ({ 
  exercise,
  goBack,
  goNext,
  score,
  addScore,
  addXP,
  level,
  xp,
  setMatchingDone,
  progress,
  unit,
  saveProgress,
  triggerFireworks
}) {
  const containerRef = useRef();
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [showAnswer, setShowAnswer] = useState(null);
  const [lines, setLines] = useState([]);
  const [shake, setShake] = useState(false);
  const [wrongLine, setWrongLine] = useState(null);
  const [stars, setStars] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [result, setResult] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  // 📦 데이터 보호
  const safeExercise = Math.min(exercise, matchingData.length - 1);
  const currentSet = matchingData[safeExercise];

  const sentences = currentSet.sentences;
  const options = currentSet.options;

  // 🔄 exercise 변경 시 초기화
  useEffect(() => {
    setSelected([]);
    setMatched([]);
    setLines([]);
    setFeedback("");
    setShowAnswer(null);
    setWrongLine(null);
    setStars([]);
    setWrongCount(0);
    setResult("");
    setStreak(0);
  }, [exercise]);
  
  // 🔊 음성
  const playSentence = (rate = 1) => {
    if (currentAudioIndex === null) return;
    const audio = new Audio(
      `/audio/unit${unit}/$ex${safeExercise + 1}_${currentAudioIndex + 1}.mp3`
    );
    audio.playbackRate = rate;
    audio.play();
  };

  const questionIndex = matched.length / 2;
  
  // 📍 좌표
  function getCenter(el) {
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  }

    function getCardColor(item) {
    if (matched.includes(item)) return "linear-gradient(135deg, #f0e7da, #ffeda8)"; // 정답
    if (selected.includes(item)) return "#ddd"; // 선택됨

    // 기본 색
    if (sentences.includes(item)) return "#e0f2fe"; // 🔵 문장
    return "#fff7ed"; // 🟠 옵션
  }

  // 🎯 클릭
  const handleClick = (item, e) => {
    createRipple(e);

    if (showAnswer) return;

    if (selected.includes(item) || matched.includes(item)) return;
  
  const newSelected = [...selected, item];
  setSelected(newSelected);
  
  if (newSelected.length === 2) {
    const [a, b] = newSelected;
    
    const el1 = document.querySelector(`[data-id="${a}"]`);
    const el2 = document.querySelector(`[data-id="${b}"]`);
    
    let p1, p2;
    if (el1 && el2) {
      p1 = getCenter(el1);
      p2 = getCenter(el2);
    }

    const combined1 = `${a} ${b}`;
    const combined2 = `${b} ${a}`;

    const correct = currentSet.answers.find(
      (ans) => ans.en === combined1 || ans.en === combined2
    );

    if (correct) {
      // ✅ 오답 선 제거
      setWrongLine(null);

      // ✅ 정답 선
      setLines(prev => [...prev, { p1, p2 }]);

      // ✅ 매칭 추가
      const nextMatched = [...matched, a, b];
      setMatched(nextMatched);
      setSelected([]);

      const totalPairs = currentSet.answers.length;
      const nextPairs = nextMatched.length / 2;

      if (nextPairs === totalPairs) {
        if (wrongCount === 0) {
          setResult("🏆 Perfect!");
      } else {
        setResult("👍 Good!");
      }
    }

      if (nextPairs === totalPairs && wrongCount === 0) {
        triggerFireworks(); // 🎆 여기!
      }

      setFeedback("🎉 Great!");
      setShowAnswer(correct);

      addScore && addScore();
      addXP && addXP(10 + streak * 2);

      playEffect("correct");

      // 🔊 음성 (idx 방식)
      const idx =
        currentSet.sentences.indexOf(a) !== -1
          ? currentSet.sentences.indexOf(a)
          : currentSet.sentences.indexOf(b);

      setCurrentAudioIndex(idx);

      setTimeout(() => {
        const audio = new Audio(
        `/audio/unit1/ex${exercise + 1}_${idx + 1}.mp3`
        );
        audio.play().catch(() => {});
      }, 150);

      // ⭐ 별
      setStars(prev => [
        ...prev,
        ...Array.from({ length: 6 }).map(() => ({
        id: Math.random(),
        left: Math.random() * 80 + 10,
        delay: Math.random() * 0.3
        }))
      ]);

    // Streak (Combo)
    setStreak(prev => {
      const next = prev + 1;
      setBestStreak(b => Math.max(b, next));
      if (next === 5) {
        playEffect("combo");
      }
      return next;
    });

    } else {
      // ❌ 오답
      setFeedback("😢 Try again!");
      playEffect("wrong");

      setShake(true);

      if (p1 && p2) {
        setWrongLine({ p1, p2 });
      }

      setTimeout(() => {
        setShake(false);
        setWrongLine(null);
        setSelected([]);   // 🔥 핵심 (멈춤 방지)
        setFeedback("");
      }, 500);

      setWrongCount(prev => prev + 1);

      setStreak(0);
    }
    }
  };

  const answers = currentSet.answers;
  
  const unitData = wordsData[unit];
  if (!unitData) {
  return <div>Loading...</div>;
  }
  const words = unitData.words;

  return (
    <div style={{ ...styles.container }}>
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
        onBack={goBack}
        score={score}
        level={level}
        xp={xp}
      />

    <div style={styles.starLayer}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            animation: `starBurst 1s ease-out`,
            animationDelay: `${s.delay}s`
          }}
        >
            ⭐
        </div>
      ))}
    </div>
    
    <h2 style={styles.subtitle}>🔗 Expression Matching, Exercise {safeExercise + 1}</h2>

    <div style={styles.container}>
      <div style={styles.columnsWrapper} ref={containerRef}>

        <svg style={styles.svg}>
          {lines.map((line, i) => (
            <path
            key={i}
            d={`M ${line.p1.x} ${line.p1.y} 
            Q ${(line.p1.x + line.p2.x) / 2} ${(line.p1.y + line.p2.y) / 2 - 40} 
            ${line.p2.x} ${line.p2.y}`}
            stroke="#9400d3"
            strokeWidth="2"
            fill="none"
            strokeDasharray="300"
            strokeDashoffset="300"
            style={{
              animation: "drawCurve 0.5s forwards"
            }}
        />
        ))}
          {wrongLine && (
            <line
              x1={wrongLine.p1.x}
              y1={wrongLine.p1.y}
              x2={wrongLine.p2.x}
              y2={wrongLine.p2.y}
              stroke="red"
              strokeWidth="2"
              style={{ animation: "flash 0.5s" }}
            />
          )}
        </svg>

        <div style={styles.columns}>
          {/* 왼쪽: 문장 */}
          <div style={styles.column}>
            {sentences.map((s) => (
              <button
                key={s}
                data-id={s}
                style={{
                  ...styles.card,
                  ...(shake && selected.includes(s) ? styles.shake : {}),
                  ...styles.leftCard,
                 background: getCardColor(s)
                }}
                onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
                }
                onClick={(e) => handleClick(s, e)}
      >
                  {s}
              </button>
            ))}
          </div>

          {/* 오른쪽: 옵션 */}
          <div style={styles.column}>
            {options.map((o) => (
              <button
                key={o}
                data-id={o}
                style={{
                  ...styles.card,
                  ...(shake && selected.includes(o) ? styles.shake : {}),
                  ...styles.rightCard,
                  background: getCardColor(o)
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={(e) => handleClick(o, e)}
              >
                  {o}
              </button>
            ))}
          </div>
        </div>
 
        {/* 피드백 */}
        {feedback && (
          <p style={{ marginTop: "10px", fontWeight: "bold" }}>
            {feedback}
          </p>
        )}

        {/* 정답 설명 */}
        {showAnswer && (
          <div style={styles.answerBox}>
            <p style={styles.answerEn}>{showAnswer.en}</p>
            <p style={styles.answerKo}>{showAnswer.ko}</p>

            {showAnswer.tips.map((t, i) => (
              <p key={i} style={styles.tip}>💡 {t}</p>
            ))}

            <div style={styles.btnRow}>
              <button
                style={styles.repeatBtn}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onClick={(e) => {
                  createRipple(e);
                  playSentence(1);
                }}
              >
                  🔁 Repeat
              </button>

              <button
                style={styles.slowBtn}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onClick={(e) => {
                  createRipple(e);
                  playSentence(0.8);
                }}
              >
                  🐢 Slow
              </button>

	            <button
		            style={styles.okBtn}
		            onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onClick={(e) => {
                  createRipple(e);
                  setShowAnswer(null);
                  setFeedback("");
                  setSelected([]);

		              const isComplete =
			            matched.length === currentSet.answers.length * 2;

		              if (isComplete) {
                    if (exercise === matchingData.length - 1) {
                      setMatchingDone(true);
                      saveProgress(unit, "matching");
                      setShowComplete(true);   // ⭐ 마지막만 popup
                    } else {
                      goNext(exercise + 1);    // ⭐ 다음 문제로 이동
                    }
                    } else {
                    setShowAnswer(null);
                    setFeedback("");
                    setSelected([]);
                  }
                }}
              >
                  👍 OK
	            </button>
            </div>

            {result && (
              <div style={styles.resultText}>
                {result}
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {showComplete && (
    <div style={styles.popup}>
      🎆 🎆 🎆
      <div style={styles.sparkle}>✨✨✨</div>

      <h2 style={{ color: "#333" }}>
        🎉 Matching Complete!
      </h2>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
        
      <button
        style={styles.mainBtn}
        onClick={(e) => {
          createRipple(e);
          setShowComplete(false);
          goNext();   // 👉 Paragraph 이동
        }}
      >
        👉 Next
      </button>

      <button
        style={styles.retryBtn}
        onClick={(e) => {
          createRipple(e);
          setShowComplete(false);
          goNext(0);
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

/* 🎨 스타일 */
const styles = {
  container: {
    minHeight: "100vh",
    position: "relative",
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

  streak: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#ffeb3b",
    marginTop: "5px",
    textShadow: "0 2px 6px rgba(0,0,0,0.3)"
  },

  starLayer: {
    position: "absolute",
    top: "60px",
    left: 0,
    width: "100%",
    pointerEvents: "none",
    zIndex: 1 
  },

  columnsWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "500px"
  },
  
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0
  },

  subtitle: {
    fontSize: "18px",
    fontWeight: "500",
    color: "white",
    lineHeight: "1.8",
    marginTop: "30px",
    marginBottom: "0px"
  },

  card: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    color: "black",
    transition: "0.15s",
    zIndex: 1
  },

  columns: {
    display: "flex",
    gap: "20px",
    marginTop: "10px"
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  leftCard: {
    background: "#e0f2fe"   // 🔵 문장
  },

  rightCard: {
    background: "#fff7ed"   // 🟠 옵션
  },

  answerBox: {
    marginTop: "20px",
    textAlign: "center",
    background: "rgba(255,255,255,0.2)",
    padding: "12px",
    borderRadius: "10px"
  },

  answerEn: {
    color: "black",
    fontSize: "14px"
  },

  answerKo: {
    fontSize: "13px"
  },

  tip: {
    color: "black",
    fontSize: "13px"
  },

  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    marginTop: "10px",
    flexWrap: "wrap"
  },

  repeatBtn: {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#dbeafe",
  cursor: "pointer",
  transition: "0.15s"
 },

slowBtn: {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#fde68a",
  cursor: "pointer",
  transition: "0.15s"
 },

okBtn: {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
  color: "black",
  cursor: "pointer",
  transition: "0.15s"
 },

  nextBtn: {
    marginTop: "10px",
    padding: "6px 16px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    color: "white",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  },

  done: {
    marginTop: "40px",
    color: "white",
    fontSize: "16px"
  },

  popup: {
    position: "fixed",
    top: "40%",
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

  mainBtn: {
    marginTop: "24px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    color: "black",
    background: "linear-gradient(135deg, #ADEBB3, #32CD32)",
    cursor: "pointer"
  },

  retryBtn: {
    marginTop: "24px",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    color: "#9400d3",
    background: "linear-gradient(135deg, #ffffe0, #fafad2)",
    cursor: "pointer"
  },

  shake: {
    animation: "shake 0.3s"
  },

  resultText: {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "10px",
    color: "#fff",
    textShadow: "0 2px 6px rgba(0,0,0,0.3)"
  }
};