import { assets, inputManager } from "../config";
import type { Listener } from "../core/InputManager";
import { cloneAudio, shuffleArray } from "../utils";

type Ability = "1" | "2" | "3";
const abilities: Ability[] = ["1", "2", "3"];

export function createAbilityTracker(isActive: () => boolean) {
  const generateSequence = () => shuffleArray([...abilities]);
  const successFill = "success";
  const errorFill = "error";

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

  const listeners = abilities.map((ability) => {
    const action = `ability${ability}` as "ability1" | "ability2" | "ability3";
    const listener: Listener = ({ pressed }) => {
      if (pressed && isActive()) checkAbility(ability);
    };
    inputManager.on(action, listener);
    return { action, listener };
  });

  return {
    getState: () => ({ sequence, results: success, currentIndex }),
    destroy: () =>
      listeners.forEach(({ action, listener }) =>
        inputManager.off(action, listener),
      ),
  };
}
