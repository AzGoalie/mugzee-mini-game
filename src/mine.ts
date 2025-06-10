import { drawImage } from "./canvas";
import { assets } from "./config";
import { AddEntityEvent } from "./main";
import { createSoak } from "./soak";
import { cloneAudio } from "./utils";

const radius = 25;

function renderTarget(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = "#c79c6e66";
  ctx.strokeStyle = "#7f634666";
  ctx.shadowColor = "#c79c6ecc";
  ctx.lineWidth = 6;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function createMine(target: { x: number; y: number }) {
  const position = { x: 0, y: 0 };
  const velocity = { x: 0, y: 0 };

  const spawnTime = 0.5;
  const detonateTime = 3;
  const speed = 100;

  const img = assets.images.mine;

  let timer = 0;
  let spawned = false;

  let remove = false;

  let initialized = false;

  function collide() {
    cloneAudio(assets.audio.explosion).play();
    dispatchEvent(new Event("damage"));
    remove = true;
  }

  function render(ctx: CanvasRenderingContext2D) {
    if (!initialized) {
      position.x = ctx.width / 2;
      position.y = ctx.height / 2;
      initialized = true;
    }

    renderTarget(ctx, target.x, target.y);

    if (spawned) {
      drawImage(ctx, img, position.x, position.y, 0.52);
    }
  }

  function update(delta: number) {
    timer += delta;

    if (!spawned && timer >= spawnTime) {
      spawned = true;

      const dx = target.x - position.x;
      const dy = target.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      velocity.x = (dx / distance) * speed;
      velocity.y = (dy / distance) * speed;
    } else if (
      Math.abs(position.x - target.x) >= 2 ||
      Math.abs(position.y - target.y) >= 2
    ) {
      position.x += velocity.x * delta;
      position.y += velocity.y * delta;
    }

    if (timer >= spawnTime + detonateTime) {
      remove = true;
      dispatchEvent(new AddEntityEvent(createSoak()));
    }
  }

  return {
    position,
    radius,
    render,
    update,
    collide,
    shouldRemove: () => remove,
  };
}
