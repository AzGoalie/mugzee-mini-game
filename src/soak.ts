import { assets } from "./config";
import { getRandomInt } from "./core/Math";
import { createTimer, type Timer } from "./core/Timer";
import { cloneAudio } from "./utils";

export function createSoak() {
  const position = {
    x: getRandomInt(380, 900),
    y: getRandomInt(230, 550),
  };

  const detonateTime = 5;
  const detonateTimer = createTimer(() => detonate(), {
    delay: detonateTime,
    once: true,
  });

  let successTimer: Timer;

  let elapsedTime = 0;
  let soaked = false;
  let alpha = 0;

  let remove = false;

  function detonate() {
    if (!soaked) {
      cloneAudio(assets.audio.explosion).play();
      dispatchEvent(new Event("damage"));
    }

    remove = true;
  }

  function render(ctx: CanvasRenderingContext2D) {
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

  function update(delta: number) {
    elapsedTime += delta;
    alpha = Math.floor((elapsedTime / detonateTime) * 255);

    if (successTimer) {
      successTimer.update(delta);
    }

    detonateTimer.update(delta);
  }

  function collide() {
    if (!soaked) {
      soaked = true;
      detonateTimer.stop();
      successTimer = createTimer(() => (remove = true), {
        delay: 1,
        once: true,
      });

      const info = cloneAudio(assets.audio.info);
      info.volume = 0.2;
      info.play();
    }
  }

  return { position, render, update, collide, shouldRemove: () => remove };
}
