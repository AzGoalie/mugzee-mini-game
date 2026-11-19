import { assets } from "../config";

interface UiState {
  score: number;
  multiplier: number;
  lives: number;
  paused: boolean;
  wiped: boolean;
  countdown?: number;
  rotation: {
    sequence: readonly string[];
    results: readonly string[];
    currentIndex: number;
  };
}

/** Owns DOM presentation; game state stays in the scene and entities. */
export function createGameUi() {
  const root = document.getElementById("ui")!;
  const score = document.getElementById("score")!;
  const lives = document.getElementById("lives")!;
  const multiplier = document.getElementById("multiplier")!;
  const rotation = document.getElementById("rotation")!;
  const steps = [
    ...document.querySelectorAll<HTMLLIElement>("#rotation-steps li"),
  ];
  const countdown = document.getElementById("countdown")!;
  const wipe = document.getElementById("wipe")!;
  (document.getElementById("life-icon") as HTMLImageElement).src =
    assets.images.reincarnation.src;
  (document.getElementById("wipe-image") as HTMLImageElement).src =
    assets.images.wipe.src;
  root.hidden = false;

  // Avoid rewriting unchanged text (and live regions) every frame.
  const setText = (element: HTMLElement, value: string) => {
    if (element.textContent !== value) element.textContent = value;
  };

  return {
    update(state: UiState) {
      setText(score, state.score.toLocaleString());
      setText(lives, String(state.lives));
      setText(multiplier, `× ${state.multiplier}`);
      rotation.hidden = state.paused;
      steps.forEach((step, index) => {
        const result = state.rotation.results[index] ?? "pending";
        const current = index === state.rotation.currentIndex;
        setText(step, state.rotation.sequence[index]);
        step.dataset.result = result;
        step.setAttribute(
          "aria-label",
          `Ability ${state.rotation.sequence[index]}: ${result}${current ? ", next" : ""}`,
        );
        if (current) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
      countdown.hidden = state.countdown === undefined || state.wiped;
      setText(
        countdown,
        state.countdown === undefined ? "" : String(state.countdown),
      );
      wipe.hidden = !state.wiped;
    },
  };
}
