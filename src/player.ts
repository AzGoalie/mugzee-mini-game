import { drawImage } from "./canvas";
import { assets } from "./config";

export function createPlayer() {
  const position = { x: 550, y: 250 };
  const velocity = { x: 0, y: 0 };
  const speed = 300;

  const img = assets.images.meleeDps;

  addEventListener(
    "moveUp",
    ({ pressed }) => (velocity.y += pressed ? -speed : speed)
  );
  addEventListener(
    "moveDown",
    ({ pressed }) => (velocity.y += pressed ? speed : -speed)
  );
  addEventListener(
    "moveLeft",
    ({ pressed }) => (velocity.x += pressed ? -speed : speed)
  );
  addEventListener(
    "moveRight",
    ({ pressed }) => (velocity.x += pressed ? speed : -speed)
  );

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
