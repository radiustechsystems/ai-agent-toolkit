# AI Agent Toolkit for Radius - ERC20 Plugin (TypeScript)

ERC20 plugin for AI Agent Toolkit for Radius. Allows you to create tools for transferring and getting the balance of ERC20 tokens.

## Installation

```bash
npm install @radiustechsystems/ai-agent-plugin-erc20
```

## Usage

```typescript
import { erc20 } from "@radiustechsystems/ai-agent-plugin-erc20"


const plugin = erc20({
  tokens: [USDC]
})
```

### Adding custom tokens

```typescript
import { erc20 } from "@radiustechsystems/ai-agent-plugin-erc20"


const plugin = erc20({
  tokens: [
    RAD,
    {
      decimals: 18,
      symbol: "RAD",
      name: "Radius Token",
      chains: {
        "1223953": {
          contractAddress: "0xB73AAc53149af16DADA10D7cC99a9c4Cb722e21E"
        }
      }
    }
  ]
})
```
