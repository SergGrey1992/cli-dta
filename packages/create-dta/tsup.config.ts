import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  shims: false,
  splitting: false,
  sourcemap: false,
  platform: 'node',
  target: 'node18',
  minify: false,
});
