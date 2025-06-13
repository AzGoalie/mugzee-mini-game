export type KeyBinding = { key: string };
export type InputMap = Record<string, readonly KeyBinding[]>;

export type InputEvent = {
  pressed: boolean;
};
export type Listener = (event: InputEvent) => void;

export class InputManager<T extends InputMap> {
  private listeners: { [K in keyof T]?: Set<Listener> } = {};
  private heldKeys: Set<string> = new Set();
  private keyToAction: Record<string, keyof T>;

  constructor(inputMap: T) {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    this.keyToAction = Object.fromEntries(
      Object.entries(inputMap).flatMap(([action, bindings]) =>
        bindings.map(({ key }) => [key, action])
      )
    );
  }

  private handleKeyDown = ({ key }: KeyboardEvent) => {
    const action = this.keyToAction[key];
    const pressed = this.heldKeys.has(key);
    if (action && !pressed) {
      this.heldKeys.add(key);
      this.emit(action, { pressed: true });
    }
  };

  private handleKeyUp = ({ key }: KeyboardEvent) => {
    this.heldKeys.delete(key);
    const action = this.keyToAction[key];

    if (action) {
      this.emit(action, { pressed: false });
    }
  };

  public on = <K extends keyof T>(action: K, listener: Listener): void => {
    if (!this.listeners[action]) {
      this.listeners[action] = new Set();
    }
    this.listeners[action]!.add(listener);
  };

  public off = <K extends keyof T>(action: K, listener: Listener): void => {
    this.listeners[action]?.delete(listener);
  };

  public once = <K extends keyof T>(action: K, listener: Listener): void => {
    const onceListener: Listener = (event) => {
      listener(event);
      this.off(action, onceListener);
    };
    this.on(action, onceListener);
  };

  private emit = <K extends keyof T>(action: K, event: InputEvent): void => {
    this.listeners[action]?.forEach((listener) => listener(event));
  };

  public destroy = (): void => {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.heldKeys.clear();
    for (const action in this.listeners) {
      this.listeners[action]?.clear();
    }
  };
}
