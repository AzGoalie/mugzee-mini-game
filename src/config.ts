import { loadAudio, loadImages } from "./assets";
import { InputManager } from "./input";

export const assets = {
  images: await loadImages({
    arena: { path: "./assets/arena.png" },
    mugzee: { path: "./assets/mugzee.png" },
    mine: { path: "./assets/mine.png" },
    meleeDps: { path: "./assets/rdps.svg" },
    wipe: { path: "./assets/wipe.png" },
    reincarnation: { path: "./assets/reincarnation.jpg" },
  }),

  audio: await loadAudio({
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
  }),
};

export const inputMap = {
  moveUp: [{ key: "w" }, { key: "ArrowUp" }],
  moveLeft: [{ key: "a" }, { key: "ArrowLeft" }],
  moveDown: [{ key: "s" }, { key: "ArrowDown" }],
  moveRight: [{ key: "d" }, { key: "ArrowRight" }],

  ability1: [{ key: "1" }],
  ability2: [{ key: "2" }],
  ability3: [{ key: "3" }],
} as const;

export const inputManager = new InputManager(inputMap);
