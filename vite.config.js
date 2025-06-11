import { defineConfig } from "vite";

export default defineConfig({
  base: "/mugzee-mini-game/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
});
