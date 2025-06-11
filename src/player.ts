import { drawImage } from "./canvas";
import { assets, inputManager } from "./config";

export function createPlayer() {
  const position = { x: 550, y: 250 };
  const velocity = { x: 0, y: 0 };
  const speed = 300;

  const img = assets.images.meleeDps;

  inputManager.on("moveUp", ({ pressed }) => {
    velocity.y += pressed ? -speed : speed;
  });

  inputManager.on("moveDown", ({ pressed }) => {
    velocity.y += pressed ? speed : -speed;
  });

  inputManager.on("moveLeft", ({ pressed }) => {
    velocity.x += pressed ? -speed : speed;
  });

  inputManager.on("moveRight", ({ pressed }) => {
    velocity.x += pressed ? speed : -speed;
  });

  const update = (delta: number) => {
    position.x += delta * velocity.x;
    position.y += delta * velocity.y;
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    drawImage(ctx, img, Math.floor(position.x), Math.floor(position.y), 0.5);
  };

  return {
    position,
    update,
    render,
  };
}
