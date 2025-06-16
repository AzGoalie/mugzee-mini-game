import { assets } from "../config";
import type { Scene } from "../core/Game";
import type { Vec2 } from "../core/Math";
import { drawImage, drawPanel, drawText } from "../core/Renderer";
import { Timer } from "../core/Timer";
import { createAbilityTracker } from "../entities/AbilityTracker";
import { createCountdown } from "../entities/Countdown";
import { createMugzee } from "../entities/Mugzee";
import { createPlayer } from "../entities/Player";
import { createReadyCheck } from "../ui/ReadyCheck";

interface State {
  score: number;
  multiplier: number;
  scoreTimer: Timer;

  lives: number;
  wiped: boolean;

  paused: boolean;
}

interface Entity {
  position?: Vec2;
  update: (delta: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  shouldRemove?: () => boolean;
  collide?: () => void;
}

let state: State;
let player: Omit<Required<Entity>, "shouldRemove" | "collide">;
let mugzee: Entity;
let abilityTracker: Entity;
let readyCheck: Entity;
let entities: Entity[];

function increaseScore() {
  state.score += 5 * state.multiplier;
}

function reset() {
  state = {
    score: 0,
    multiplier: 1,
    lives: 3,
    scoreTimer: new Timer(increaseScore, { delay: 5, interval: 0.1 }),
    wiped: false,
    paused: true,
  };

  player = createPlayer();
  mugzee = createMugzee(player);
  abilityTracker = createAbilityTracker();
  readyCheck = createReadyCheck(onReady);

  player.position.x = 550;
  player.position.y = 250;

  entities = [mugzee];

  if (assets.audio.readyCheck.volume > 0) {
    assets.audio.readyCheck.play();
  }
}

function onReady() {
  assets.audio.readyCheck.volume = 0.3;
  assets.audio.pullTimer.play();

  state.paused = false;
  entities.push(createCountdown(6));
}

function wipe() {
  state.wiped = true;
  state.paused = true;

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
  if (state.paused) return;

  state.scoreTimer.update(delta);

  abilityTracker.update(delta);
  player.update(delta);
  entities.forEach((e) => e.update(delta));

  entities
    .map(collidedWithPlayer)
    .filter((hit) => !!hit)
    .forEach((hit) => hit.collide?.());

  if (state.lives <= 0) {
    state.lives = 0;
    wipe();
  }

  entities = entities.filter(({ shouldRemove }) => !shouldRemove?.());
}

function renderUi(ctx: CanvasRenderingContext2D) {
  if (state.paused && !state.wiped) {
    readyCheck.render(ctx);
  }

  if (!state.paused) {
    abilityTracker.render(ctx);
  }

  if (state.wiped) {
    drawImage(ctx, assets.images.wipe, 0, 0, 1, false);
  }

  // Score
  drawPanel(ctx, 1015, ctx.height / 10, 150, 80);
  drawText(ctx, `Score:`, 950, ctx.height / 11, 25);
  drawText(ctx, state.score.toString(), 950, ctx.height / 7 - 5, 25);
  drawText(ctx, `x ${state.multiplier}`, 1035, ctx.height / 7 - 5, 25);

  // Life counter
  drawPanel(ctx, 260, ctx.height / 10, 150, 80);
  drawImage(ctx, assets.images.reincarnation, 230, ctx.height / 10);
  drawText(ctx, state.lives.toString(), 290, ctx.height / 8, 50, true);
}

function render(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.width, ctx.height);
  ctx.restore();

  drawImage(ctx, assets.images.arena, 0, 0, 1, false);

  entities.forEach((e) => e.render(ctx));

  player.render(ctx);

  renderUi(ctx);
}

function onEnter() {
  assets.audio.pullTimer.onended = () => {
    assets.audio.alarm.play();
    assets.audio.music.play();
    assets.audio.mugzee.soManyToys.play();
  };

  addEventListener("addEntity", ({ entity }) => entities.push(entity));
  addEventListener("damage", () => state.lives--);
  addEventListener("increaseMultiplier", () => {
    state.multiplier++;
  });
  addEventListener("resetMultiplier", () => {
    state.multiplier = 1;
  });

  reset();
}

const scene: Scene = {
  onEnter,
  render,
  update,
};
export default scene;

export class AddEntityEvent extends Event {
  readonly entity: Entity;

  constructor(entity: Entity) {
    super("addEntity");
    this.entity = entity;
  }
}

declare global {
  interface CanvasRenderingContext2D {
    width: number;
    height: number;
  }

  interface WindowEventMap {
    addEntity: AddEntityEvent;
  }
}
