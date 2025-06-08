class InputEvent extends Event {
  constructor(name, pressed) {
    super(name);

    this.pressed = pressed;
  }
}

export function bindInputs(inputMap) {
  const actions = Object.fromEntries(
    Object.entries(inputMap).flatMap(([key, inputs]) => {
      return inputs.map((i) => [i.key, key]);
    })
  );

  const pressed = Object.fromEntries(
    Object.keys(actions).map((key) => [key, false])
  );

  const onKeyDown = (e) => {
    const action = actions[e.key];
    if (!pressed[e.key] && action) {
      pressed[e.key] = true;
      dispatchEvent(new InputEvent(action, true));
    }
  };

  const onKeyUp = (e) => {
    const action = actions[e.key];
    if (pressed[e.key] && action) {
      pressed[e.key] = false;
      dispatchEvent(new InputEvent(action, false));
    }
  };

  addEventListener("keydown", onKeyDown);
  addEventListener("keyup", onKeyUp);

  return () => {
    removeEventListener("keydown", onKeyDown);
    removeEventListener("keyup", onKeyUp);
  };
}
