const imageFactory = async (path) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = () => reject();
  });

const audioFactory = async (config) =>
  new Promise((resolve, reject) => {
    const path = typeof config === "string" ? config : config.path;

    const audio = new Audio(path);
    audio.volume = config.volume ?? 1;
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = () => reject();
  });

const defaultOnProgress = (type) => (loaded, total) =>
  console.log(`Loaded ${loaded}/${total} ${type}`);

function countLeafNodes(obj) {
  let total = 0;

  for (const value of Object.values(obj)) {
    if (typeof value === "string" || !!value.path) {
      total++;
    } else {
      total += countLeafNodes(value);
    }
  }

  return total;
}

export async function loadImages(
  assets,
  onProgress = defaultOnProgress("images")
) {
  return loadAssets(assets, imageFactory, onProgress);
}

export async function loadAudio(
  assets,
  onProgress = defaultOnProgress("audio")
) {
  return loadAssets(assets, audioFactory, onProgress);
}

async function loadAssets(assets, factory, onProgress = defaultOnProgress) {
  const total = countLeafNodes(assets);
  let success = 0;

  async function loadRecursive(obj) {
    const result = {};

    await Promise.all(
      Object.entries(obj).map(async ([key, value]) => {
        if (
          value &&
          typeof value === "object" &&
          !("path" in value || typeof value === "string")
        ) {
          result[key] = await loadRecursive(value);
        } else {
          try {
            result[key] = await factory(value);
            if (onProgress) onProgress(++success, total);
          } catch (err) {
            console.error(`Failed to load asset ${key}:`, err);
          }
        }
      })
    );

    return result;
  }

  return loadRecursive(assets);
}

export const images = await loadImages({
  arena: "./assets/arena.png",
  mugzee: "./assets/mugzee.png",
  mine: "./assets/mine.png",
  meleeDps: "./assets/rdps.svg",
  wipe: "./assets/wipe.png",
  reincarnation: "./assets/reincarnation.jpg",
});

export const audio = await loadAudio({
  pullTimer: {
    path: "./assets/audio/pull timer.ogg",
    volume: 0.2,
  },
  readyCheck: {
    path: "./assets/audio/ready check.ogg",
    volume: 0,
  },
  alarm: {
    path: "./assets/audio/alarm.ogg",
    volume: 0.3,
  },
  music: {
    path: "./assets/audio/music.ogg",
    volume: 0.2,
  },
  wipe: {
    path: "./assets/audio/wipe.ogg",
    volume: 0.3,
  },
  explosion: {
    path: "./assets/audio/explosion.ogg",
    volume: 0.3,
  },
  info: {
    path: "./assets/audio/info.ogg",
  },
  mugzee: {
    anotherStain: {
      path: "./assets/audio/mugzee/another stain.ogg",
      volume: 0.3,
    },
    justForYou: {
      path: "./assets/audio/mugzee/just for you.ogg",
      volume: 0.3,
    },
    letsFinishThisZee: {
      path: "./assets/audio/mugzee/lets finish this zee.ogg",
    },
    nowhereToRun: {
      path: "./assets/audio/mugzee/nowhere to run.ogg",
    },
    paintTheTownRed: {
      path: "./assets/audio/mugzee/paint the town red.ogg",
    },
    riggedToExplode: {
      path: "./assets/audio/mugzee/rigged to explode.ogg",
    },
    soManyToys: {
      path: "./assets/audio/mugzee/so many toys.ogg",
      volume: 0.3,
    },
    timeForDemolition: {
      path: "./assets/audio/mugzee/time for demolition.ogg",
    },
  },
});
