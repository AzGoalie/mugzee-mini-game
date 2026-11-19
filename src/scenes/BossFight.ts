import { assets } from "../config";
import type { Scene } from "../core/Game";
import type { Vec2 } from "../core/Math";
import { Timer } from "../core/Timer";
import { createAbilityTracker } from "../entities/AbilityTracker";
import { createCountdown } from "../entities/Countdown";
import { createMugzee } from "../entities/Mugzee";
import { createPlayer } from "../entities/Player";
import { createGameUi } from "../ui/GameUi";
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
let abilityTracker: ReturnType<typeof createAbilityTracker>;
let readyCheck: ReturnType<typeof createReadyCheck>;
let countdown: ReturnType<typeof createCountdown> | undefined;
let ui: ReturnType<typeof createGameUi>;
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
  abilityTracker?.destroy();
  readyCheck?.destroy();
  countdown = undefined;
  abilityTracker = createAbilityTracker(() => !state.paused);
  readyCheck = createReadyCheck(onReady);

  player.position.x = 378;
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
  countdown = createCountdown(6);
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
  if (state.paused) {
    updateUi();
    return;
  }

  state.scoreTimer.update(delta);

  countdown?.update(delta);
  if (countdown?.shouldRemove()) countdown = undefined;
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
  updateUi();
}

function updateUi() {
  ui.update({
    ...state,
    rotation: abilityTracker.getState(),
    countdown: countdown?.getValue(),
  });
}

function render(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.width, ctx.height);
  ctx.restore();

  ctx.drawImage(assets.images.arena, 0, 0);

  entities.forEach((e) => e.render(ctx));

  player.render(ctx);
}

function onEnter() {
  ui = createGameUi();
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
