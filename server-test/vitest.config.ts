import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: [
      {
        find: /^#db-helpers\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'db-helpers/$1'),
      },
      {
        find: /^#configs\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'configs/$1'),
      },
      {
        find: /^#generated\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'generated/$1'),
      },
      {
        find: /^#src\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'src/$1'),
      },
      {
        find: /^#domain\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'src/domain/$1'),
      },
      {
        find: /^#service\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'src/service/$1'),
      },
      {
        find: /^#repository\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'src/repository/$1'),
      },
      {
        find: /^#interfaces\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'src/interfaces/$1'),
      },
      {
        find: /^#middleware\/(.+?)(?:\.js)?$/,
        replacement: path.resolve(__dirname, 'middleware/$1'),
      },
    ],
  },
});
