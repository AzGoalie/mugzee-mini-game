export const debug = (message: string) => {
  if (import.meta.env.DEV) {
    console.debug(`[DEBUG]: ${message}`);
  }
};

export const info = (message: string) => {
  if (import.meta.env.DEV) {
    console.log(`[INFO]: ${message}`);
  }
};

export const warning = (message: string) => {
  console.warn(`[WARN]: ${message}`);
};

export const error = (message: string) => {
  console.error(`[ERROR]: ${message}`);
};
