import { Chain, PluginBase, createTool } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";
import { EVMWalletClient } from "./evm-wallet-client";
import { radiusTestnetBase } from "./radius-chain";

export class SendETHPlugin extends PluginBase<EVMWalletClient> {
  constructor() {
    super("sendETH", []);
  }

  supportsChain = (chain: Chain) => chain.type === "evm";

  getTools(walletClient: EVMWalletClient) {
    const sendTool = createTool(
      {
        name: `send_${getChainToken(walletClient.getChain().id).symbol}`,
        description: `Send ${getChainToken(walletClient.getChain().id).symbol} to an address.`,
        parameters: sendETHParametersSchema,
      },
      (parameters: z.infer<typeof sendETHParametersSchema>) => sendETHMethod(walletClient, parameters),
    );
    return [sendTool];
  }
}

export const sendETH = () => new SendETHPlugin();

const sendETHParametersSchema = z.object({
  to: z.string().describe("The address to send ETH to"),
  amount: z.string().describe("The amount of ETH to send"),
});

async function sendETHMethod(
  walletClient: EVMWalletClient,
  parameters: z.infer<typeof sendETHParametersSchema>,
): Promise<string> {
  try {
    // Convert string amount to BigInt with proper decimals
    const amount = parseEther(parameters.amount);

    const tx = await walletClient.sendTransaction({
      to: parameters.to,
      value: amount,
    });

    return tx.hash;
  } catch (error) {
    throw new Error(`Failed to send ${getChainToken(walletClient.getChain().id).symbol}: ${error}`);
  }
}

/**
 * Parse a string amount to wei (BigInt)
 * @param value Amount as string (e.g. "1.0")
 * @returns Amount in wei as BigInt
 */
function parseEther(value: string): bigint {
  // Convert a decimal string like "1.0" to wei (1 ETH = 10^18 wei)
  const [whole, fraction] = value.split(".");

  let wei = BigInt(whole) * BigInt(10**18);
  
  if (fraction) {
    // Handle decimal portion
    const padding = 18 - fraction.length;
    if (padding >= 0) {
      wei += BigInt(fraction) * BigInt(10**padding);
    } else {
      // Truncate if too many decimal places
      wei += BigInt(fraction.slice(0, 18)) * BigInt(10**(18 - fraction.length));
    }
  }
  
  return wei;
}

/**
 * Get token information for a chain
 * @param chainId Chain ID
 * @returns Token info (symbol, name, decimals)
 */
function getChainToken(chainId: number) {
  // Currently only supporting Radius testnet
  if (chainId === radiusTestnetBase.id) {
    return {
      symbol: radiusTestnetBase.nativeCurrency.symbol,
      name: radiusTestnetBase.nativeCurrency.name,
      decimals: radiusTestnetBase.nativeCurrency.decimals,
    };
  }

  // Default to ETH if unknown
  return {
    symbol: "ETH",
    name: "ETH",
    decimals: 18,
  };
}
