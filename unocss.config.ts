// uno.config.ts
import { presetUno, presetIcons, defineConfig } from "unocss";

export default defineConfig({
  presets: [
    presetUno({
      dark: "media",
    }),
    presetIcons({}),
  ],
});
