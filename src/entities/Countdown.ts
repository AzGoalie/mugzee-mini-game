import { drawText } from "../core/Renderer";

export const createCountdown = (time: number) => {
  let countdown = time;

  const update = (delta: number) => (countdown -= delta);
  const render = (ctx: CanvasRenderingContext2D) => {
    drawText(
      ctx,
      Math.floor(countdown).toString(),
      ctx.width / 2,
      ctx.height / 2 - ctx.height / 5,
      75,
      true
    );
  };

  return { update, render, shouldRemove: () => countdown < 1 };
};
