export class InputEvent extends Event {
  readonly pressed: boolean;

  constructor(name: string, pressed: boolean) {
    super(name);
    this.pressed = pressed;
  }
}

interface InputMap {
  [action: string]: Array<{ key: string }>;
}

type ActionNames<T extends InputMap> = keyof T & string;

export function bindInputs<T extends InputMap>(inputMap: T) {
  // Map each key (like "w", "ArrowUp") to an action name (like "move_up")
  const actions: Record<string, ActionNames<T>> = Object.fromEntries(
    Object.entries(inputMap).flatMap(([action, inputs]) =>
      inputs.map((i) => [i.key, action])
    )
  ) as Record<string, ActionNames<T>>;

  // Track whether a key is pressed or not
  const pressed: Record<string, boolean> = Object.fromEntries(
    Object.keys(actions).map((key) => [key, false])
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const action = actions[e.key];
    if (action && !pressed[e.key]) {
      pressed[e.key] = true;
      dispatchEvent(new InputEvent(action, true));
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const action = actions[e.key];
    if (action && pressed[e.key]) {
      pressed[e.key] = false;
      dispatchEvent(new InputEvent(action, false));
    }
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}
