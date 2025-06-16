interface TimerConfig {
  interval?: number;
  delay?: number;
  once?: boolean;
}

type TimerCallback = (elapsedTime: number) => void;

export class Timer {
  private callback: TimerCallback;
  private config: TimerConfig;

  private elapsedTime;
  private nextTick;
  private fired;
  private stopped;

  get interval() {
    return this.config.interval ?? 0;
  }

  set interval(newInterval: number) {
    this.config.interval = newInterval;
  }

  get delay() {
    return this.config.delay ?? 0;
  }

  get once() {
    return this.config.once ?? false;
  }

  constructor(callback: TimerCallback, config: TimerConfig) {
    this.callback = callback;
    this.config = config;

    this.elapsedTime = 0;
    this.nextTick = config.delay ?? 0;
    this.fired = false;
    this.stopped = false;
  }

  public update(delta: number) {
    if ((this.once && this.fired) || this.stopped) return;

    this.elapsedTime += delta;

    if (this.elapsedTime >= this.nextTick) {
      this.fired = true;
      this.nextTick += this.interval;
      this.callback(this.elapsedTime);
    }
  }

  public stop() {
    this.stopped = true;
  }
}
