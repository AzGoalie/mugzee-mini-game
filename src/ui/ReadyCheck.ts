import { drawButton, drawPanel, drawText } from "../core/Renderer";

export const createReadyCheck = (onReady: () => void) => {
  const wrapper = document.getElementById("wrapper");
  let ready = false;

  const onClick = () => {
    onReady();
    ready = true;
    wrapper?.removeEventListener("click", onClick);
  };
  wrapper?.addEventListener("click", onClick);

  const render = (ctx: CanvasRenderingContext2D) => {
    if (!ready) {
      drawPanel(ctx, ctx.width / 2, ctx.height / 2, 300, 100);
      drawText(
        ctx,
        "A ready check has been initiated",
        ctx.width / 2,
        ctx.height / 2 - 15,
        15,
        true
      );

      drawButton(ctx, ctx.width / 2, ctx.height / 2 + 20, 75, 32);
      drawText(ctx, "Ready", ctx.width / 2, ctx.height / 2 + 25, 15, true);
    }
  };

  const update = () => {};

  return { render, update, shouldRemove: () => ready };
};
