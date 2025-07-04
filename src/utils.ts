export function cloneAudio(audio: HTMLAudioElement) {
  // Hate this hack...
  const clone = audio.cloneNode(true) as HTMLAudioElement;
  clone.volume = 0.3;
  return clone;
}

export function shuffleArray(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
