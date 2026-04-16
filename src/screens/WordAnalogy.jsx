import TopBar from "../components/TopBar";
import { useState } from "react";

const data = [
  {
    question: "hot : cold = big : ?",
    options: ["small", "fast", "tall"],
    answer: "small"
  },
  {
    question: "day : night = happy : ?",
    options: ["sad", "angry", "tired"],
    answer: "sad"
  }
];

export default function WordAnalogy({
  goHome,
  goNext,
  addScore,
  score,
  level
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  const current = data[index];

  const handleClick = (word) => {
    setSelected(word);

    if (word === current.answer) {
      addScore();
    }

    setTimeout(() => {
      setSelected(null);
      setIndex(index + 1);
    }, 800);
  };

  return (
    <div style={styles.container}>
      <TopBar title="Analogy" score={score} level={level} onBack={goHome} />

      <h2>{current.question}</h2>

      <div style={styles.options}>
        {current.options.map((o) => (
          <button
            key={o}
            style={{
              ...styles.btn,
              background:
                selected === o
                  ? o === current.answer
                    ? "#58cc02"
                    : "#ff4b4b"
                  : "white"
            }}
            onClick={() => handleClick(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#4facfe",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white"
  },
  options: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  btn: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer"
  }
};