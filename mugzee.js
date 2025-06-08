import { images } from "./assets.js";
import { drawImage } from "./canvas.js";
import { AddEntityEvent } from "./index.js";
import { createMine } from "./mine.js";
import { getRandomInt } from "./utils.js";

export function createMugzee({ position }) {
  const spawnRadius = 50;

  const img = images.mugzee;

  let time = 0;
  let nextMineSpawn = 5;
  let nextDifficultyIncrease = 10;

  let spawnInterval = 3;
  let difficultyInterval = 2;

  function spawnMine() {
    const x = getRandomInt(position.x - spawnRadius, position.x + spawnRadius);
    const y = getRandomInt(position.y - spawnRadius, position.y + spawnRadius);
    dispatchEvent(new AddEntityEvent(createMine({ x, y })));
  }

  function update(delta) {
    time += delta;

    if (time >= nextDifficultyIncrease && spawnInterval > 1) {
      nextDifficultyIncrease += difficultyInterval;
      spawnInterval -= 0.5;
    }

    if (time >= nextMineSpawn) {
      spawnMine();
      nextMineSpawn += spawnInterval;
    }
  }

  const render = (ctx) =>
    drawImage(ctx, img, ctx.width / 2, ctx.height / 2, 0.6);

  return { update, render };
}
