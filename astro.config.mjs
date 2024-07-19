import { defineConfig } from 'astro/config';

// https://astro.build/config

export default defineConfig({
  vite: {
    build: {
      // FIXME: 後で調べる
      target: 'es2022',
    },
  },
});
