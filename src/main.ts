import { Game } from "./core/Game";
import bossFight from "./scenes/BossFight";

const game = new Game();
game.addScene("play", bossFight);
game.switchScene("play");
game.start();
