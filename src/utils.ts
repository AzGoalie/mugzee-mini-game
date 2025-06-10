export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function cloneAudio(audio) {
  // Hate this hack...
  const clone = audio.cloneNode(true);
  clone.volume = 0.3;
  return clone;
}
