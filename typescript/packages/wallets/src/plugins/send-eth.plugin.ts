import { type Chain, PluginBase, createTool } from '@radiustechsystems/ai-agent-core';
import { z } from 'zod';
import type { RadiusWalletInterface } from '../core/RadiusWalletInterface';
import { parseEther } from '../utils/helpers';
import { getChainToken } from '../utils/utilities';

export class SendETHPlugin extends PluginBase<RadiusWalletInterface> {
  constructor() {
    super('sendETH', []);
  }

  supportsChain = (chain: Chain) => chain.type === 'evm';

  getTools(walletClient: RadiusWalletInterface) {
    const sendTool = createTool(
      {
        name: `send_${getChainToken(walletClient.getChain().id).symbol}`,
        description: `Send ${getChainToken(walletClient.getChain().id).symbol} to an address.`,
        parameters: sendETHParametersSchema,
      },
      (parameters: z.infer<typeof sendETHParametersSchema>) =>
        sendETHMethod(walletClient, parameters),
    );
    return [sendTool];
  }
}

export const sendETH = () => new SendETHPlugin();

const sendETHParametersSchema = z.object({
  to: z.string().describe('The address to send ETH to'),
  amount: z.string().describe('The amount of ETH to send'),
});

async function sendETHMethod(
  walletClient: RadiusWalletInterface,
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
