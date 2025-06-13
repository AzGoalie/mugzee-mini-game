import { warning } from "./Logger";

declare global {
  interface CanvasRenderingContext2D {
    width: number;
    height: number;
  }
}

export interface Scene {
  update: (delta: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  onEnter?: () => void;
  onExit?: () => void;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private scenes: Record<string, Scene> = {};
  private currentScene?: Scene;

  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;
  private running: boolean = false;

  constructor() {
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    if (!canvas) {
      throw new Error("Did you forget to add the canvas with an id of 'game'?");
    }
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D rendering context");
    }
    this.ctx = ctx;

    // Adjust for HDPI screens (mac)
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width *= devicePixelRatio;
    this.canvas.height *= devicePixelRatio;

    this.ctx.width = width;
    this.ctx.height = height;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();

    requestAnimationFrame(this.gameLoop);
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  addScene(name: string, scene: Scene): void {
    this.scenes[name] = scene;
  }

  switchScene(name: string): void {
    const previousScene = this.currentScene;
    this.currentScene = this.scenes[name];

    if (this.currentScene == null) {
      warning(`Did you mispell or forget to add ${name}?`);
    }

    previousScene?.onExit?.();
    this.currentScene?.onEnter?.();
  }

  private gameLoop = (currentTime: number): void => {
    const delta = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.currentScene?.update(delta);
    this.currentScene?.render(this.ctx);

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
}
