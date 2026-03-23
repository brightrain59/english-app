import { useState } from "react";
import "./App.css";

const words = [
  { word: "accent", meaning: "말투, 억양, 악센트" },
  { word: "admire", meaning: "존경하다, 감탄하다" },
  { word: "alive", meaning: "살아있는" },
  { word: "anger", meaning: "분노, 화" },
  { word: "avoid", meaning: "피하다" },
  { word: "cheer", meaning: "응원하다, 환호하다" },
  { word: "choice", meaning: "선택" },
  { word: "even", meaning: "심지어, ~조차" },
  { word: "fever", meaning: "열, 발열" },
  { word: "hear", meaning: "듣다; heard-heard" },
  { word: "ill", meaning: "아픈, 병든" },
  { word: "journey", meaning: "여행, 여정" },
  { word: "laugh", meaning: "웃다, 웃음, 웃음소리" },
  { word: "pain", meaning: "고통, 통증" },
  { word: "photograph", meaning: "사진" },
  { word: "pin", meaning: "핀, 작은 못" },
  { word: "proud", meaning: "자랑스러운, 자랑스러워 하는" },
  { word: "soon", meaning: "곧, 머지 않아" }
];

const quizData = [
  {
    question: "다른 하나는?",
    options: ["accent", "picture", "speak", "voice"],
    answer: "picture"
  },
  {
    question: "다른 하나는?",
    options: ["admire", "find", "like", "love"],
    answer: "find"
  },
  {
    question: "다른 하나는?",
    options: ["alive", "dead", "living", "young"],
    answer: "young"
  },
  {
    question: "다른 하나는?",
    options: ["anger", "danger", "happiness", "sadness"],
    answer: "danger"
  },
  {
    question: "다른 하나는?",
    options: ["chant", "cheer", "happiness", "pain"],
    answer: "pain"
  },
  {
    question: "다른 하나는?",
    options: ["journey", "nature", "travel", "trip"],
    answer: "nature"
  },
  {
    question: "다른 하나는?",
    options: ["cold", "fever", "ill", "strong"],
    answer: "strong"
  },
  {
    question: "다른 하나는?",
    options: ["glad", "happy", "kind", "proud"],
    answer: "kind"
  }
];

export default function App() {
  const phraseMeanings = {
  ex1: [
    { text: "go on a journey", meaning: "여행을 가다" },
    { text: "feel ill", meaning: "아프다" },
    { text: "avoid doing ~", meaning: "~하는 것을 피하다" },
    { text: "take a photograph", meaning: "사진을 찍다" }
  ],
  ex2: [
    { text: "play a soccer game", meaning: "축구 경기를 하다" },
    { text: "try very hard", meaning: "매우 열심히 노력하다" },
    { text: "show anger", meaning: "화를 내색하다" },
    { text: "in the end", meaning: "결국" }
  ],
  ex3: [
    { text: "speak with a clear accent", meaning: "또렷한 말투로 말하다" },
    { text: "English-speaking country", meaning: "영어 상용 국가" },
    { text: "feel alive", meaning: "활기를 느끼다" }
  ]
};
  const [opened, setOpened] = useState({});
  const [showTrans, setShowTrans] = useState({});
  const [showHelp, setShowHelp] = useState({});
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const buttonStyle = {
  margin: "8px",
  padding: "10px 16px",
  borderRadius: "15px",
  border: "none",
  background: "linear-gradient(135deg, #36d1dc, #5b86e5)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
};

const speak = (text) => {
  const safeText = text.toLowerCase().replace(/\s+/g, "-");
  const audio = new Audio(`/audio/${safeText}.mp3`);
  audio.play();
};

  const handleClick = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const score = quizData.reduce((acc, q, i) => {
    return acc + (answers[i] === q.answer ? 1 : 0);
  }, 0);

  return (
  <div style={{
  textAlign: "center",
  padding: "20px",
  background: "linear-gradient(135deg, #4facfe, #00f2fe, #43e97b)",
  backgroundSize: "400% 400%",
  minHeight: "100vh",
  color: "#333"
}}>
      <h1 style={{
  fontSize: "32px",
  color: "#ffffff",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  padding: "12px",
  borderRadius: "20px",
  display: "inline-block",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
}}>
🎮 English Vocabulary Fun Master
</h1>

      <h2 style={{
  marginTop: "30px",
  color: "#444",
  fontSize: "26px",
  fontWeight: "bold"
}}>Unit 1. My Daily Life & Growth, Part I</h2>
<h3 style={{
  marginTop: "30px",
  color: "#222",
  fontSize: "22px",
  fontWeight: "bold"
}}>
📚 Words to Learn
</h3>
<p>이번에 공부할 단어예요. 발음이나 뜻을 모르는 단어가 있으면 클릭해 보세요.</p>
      <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
  ,
  gap: "15px",
  justifyItems: "center"
}}>
  {words.map((w, index) => {
    const colors = [
      "linear-gradient(135deg, #ffecd2, #fcb69f)",
      "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
      "linear-gradient(135deg, #d4fc79, #96e6a1)",
      "linear-gradient(135deg, #84fab0, #8fd3f4)",
      "linear-gradient(135deg, #fccb90, #d57eeb)"
    ];

  return (
    <div
      key={w.word}
      onClick={() => {
        speak(w.word);
        setOpened(prev => ({ ...prev, [w.word]: !prev[w.word] }));
      }}
      style={{
        margin: "10px auto",
        padding: "5px",
        borderRadius: "20px",
        cursor: "pointer",
        width: "150px",
        background: colors[index % colors.length],
        boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
        color: "#222",
        fontWeight: "bold"
      }}
    >
      <b>{w.word}</b>

      {opened[w.word] && (
        <div style={{ marginTop: "8px", fontWeight: "normal" }}>
          {w.meaning}
        </div>
        )}
      </div>
    );
  })}
