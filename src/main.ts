import { createAbilityTracker } from "./abilityTracker";
import {
  drawButton,
  drawFullscreenImage,
  drawImage,
  drawPanel,
  drawText,
} from "./canvas";
import { assets, inputMap } from "./config";
import { bindInputs } from "./input";
import { createMugzee } from "./mugzee";
import { createPlayer } from "./player";

declare global {
  interface CanvasRenderingContext2D {
    width: number;
    height: number;
  }

  interface WindowEventMap {
    addEntity: AddEntityEvent;
  }
}

interface Entity {
  position?: { x: number; y: number };
  collide?: () => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  update: (delta: number) => void;
  shouldRemove: () => boolean;
}

export class AddEntityEvent extends Event {
  readonly entity: Entity;

  constructor(entity: Entity) {
    super("addEntity");
    this.entity = entity;
  }
}

const WIDTH = 1280;
const HEIGHT = 720;

let paused: boolean;
let wiped: boolean;
let lives: number;

let score: number;
let multiplier: number;
let scoreTimer: number;
let nextScoreTick: number;

assets.audio.pullTimer.onended = () => {
  assets.audio.alarm.play();
  assets.audio.music.play();
  assets.audio.mugzee.soManyToys.play();
};

const abilityTracker = createAbilityTracker();
const player = createPlayer();
let entities: Array<Entity> = [];

addEventListener("addEntity", ({ entity }) => entities.push(entity));
addEventListener("damage", () => lives--);
addEventListener("increaseMultiplier", () => {
  multiplier++;
});
addEventListener("resetMultiplier", () => {
  multiplier = 1;
});

function createCountdown(): Entity {
  let time = 6;

  return {
    render: (ctx) =>
      drawText(
        ctx,
        Math.floor(time).toString(),
        ctx.width / 2,
        ctx.height / 2 - ctx.height / 5,
        75,
        true
      ),
    update: (delta) => (time -= delta),
    shouldRemove: () => time < 1,
  };
}

function renderReadyCheck(ctx: CanvasRenderingContext2D) {
  drawPanel(ctx, ctx.width / 2, ctx.height / 2, 300, 100);
  drawText(
    ctx,
    "A ready check has been initiated",
    ctx.width / 2,
    ctx.height / 2 - 15,
    15,
    true
  );

  drawButton(ctx, ctx.width / 2, ctx.height / 2 + 20, 75, 32);
  drawText(ctx, "Ready", ctx.width / 2, ctx.height / 2 + 25, 15, true);
}

function initialClick() {
  document
    .getElementById("wrapper")
    ?.removeEventListener("click", initialClick);

  assets.audio.readyCheck.volume = 0.3;
  assets.audio.pullTimer.play();

  paused = false;
  entities.push(createCountdown());
}

function reset() {
  paused = true;
  wiped = false;
  lives = 3;
  score = 0;
  multiplier = 1;
  nextScoreTick = 5.1;
  scoreTimer = 0;

  player.position.x = 550;
  player.position.y = 250;
  entities = [createMugzee(player)];

  if (assets.audio.readyCheck.volume > 0) {
    assets.audio.readyCheck.play();
  }

  // Can't play audio until the user interacts with the page
  // Might as well use this for the ready check
  document.getElementById("wrapper")?.addEventListener("click", initialClick);
}

function wipe() {
  paused = true;
  wiped = true;

  assets.audio.music.pause();
  assets.audio.music.currentTime = 0;

  assets.audio.wipe.play();
  assets.audio.wipe.onended = () => reset();
}

function collidedWithPlayer(entity: Entity) {
  if (!entity.position) return;

  const dx = player.position.x - entity.position.x;
  const dy = player.position.y - entity.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= 50 ? entity : null;
}

function update(delta: number) {
  if (paused) {
    return;
  }

  abilityTracker.update(delta);
  player.update(delta);
  entities.forEach((e) => e.update(delta));

  // Calculate score
  scoreTimer += delta;
  if (scoreTimer >= nextScoreTick) {
    score += 5 * multiplier;
    nextScoreTick += 0.1;
  }

  // Collision check
  entities
    .map(collidedWithPlayer)
    .filter((hit) => !!hit)
    .forEach((hit) => hit.collide?.());

  if (lives <= 0) {
    lives = 0;
    wipe();
  }

  entities = entities.filter(({ shouldRemove }) => !shouldRemove?.());
}

function renderUi(ctx: CanvasRenderingContext2D) {
  if (paused && !wiped) {
    renderReadyCheck(ctx);
  }

  if (!paused) {
    abilityTracker.render(ctx);
  }

  if (wiped) {
    drawFullscreenImage(ctx, assets.images.wipe);
  }

  // Score
  drawPanel(ctx, 1015, ctx.height / 10, 150, 80);
  drawText(ctx, `Score:`, 950, ctx.height / 11, 25);
  drawText(ctx, score.toString(), 950, ctx.height / 7 - 5, 25);
  drawText(ctx, `x ${multiplier}`, 1035, ctx.height / 7 - 5, 25);

  // Life counter
  drawPanel(ctx, 260, ctx.height / 10, 150, 80);
  drawImage(ctx, assets.images.reincarnation, 230, ctx.height / 10);
  drawText(ctx, lives.toString(), 290, ctx.height / 8, 50, true);
}

function render(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.width, ctx.height);
  ctx.restore();

  drawFullscreenImage(ctx, assets.images.arena);

  entities.forEach((e) => e.render(ctx));

  player.render(ctx);

  renderUi(ctx);
}

function init() {
  const canvas = document.getElementById("game") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Did you forget to add the canvas with an id of 'game'?");
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get the 2d context...?");
  }

  // Adjust for HDPI screens (mac)
  canvas.style.width = `${WIDTH}px`;
  canvas.style.height = `${HEIGHT}px`;
  canvas.width *= devicePixelRatio;
  canvas.height *= devicePixelRatio;

  ctx.width = WIDTH;
  ctx.height = HEIGHT;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  reset();

  bindInputs(inputMap);

  let previousTime = 0;

  function frame(timestamp: number) {
    const delta =
      (previousTime > 0 ? timestamp - previousTime : timestamp) / 1000;
    previousTime = timestamp;

    update(delta);
    render(ctx!);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

init();
