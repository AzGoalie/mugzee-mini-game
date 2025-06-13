import { assets, inputManager } from "../config";
import { drawPanel, drawText } from "../core/Renderer";
import { cloneAudio, shuffleArray } from "../utils";

type Ability = "1" | "2" | "3";
const abilities: Ability[] = ["1", "2", "3"];

export function createAbilityTracker() {
  const generateSequence = () => shuffleArray([...abilities]);
  const successFill = "#037703";
  const errorFill = "#770303";

  let sequence = generateSequence();
  let success: string[] = [];
  let currentIndex = 0;

  function reset() {
    sequence = generateSequence();
    success = [];
    currentIndex = 0;
  }

  function checkAbility(ability: Ability) {
    if (sequence[currentIndex] === ability) {
      success[currentIndex] = successFill;
      currentIndex++;
    } else {
      success[currentIndex] = errorFill;
      cloneAudio(assets.audio.alarm).play();
      dispatchEvent(new Event("resetMultiplier"));
    }

    if (currentIndex === sequence.length) {
      cloneAudio(assets.audio.info).play();
      reset();
      dispatchEvent(new Event("increaseMultiplier"));
    }
  }

  inputManager.on("ability1", ({ pressed }) => {
    if (pressed) checkAbility("1");
  });
  inputManager.on("ability2", ({ pressed }) => {
    if (pressed) checkAbility("2");
  });
  inputManager.on("ability3", ({ pressed }) => {
    if (pressed) checkAbility("3");
  });

  function render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const x = ctx.width / 2;
    const y = ctx.height / 10;

    const w = 30;
    const h = 30;
    const offset = 28;

    drawPanel(ctx, x, y, 150, 80);
    drawText(ctx, "Your Rotation", x, y - 15, 15, true);

    drawPanel(ctx, x - 40, y + 20, w, h, success[0]);
    drawText(ctx, sequence[0], x - 40, y + offset, 15, true, "#ffffff");

    drawPanel(ctx, x, y + 20, w, h, success[1]);
    drawText(ctx, sequence[1], x, y + offset, 15, true, "#ffffff");

    drawPanel(ctx, x + 40, y + 20, w, h, success[2]);
    drawText(ctx, sequence[2], x + 40, y + offset, 15, true, "#ffffff");

    ctx.restore();
  }

  function update(_: number) {}

  return {
    render,
    update,
  };
}