</div>

      <h3 style={{
  marginTop: "30px",
  color: "#222",
  fontSize: "22px",
  fontWeight: "bold"
}}>🧠 Word Classification</h3>
<p>각 단어 그룹에서 나머지 셋과 관련성이 가장 적은 것을 클릭하세요.</p>

      {quizData.map((q, i) => (
        <div key={i}>
          <p>Question {i + 1}</p>
          {q.options.map(opt => (
            <button
  key={opt}
  onClick={() => handleClick(i, opt)}
  style={{
    margin: "8px",
    padding: "10px 15px",
    borderRadius: "12px",
    border: "none",
    background:
      answers[i] === opt
        ? "#d63031"
        : "#2d3436",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
  }}
>
  {opt}
</button>
          ))}
        </div>
      ))}

      {!submitted && (
        <button style={buttonStyle} onClick={() => setSubmitted(true)}>제출</button>
      )}

      {submitted && (
        <h3>점수: {score} / {quizData.length}</h3>
      )}
      <button
  style={buttonStyle}
  onClick={() => {
    setAnswers({});
    setSubmitted(false);
  }}
>
🔄 다시 풀기
</button>
      <h3 style={{
  marginTop: "30px",
  color: "#222",
  fontSize: "22px",
  fontWeight: "bold"
}}>🔗 Expression Matching</h3>
<p>주어진 단어에 유의하면서, 두 표현을 연결하여 가장 자연스러운 문장 4개를 완성하세요.</p>

