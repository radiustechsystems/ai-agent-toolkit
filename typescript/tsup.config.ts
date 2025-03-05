import { defineConfig } from 'tsup';
import { treeShakableConfig } from './tsup.config.base';

export default defineConfig({
  ...treeShakableConfig,
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Disable TypeScript declaration to avoid rootDir issues
  sourcemap: true,
  clean: true,
  skipNodeModulesBundle: true,
  external: [
    '@radiustechsystems/ai-agent-core',
    '@radiustechsystems/ai-agent-wallet',
    '@radiustechsystems/ai-agent-adapter-vercel-ai',
    '@radiustechsystems/ai-agent-adapter-langchain',
    '@radiustechsystems/ai-agent-adapter-model-context-protocol',
    '@radiustechsystems/ai-agent-plugin-contracts',
    '@radiustechsystems/ai-agent-plugin-crypto',
    '@radiustechsystems/ai-agent-plugin-erc20',
    '@radiustechsystems/ai-agent-plugin-uniswap',
  ],
});
