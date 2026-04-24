export const playLevelUp = () => {
  const audio = new Audio("/sounds/levelup.mp3");
  audio.play();
};

export const vibrate = (pattern = [100]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// 간단 TTS (발음)
export const speak = (text) => {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
};