{[
  {
    title: "Exercise Set 1",
    wordBank: ["avoid", "cheer", "photograph", "proud"],
    left: ["The fans will", "She felt very", "We took a", "It is not easy to"],
    right: [
      "photograph of the river.",
      "avoid junk food every day.",
      "cheer loudly for their team.",
      "proud of her son’s success."
    ],
    answers: [2,3,0,1]
  },
  {
    title: "Exercise Set 2",
    wordBank: ["anger", "hear", "laugh", "soon"],
    left: ["The joke made the children", "The guests could", "The lady spoke in", "The train will arrive"],
    right: [
      "hear music from the next room.",
      "laugh at the funny story.",
      "soon at the station.",
      "anger after the meeting."
    ],
    answers: [1,0,3,2]
  },
  {
    title: "Exercise Set 3",
    wordBank: ["admire", "alive", "fever", "journey"],
    left: ["My friend had", "The fish is still", "The players admire", "Please tell me about"],
    right: [
      "your journey last year.",
      "their coach very much.",
      "alive in the bowl.",
      "a high fever today."
    ],
    answers: [3,2,1,0]
  }
].map((set, idx) => (
  <div key={idx} style={{ marginBottom: "30px" }}>
    <h4 style={{ marginBottom: "5px", marginTop: "10px" }}>
  {set.title}
</h4>
    <div style={{
  background: "#ffffffcc",
  padding: "6px 10px",
  borderRadius: "12px",
  marginTop: "5px",
  marginBottom: "15px",
  width: "fit-content",
  marginLeft: "auto",
  marginRight: "auto",
  fontSize: "16px",
  fontWeight: "bold",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
}}>
  {set.wordBank.join(", ")}
</div>
    {set.left.map((l, i) => (
      <div key={i} style={{ marginBottom: "10px" }}>
        <b style={{ marginRight: "10px" }}>{l}</b>
        <select 
          id={`match-${idx}-${i}`}
          style={{
            padding: "8px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            background: "#fff",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}>
          <option>선택하세요</option>
          {set.right.map((r, j) => (
            <option key={j}>{r}</option>
          ))}
        </select>
      </div>
    ))}
  </div>
))}
<button style={buttonStyle} onClick={() => {
  let correct = 0;
  let total = 0;

  const correctAnswers = [
  [2,3,0,1],
  [1,0,3,2],
  [3,2,1,0]
];

  [0,1,2].forEach(idx => {
    [0,1,2,3].forEach(i => {
      const select = document.getElementById(`match-${idx}-${i}`);
      if(select && select.selectedIndex - 1 === correctAnswers[idx][i]){
        correct++;
      }
      total++;
    });
  });

  alert(`점수: ${correct} / ${total}`);
}}>
채점
</button>
<h3 style={{
  marginTop: "30px",
  color: "#222",
  fontSize: "22px",
  fontWeight: "bold"
}}>✍️ Words in a Paragraph</h3>

<div style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
<h4 style={{ marginBottom: "5px", marginTop: "30px" }}>
  Exercise 1 - My Journey
</h4>
{(() => {
  const words = ["avoid", "fever", "ill", "journey", "pain", "photograph"];
  return (
    <div style={{
      background: "#ffffffcc",
      padding: "6px 10px",
      borderRadius: "12px",
      marginTop: "0px",
      marginBottom: "5px",
      width: "fit-content",
      marginLeft: "auto",
      marginRight: "auto",
      fontSize: "16px",
      fontWeight: "bold",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      {words.join(", ")}
    </div>
  );
})()}
<button style={buttonStyle} onClick={() => speak("paragraph1")}>
🔊 듣기
</button>
<button
  style={buttonStyle}
  onClick={() =>
    setShowHelp(prev => ({ ...prev, ex1: !prev.ex1 }))
  }
>
💡 도움말 보기
</button>
<button style={buttonStyle} onClick={() => 
  setShowTrans(prev => ({ ...prev, ex1: !prev.ex1 }))
}>
📖 번역 보기
</button>
{showHelp.ex1 && (
  <div style={{
    background: "#ffffffcc",
    padding: "10px",
    borderRadius: "12px",
    marginTop: "10px",
    marginBottom: "10px",
    fontSize: "14px"
  }}>
    <div><b>💡 Useful Expressions</b></div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("go on a journey")}>
        🔊 go on a journey
      </span> - 여행을 가다
    </div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("feel ill")}>
        🔊 feel ill
      </span> - 아프다
    </div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("avoid doing ~")}>
        🔊 avoid doing ~
      </span> - ~하는 것을 피하다
    </div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("take a photograph")}>
        🔊 take a photograph
      </span> - 사진을 찍다
    </div>
  </div>
)}
<p>
Last summer, I went on a long (<input id="p1" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) with my family. On the first day, I felt (<input id="p2" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) and had a (<input id="p3" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>). I had some (<input id="p4" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) in my head. I tried to (<input id="p5" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) walking too much. Later I felt better and took a (<input id="p6" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) of the beautiful sea.
</p>
{showTrans.ex1 && (
  <p style={{ color: "#555", fontSize: "16px" }}>
    지난 여름 나는 가족과 긴 여행을 갔습니다. 첫날 나는 아팠고 열이 났습니다. 머리에 통증이 있었습니다. 많이 걷는 것을 피하려고 했습니다. 나중에는 좋아져서 아름다운 바다와 산의 사진을 찍었습니다.
</p>
)}

