import { drawImage } from "./canvas";
import { assets } from "./config";
import { AddEntityEvent } from "./main";
import { createMine } from "./mine";
import { getRandomInt } from "./utils";

export function createMugzee({
  position,
}: {
  position: { x: number; y: number };
}) {
  const spawnRadius = 50;

  const img = assets.images.mugzee;

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

  function update(delta: number) {
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

  const render = (ctx: CanvasRenderingContext2D) =>
    drawImage(ctx, img, ctx.width / 2, ctx.height / 2, 0.6);

  return { update, render, shouldRemove: () => false };
}
