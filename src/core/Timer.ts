interface TimerConfig {
  interval?: number;
  delay?: number;
  once?: boolean;
}

export interface Timer {
  update: (delta: number) => void;
  stop: () => void;
  getInterval: () => number;
  setInterval: (interval: number) => void;
}

const createTimer = (
  callback: (elapsedTime: number) => void,
  { once = false, delay = 0, interval = 0 }: TimerConfig
): Timer => {
  let accumulatedTime = 0;
  let nextTick = delay;
  let fired = false;
  let stopped = false;

  const getInterval = () => interval;
  const setInterval = (newInterval: number) => (interval = newInterval);

  const stop = () => (stopped = true);

  const update = (delta: number) => {
    if (interval === 12) {
      console.log("update");
      console.log("interval, elapsed", interval, accumulatedTime);
    }
    if ((once && fired) || stopped) return;

    accumulatedTime += delta;

    if (accumulatedTime >= nextTick) {
      fired = true;
      nextTick += interval;
      callback(accumulatedTime);
    }
  };

  return { update, stop, setInterval, getInterval };
};

export { createTimer };