<h4 style={{ marginBottom: "5px", marginTop: "30px" }}>
  Exercise 2 - A Soccer Game
</h4>
{(() => {
  const words = ["anger", "admire", "cheer", "even", "proud"];
  return (
    <div style={{
      background: "#ffffffcc",
      padding: "6px 10px",
      borderRadius: "12px",
      marginTop: "0px",
      marginBottom: "5px",
      width: "fit-content",
      marginLeft: "auto",
      marginRight: "auto",
      fontSize: "16px",
      fontWeight: "bold",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      {words.join(", ")}
    </div>
  );
})()}
<button style={buttonStyle} onClick={() => speak("paragraph2")}>
🔊 듣기
</button>
<button
  style={buttonStyle}
  onClick={() =>
    setShowHelp(prev => ({ ...prev, ex2: !prev.ex2 }))
  }
>
💡 도움말 보기
</button>
<button style={buttonStyle} onClick={() => 
  setShowTrans(prev => ({ ...prev, ex2: !prev.ex2 }))
}>
📖 번역 보기
</button>
{showHelp.ex2 && (
  <div style={{
    background: "#ffffffcc",
    padding: "10px",
    borderRadius: "12px",
    marginTop: "10px",
    marginBottom: "10px",
    fontSize: "14px"
  }}>
    <div><b>💡 Useful Expressions</b></div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("play a soccer game")}>
        🔊 play a soccer game
      </span> - 축구 경기를 하다
    </div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("try very hard")}>
        🔊 try very hard
      </span> - 매우 열심히 노력하다
    </div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("show anger")}>
        🔊 show anger
      </span> - 화를 내색하다
    </div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("in the end")}>
        🔊 in the end
      </span> - 결국
    </div>
  </div>
)}
<p>
Yesterday our school team played a soccer game. Many students came to watch and (<input id="p7" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>). Our players tried very hard, so I (<input id="p8" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) them. (<input id="p9" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) when they made mistakes, they did not show (<input id="p10" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>). In the end, our team won the game, and we felt very (<input id="p11" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>).
</p>
{showTrans.ex2 && (
  <p style={{ color: "#555", fontSize: "16px" }}>
어제 우리 학교 팀이 축구 경기를 했습니다. 많은 학생들이 와서 지켜보면서 응원했습니다. 선수들은 매우 열심히 해서 나는 그들을 존경합니다. 실수했을 때도 화를 내색하지 않았습니다. 결국 우리 팀이 경기에서 이겼고, 우리는 매우 자랑스러웠습니다.
</p>
)}

<h4 style={{ marginBottom: "5px", marginTop: "30px" }}>
  Exercise 3 - My Daily Life
