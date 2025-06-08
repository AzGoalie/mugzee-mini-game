import { images } from "./assets.js";
import { drawImage } from "./canvas.js";
import { bindInputs } from "./input.js";

const inputMap = {
  moveUp: [{ key: "w" }, { key: "ArrowUp" }],
  moveLeft: [{ key: "a" }, { key: "ArrowLeft" }],
  moveDown: [{ key: "s" }, { key: "ArrowDown" }],
  moveRight: [{ key: "d" }, { key: "ArrowRight" }],
};

export function createPlayer() {
  const position = { x: 550, y: 250 };
  const velocity = { x: 0, y: 0 };
  const speed = 300;

  const img = images.meleeDps;

  bindInputs(inputMap);

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

  const update = (delta) => {
    position.x += delta * velocity.x;
    position.y += delta * velocity.y;
  };

  const render = (ctx) => {
    drawImage(ctx, img, Math.floor(position.x), Math.floor(position.y), 0.5);
  };

  return {
    position,
    update,
    render,
  };
}
