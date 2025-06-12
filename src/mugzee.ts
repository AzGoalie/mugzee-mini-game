import { drawImage } from "./canvas";
import { assets } from "./config";
import { getRandomInt, type Vec2 } from "./core/Math";
import { createTimer } from "./core/Timer";
import { AddEntityEvent } from "./main";
import { createMine } from "./mine";

export function createMugzee({ position: player }: { position: Vec2 }) {
  const img = assets.images.mugzee;
  const position = { x: 0, y: 0 };

  const spawnRadius = 50;
  const difficultyIncrease = 0.5;

  const mineTimer = createTimer(() => spawnMine(), { delay: 5, interval: 3 });
  const difficultyTimer = createTimer(() => increaseDifficulty(), {
    delay: 10,
    interval: 5,
  });

  function increaseDifficulty() {
    const interval = mineTimer.getInterval();
    if (interval > 1) {
      mineTimer.setInterval(interval - difficultyIncrease);
    }
  }

  function spawnMine() {
    const x = getRandomInt(player.x - spawnRadius, player.x + spawnRadius);
    const y = getRandomInt(player.y - spawnRadius, player.y + spawnRadius);
    dispatchEvent(new AddEntityEvent(createMine({ x, y })));
  }

  function update(delta: number) {
    mineTimer.update(delta);
    difficultyTimer.update(delta);
  }

  const render = (ctx: CanvasRenderingContext2D) =>
    drawImage(ctx, img, ctx.width / 2, ctx.height / 2, 0.6);

  return { position, update, render, shouldRemove: () => false };
}