</h4>
{(() => {
  const words = ["accent", "alive", "choice", "hear", "laugh", "pin", "soon"];
  return (
    <div style={{
      background: "#ffffffcc",
      padding: "6px 10px",
      borderRadius: "12px",
      marginTop: "0px",
      marginBottom: "5px",
      width: "fit-content",
      marginLeft: "auto",
      marginRight: "auto",
      fontSize: "16px",
      fontWeight: "bold",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      {words.join(", ")}
    </div>
  );
})()}
<button style={buttonStyle} onClick={() => speak("paragraph3")}>
🔊 듣기
</button>
<button
  style={buttonStyle}
  onClick={() =>
    setShowHelp(prev => ({ ...prev, ex3: !prev.ex3 }))
  }
>
💡 도움말 보기
</button>
<button style={buttonStyle} onClick={() => 
  setShowTrans(prev => ({ ...prev, ex3: !prev.ex3 }))
}>
📖 번역 보기
</button>
{showHelp.ex3 && (
  <div style={{
    background: "#ffffffcc",
    padding: "10px",
    borderRadius: "12px",
    marginTop: "10px",
    marginBottom: "10px",
    fontSize: "14px"
  }}>
    <div><b>💡 Useful Expressions</b></div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("speak with a clear accent")}>
        🔊 speak with a clear accent
      </span> - 또렷한 말투로 말하다
    </div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("English-speaking country")}>
        🔊 English-speaking country
      </span> - 영어 상용 국가
    </div>

    <div>
      <span style={{ color: "blue", cursor: "pointer" }}
        onClick={() => speak("feel alive")}>
        🔊 feel alive
      </span> - 활기를 느끼다
    </div>
  </div>
)}
<p>
In my English class, I like to (<input id="p12" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) my teacher speak with a clear (<input id="p13" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>). Sometimes we watch funny videos and (<input id="p14" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) together. I also like to put a (<input id="p15" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) on a map of English-speaking countries. It was my (<input id="p16" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) to study English every day. I hope to travel (<input id="p17" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) and feel (<input id="p18" style={{
    width: "100px",
    padding: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>) in a new place.
</p>
{showTrans.ex3 && (
  <p style={{ color: "#555", fontSize: "16px" }}>
영어 시간에 나는 선생님이 또렷한 말투로 말하시는 것을 듣고 싶어합니다. 우리는 함께 재미있는 영상을 보며 웃기도 합니다. 영어 상용 국가의 지도에 핀을 꽂는 것도 좋아합니다. 매일 영어 공부를 하기로 선택했습니다. 머지않아 여행하며 새로운 곳에서 활기를 느끼고 싶습니다.
</p>
)}

</div>
<button 
  style={buttonStyle} 
  onClick={() => {
  const answers = {
    p1:"journey", p2:"ill", p3:"fever", p4:"pain", p5:"avoid", p6:"photograph",
    p7:"cheer", p8:"admire", p9:"even", p10:"anger", p11:"proud",
    p12:"hear", p13:"accent", p14:"laugh", p15:"pin", p16:"choice",
    p17:"soon", p18:"alive"
  };

  let correct = 0;

  Object.keys(answers).forEach(id => {
    const val = document.getElementById(id).value.trim().toLowerCase();
    if(val === answers[id]) correct++;
  });

  alert(`점수: ${correct} / 18`);
}}>
채점
</button>
<h3 style={{
  marginTop: "30px",
  color: "#444",
  fontSize: "22px"
}}>🏆 Final Score</h3>

<button style={buttonStyle} onClick={() => {

  // 1. Quiz 점수
  let quizScore = 0;
  quizData.forEach((q, i) => {
    if(answers[i] === q.answer){
      quizScore++;
    }
  });

  // 2. Matching 점수
  const correctAnswers = [
    [2,3,0,1],
    [1,0,3,2],
    [3,2,1,0]
  ];

  let matchingScore = 0;

  [0,1,2].forEach(idx => {
    [0,1,2,3].forEach(i => {
      const select = document.getElementById(`match-${idx}-${i}`);
      if(select && select.selectedIndex - 1 === correctAnswers[idx][i]){
        matchingScore++;
      }
    });
  });

  // 3. Paragraph 점수
  const answersPara = {
    p1:"journey", p2:"ill", p3:"fever", p4:"pain", p5:"avoid", p6:"photograph",
    p7:"cheer", p8:"admire", p9:"even", p10:"anger", p11:"proud",
    p12:"hear", p13:"accent", p14:"laugh", p15:"pin", p16:"choice",
    p17:"soon", p18:"alive"
  };

  let paraScore = 0;

  Object.keys(answersPara).forEach(id => {
    const val = document.getElementById(id).value.trim().toLowerCase();
    if(val === answersPara[id]) paraScore++;
  });

  // 4. 총점
  const total = quizScore + matchingScore + paraScore;
  const max = quizData.length + 12 + 18;

  let grade = "";

if(total >= max * 0.9){
  grade = "🏆 Excellent!";
} else if(total >= max * 0.75){
  grade = "👍 Great!";
} else if(total >= max * 0.6){
  grade = "🙂 Good!";
} else {
  grade = "💪 Try Again!";
}

alert(`총점: ${total} / ${max}\n등급: ${grade}`);

}}>
전체 채점하기
</button>
    </div>
  );
}