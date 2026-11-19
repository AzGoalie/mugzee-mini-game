export const createCountdown = (time: number) => {
  let countdown = time;
  return {
    update: (delta: number) => {
      countdown -= delta;
    },
    getValue: () => Math.floor(countdown),
    shouldRemove: () => countdown < 1,
  };
};
