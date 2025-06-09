import { audio } from "./assets.js";
import { cloneAudio, getRandomInt } from "./utils.js";

export function createSoak() {
  // x: getRandomInt(380, 950),
  // y: getRandomInt(230, 650),
  const position = {
    x: getRandomInt(380, 900),
    y: getRandomInt(230, 550),
  };

  let detonateTime = 5;
  let timer = 0;
  let soaked = false;
  let alpha = 0;

  let remove = false;

  function render(ctx) {
    const hexAlpha = alpha.toString(16).padStart(2, "0");
    ctx.save();
    ctx.fillStyle = soaked ? "#00ff0066" : `#bf0900${hexAlpha}`;
    ctx.strokeStyle = soaked ? "#00880066" : `#720500${hexAlpha}`;
    ctx.shadowColor = soaked ? "#00ff00cc" : `#bf0900${hexAlpha}`;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.arc(position.x, position.y, 25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function update(delta) {
    timer += delta;

    alpha = Math.floor((timer / detonateTime) * 255);

    if (timer >= detonateTime) {
      if (!soaked) {
        cloneAudio(audio.explosion).play();
        dispatchEvent(new Event("damage"));
      }
      remove = true;
    }
  }

  function collide() {
    if (!soaked) {
      soaked = true;
      detonateTime = timer + 1;

      const info = audio.info.cloneNode(true);
      info.volume = 0.2;
      info.play();
    }
  }

  return { position, render, update, collide, shouldRemove: () => remove };
}
