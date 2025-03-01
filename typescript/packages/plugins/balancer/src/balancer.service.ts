import {
  AddLiquidity,
  AddLiquidityInput,
  AddLiquidityKind,
  BalancerApi,
  ChainId,
  InputAmount,
  RemoveLiquidity,
  RemoveLiquidityInput,
  RemoveLiquidityKind,
  Slippage,
  Swap,
  SwapBuildOutputExactIn,
  SwapKind,
  Token,
  TokenAmount,
} from "@balancer/sdk";
import { Tool } from "@radiustechsystems/ai-agent-core";
import type { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import type { BalancerConfig } from "./balancer.plugin";
import { LiquidityParameters, RemoveLiquidityParameters, SwapParameters } from "./parameters";

export class BalancerService {
  private readonly rpcUrl: string;
  private readonly apiUrl: string;

  constructor(config: BalancerConfig) {
    this.rpcUrl = config.rpcUrl;
    this.apiUrl = config.apiUrl ?? "https://api-v3.balancer.fi/";
  }

  /**
   * Gets a BalancerApi instance for the specified chain
   * @param chainId Chain ID to connect to
   * @returns BalancerApi instance
   */
  private getBalancerApi(chainId: ChainId): BalancerApi {
    return new BalancerApi(this.apiUrl, chainId);
  }

  @Tool({
    name: "swap_on_balancer",
    description: "Swap a token on Balancer using Smart Order Router"
  })
  async swapOnBalancer(walletClient: RadiusWalletInterface, parameters: SwapParameters) {
    try {
      // Get chain ID from wallet client
      const chainId = walletClient.getChain().id as ChainId;
      const balancerApi = this.getBalancerApi(chainId);

      // Create token objects with proper type casting
      const tokenIn = new Token(
        chainId, 
        parameters.tokenIn as `0x${string}`, 
        parameters.tokenInDecimals
      );
      const tokenOut = new Token(
        chainId, 
        parameters.tokenOut as `0x${string}`, 
        parameters.tokenOutDecimals
      );

      // Create swap amount from input
      const swapAmount = TokenAmount.fromRawAmount(tokenIn, parameters.amountIn);

      // Get swap paths from Balancer API
      const sorPaths = await balancerApi.sorSwapPaths.fetchSorSwapPaths({
        chainId,
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        swapKind: SwapKind.GivenIn,
        swapAmount,
      });

      // Create swap instance
      const swap = new Swap({
        chainId,
        paths: sorPaths,
        swapKind: SwapKind.GivenIn,
      });

      // Query for updated swap data
      const updated = await swap.query(this.rpcUrl);

      // Calculate deadline timestamp
      const deadlineSeconds = parameters.deadline || 3600; // Default 1 hour
      const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + deadlineSeconds);

      // Build transaction call data
      const callData = swap.buildCall({
        slippage: Slippage.fromPercentage(`${Number(parameters.slippage)}`),
        deadline: deadlineTimestamp,
        queryOutput: updated,
        wethIsEth: parameters.wethIsEth ?? false,
        sender: walletClient.getAddress() as `0x${string}`,
        recipient: walletClient.getAddress() as `0x${string}`,
      }) as SwapBuildOutputExactIn;

      // Send transaction using wallet client
      const tx = await walletClient.sendTransaction({
        to: callData.to as `0x${string}`,
        value: callData.value,
        data: callData.callData,
      });

      // Return success response
      return {
        success: true,
        data: {
          amountOut: callData.minAmountOut.amount.toString(),
          txHash: tx.hash,
        },
      };
    } catch (error) {
      // Handle errors consistently
      return {
        success: false,
        error: `Failed to swap on Balancer: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  @Tool({
    name: "add_liquidity_to_balancer",
    description: "Add liquidity to a Balancer pool",
  })
  async addLiquidity(walletClient: RadiusWalletInterface, parameters: LiquidityParameters) {
    try {
      // Get chain ID from wallet client
      const chainId = walletClient.getChain().id as ChainId;
      const balancerApi = this.getBalancerApi(chainId);

      // Fetch pool state from Balancer API
      const poolState = await balancerApi.pools.fetchPoolState(parameters.pool as `0x${string}`);

      // Convert input amounts to format expected by Balancer SDK
      const amountsIn = parameters.amounts.map((amount) => ({
        rawAmount: BigInt(amount.amount),
        decimals: amount.decimals,
        address: amount.token as `0x${string}`,
      }));

      // Create input based on the kind of liquidity addition
      const addLiquidityInput = parameters.kind === "Exact"
        ? {
          chainId,
          rpcUrl: this.rpcUrl,
          amountsIn,
          kind: AddLiquidityKind.SingleToken,
          // Add any additional properties required for SingleToken kind
        } as unknown as AddLiquidityInput
        : {
          chainId,
          rpcUrl: this.rpcUrl,
          amountsIn,
          kind: AddLiquidityKind.Unbalanced,
        } as AddLiquidityInput;

      // Create AddLiquidity instance and query
      const addLiquidity = new AddLiquidity();
      const queryOutput = await addLiquidity.query(addLiquidityInput, poolState);

      // Build transaction call data
      const call = addLiquidity.buildCall({
        ...queryOutput,
        slippage: Slippage.fromPercentage(`${Number(parameters.slippage)}`),
        chainId,
        wethIsEth: parameters.wethIsEth ?? false,
      });

      // Send transaction using wallet client
      const tx = await walletClient.sendTransaction({
        to: call.to as `0x${string}`,
        value: call.value,
        data: call.callData,
      });

      // Return success response
      return {
        success: true,
        data: {
          bptOut: queryOutput.bptOut.amount.toString(),
          txHash: tx.hash,
        },
      };
    } catch (error) {
      // Handle errors consistently
      return {
        success: false,
        error: `Failed to add liquidity to Balancer: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  @Tool({
    name: "remove_liquidity_from_balancer",
    description: "Remove liquidity from a Balancer pool proportionally",
  })
  async removeLiquidity(walletClient: RadiusWalletInterface, parameters: RemoveLiquidityParameters) {
    try {
      // Get chain ID from wallet client
      const chainId = walletClient.getChain().id as ChainId;
      const balancerApi = this.getBalancerApi(chainId);

      // Fetch pool state from Balancer API
      const poolState = await balancerApi.pools.fetchPoolState(parameters.pool as `0x${string}`);

      // Create input for BPT tokens
      const bptIn: InputAmount = {
        rawAmount: BigInt(parameters.bptAmountIn),
        decimals: 18, // BPT tokens always have 18 decimals
        address: poolState.address,
      };

      // Create input based on the kind of liquidity removal
      const removeLiquidityInput = parameters.kind === "Single"
        ? {
          chainId,
          rpcUrl: this.rpcUrl,
          bptIn,
          kind: RemoveLiquidityKind.SingleTokenExactIn,
          // Additional properties for SingleTokenExactIn might be needed here
        } as unknown as RemoveLiquidityInput
        : {
          chainId,
          rpcUrl: this.rpcUrl,
          bptIn,
          kind: RemoveLiquidityKind.Proportional,
        } as RemoveLiquidityInput;

      // Create RemoveLiquidity instance and query
      const removeLiquidity = new RemoveLiquidity();
      const queryOutput = await removeLiquidity.query(removeLiquidityInput, poolState);

      // Build transaction call data
      const call = removeLiquidity.buildCall({
        ...queryOutput,
        slippage: Slippage.fromPercentage(`${Number(parameters.slippage)}`),
        chainId,
        wethIsEth: parameters.wethIsEth ?? false,
      });

      // Send transaction using wallet client
      const tx = await walletClient.sendTransaction({
        to: call.to as `0x${string}`,
        value: call.value,
        data: call.callData,
      });

      // Map output amounts with proper typing
      const amountsOut = queryOutput.amountsOut.map((amount) => ({
        token: amount.token.address,
        amount: amount.amount.toString(),
      }));

      // Return success response
      return {
        success: true,
        data: {
          amountsOut,
          txHash: tx.hash,
        },
      };
    } catch (error) {
      // Handle errors consistently
      return {
        success: false,
        error: `Failed to remove liquidity from Balancer: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
