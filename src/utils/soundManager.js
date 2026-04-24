// utils/soundManager.js

const sounds = {
  click: new Audio("/sounds/click.mp3"),
  correct: new Audio("/sounds/correct.mp3"),
  wrong: new Audio("/sounds/wrong.mp3"),
  combo: new Audio("/sounds/combo.mp3"),
  levelup: new Audio("/sounds/levelup.mp3"),
};

export function playEffect(name) {
  const audio = sounds[name];
  if (!audio) return;

  try {
    audio.currentTime = 0;   // ⭐ 핵심
    audio.play();
  } catch (e) {
    console.log("sound error", e);
  }
}