import { audio } from "./assets.js";
import { drawPanel, drawText } from "./canvas.js";
import { bindInputs } from "./input.js";
import { cloneAudio } from "./utils.js";

const abilities = ["1", "2", "3"];

const inputMap = {
  ability1: [{ key: "1" }],
  ability2: [{ key: "2" }],
  ability3: [{ key: "3" }],
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function createAbilityTracker() {
  const generateSequence = () => shuffleArray([...abilities]);
  const successFill = "#037703";
  const errorFill = "#770303";

  let sequence = generateSequence();
  let success = [];
  let currentIndex = 0;

  bindInputs(inputMap);

  function reset() {
    sequence = generateSequence();
    success = [];
    currentIndex = 0;
  }

  function checkAbility(ability) {
    if (sequence[currentIndex] === ability) {
      success[currentIndex] = successFill;
      currentIndex++;
    } else {
      success[currentIndex] = errorFill;
      cloneAudio(audio.alarm).play();
      dispatchEvent(new Event("resetMultiplier"));
    }

    if (currentIndex === sequence.length) {
      cloneAudio(audio.info).play();
      reset();
      dispatchEvent(new Event("increaseMultiplier"));
    }
  }

  Object.entries(inputMap).forEach(([key, _], i) => {
    addEventListener(key, ({ pressed }) => {
      if (pressed) {
        checkAbility(abilities[i]);
      }
    });
  });

  function render(ctx) {
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

  function update(delta) {}

  return {
    render,
    update,
  };
}
