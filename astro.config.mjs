import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind()],
  vite: {
    optimizeDeps: {
      exclude: ["oslo"]
    }
  },
  adapter: node({
    mode: "standalone"
  })
});