import { Tool } from "@radiustechsystems/ai-agent-core";
import { 
  RadiusWalletInterface, 
  formatUnits,
  parseUnits,
  TransactionError,
  ContractError
} from "@radiustechsystems/ai-agent-wallet";
import { ERC20_ABI } from "./abi";
import {
  ApproveParameters,
  ConvertFromBaseUnitParameters,
  ConvertToBaseUnitParameters,
  GetTokenAllowanceParameters,
  GetTokenBalanceParameters,
  GetTokenInfoBySymbolParameters,
  GetTokenTotalSupplyParameters,
  RevokeApprovalParameters,
  TransferFromParameters,
  TransferParameters,
} from "./parameters";
import { Token } from "./token";

export class Erc20Service {
  private tokens: Token[];

  constructor({ tokens }: { tokens?: Token[] } = {}) {
    this.tokens = tokens ?? [];
  }

    @Tool({
      description: "Get the ERC20 token info by its symbol, including the contract address, decimals, and name",
    })
  async getTokenInfoBySymbol(walletClient: RadiusWalletInterface, parameters: GetTokenInfoBySymbolParameters) {
    const token = this.tokens.find((token) =>
      [token.symbol, token.symbol.toLowerCase()].includes(parameters.symbol),
    );

    if (!token) {
      throw Error(`Token with symbol ${parameters.symbol} not found`);
    }

    const chain = walletClient.getChain();

    const contractAddress = token.chains[chain.id]?.contractAddress;

    if (!contractAddress) {
      throw Error(`Token with symbol ${parameters.symbol} not found on chain ${chain.id}`);
    }

    return {
      symbol: token?.symbol,
      contractAddress,
      decimals: token?.decimals,
      name: token?.name,
    };
  }

    @Tool({
      description: "Get the balance of an ERC20 token, returning both formatted and base units",
    })
    async getTokenBalance(walletClient: RadiusWalletInterface, parameters: GetTokenBalanceParameters) {
      try {
        const resolvedWalletAddress = await walletClient.resolveAddress(parameters.wallet);
        
        // Find the token to get its decimals
        const token = this.tokens.find(t => 
          Object.values(t.chains).some(c => 
            c.contractAddress.toLowerCase() === parameters.tokenAddress.toLowerCase()
          )
        );
        
        const decimals = token?.decimals || parameters.decimals || 18;
        
        const rawBalance = await walletClient.read({
          address: parameters.tokenAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [resolvedWalletAddress],
        });

        // Return a more comprehensive balance info
        return {
          value: formatUnits(BigInt(rawBalance.value as string || "0"), decimals),
          inBaseUnits: (rawBalance.value as bigint).toString(),
          decimals,
          symbol: token?.symbol,
          name: token?.name,
        };
      } catch (error) {
        // eslint-disable-next-line max-len
        throw new ContractError(
          `Failed to fetch token balance: ${error instanceof Error ? error.message : String(error)}`,
          parameters.tokenAddress,
          "balanceOf"
        );
      }
    }

    @Tool({
      description: "Transfer an amount of an ERC20 token to an address",
    })
    async transfer(walletClient: RadiusWalletInterface, parameters: TransferParameters) {
      try {
        const to = await walletClient.resolveAddress(parameters.to);
        
        // Find the token to get its decimals if needed
        let amountInBaseUnits = parameters.amount;
        
        // If the amount is a decimal number provided as a string, parse it to base units
        if (parameters.formatAmount) {
          // Find token to get decimals
          const token = this.tokens.find(t => 
            Object.values(t.chains).some(c => 
              c.contractAddress.toLowerCase() === parameters.tokenAddress.toLowerCase()
            )
          );
          
          const decimals = token?.decimals || parameters.decimals || 18;
          amountInBaseUnits = parseUnits(parameters.amount, decimals).toString();
        }

        const hash = await walletClient.sendTransaction({
          to: parameters.tokenAddress,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [to, amountInBaseUnits],
        });
        
        return {
          success: true,
          txHash: hash.hash,
          message: "Token transfer successful",
        };
      } catch (error) {
        // eslint-disable-next-line max-len
        throw new TransactionError(`Failed to transfer token: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    @Tool({
      description: "Get the total supply of an ERC20 token",
    })
    async getTokenTotalSupply(walletClient: RadiusWalletInterface, parameters: GetTokenTotalSupplyParameters) {
      try {
        // Find the token to get its decimals
        const token = this.tokens.find(t => 
          Object.values(t.chains).some(c => 
            c.contractAddress.toLowerCase() === parameters.tokenAddress.toLowerCase()
          )
        );
        
        const decimals = token?.decimals || parameters.decimals || 18;
        
        const rawTotalSupply = await walletClient.read({
          address: parameters.tokenAddress,
          abi: ERC20_ABI,
          functionName: "totalSupply",
        });

        // Return both formatted and raw values
        return {
          formatted: formatUnits(BigInt(rawTotalSupply.value as string || "0"), decimals),
          value: (rawTotalSupply.value as bigint).toString(),
          decimals,
          symbol: token?.symbol,
          name: token?.name,
        };
      } catch (error) {
        // eslint-disable-next-line max-len
        throw new ContractError(
          `Failed to fetch token supply: ${error instanceof Error ? error.message : String(error)}`,
          parameters.tokenAddress,
          "totalSupply"
        );
      }
    }

    @Tool({
      description: "Get the allowance of an ERC20 token",
    })
    async getTokenAllowance(walletClient: RadiusWalletInterface, parameters: GetTokenAllowanceParameters) {
      try {
        const owner = await walletClient.resolveAddress(parameters.owner);
        const spender = await walletClient.resolveAddress(parameters.spender);

        // Find the token to get its decimals
        const token = this.tokens.find(t => 
          Object.values(t.chains).some(c => 
            c.contractAddress.toLowerCase() === parameters.tokenAddress.toLowerCase()
          )
        );
        
        const decimals = token?.decimals || parameters.decimals || 18;
        
        const rawAllowance = await walletClient.read({
          address: parameters.tokenAddress,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [owner, spender],
        });
        
        return {
          formatted: formatUnits(BigInt(rawAllowance.value as string || "0"), decimals),
          value: (rawAllowance.value as bigint).toString(),
          decimals,
          symbol: token?.symbol,
          name: token?.name,
          owner,
          spender,
        };
      } catch (error) {
        // eslint-disable-next-line max-len
        throw new ContractError(
          `Failed to fetch token allowance: ${error instanceof Error ? error.message : String(error)}`,
          parameters.tokenAddress,
          "allowance"
        );
      }
    }

    @Tool({
      description: "Approve an amount of an ERC20 token to an address",
    })
    async approve(walletClient: RadiusWalletInterface, parameters: ApproveParameters) {
      try {
        const spender = await walletClient.resolveAddress(parameters.spender);
        
        // Handle formatting if needed
        let amountInBaseUnits = parameters.amount;
        
        if (parameters.formatAmount) {
          // Find token to get decimals
          const token = this.tokens.find(t => 
            Object.values(t.chains).some(c => 
              c.contractAddress.toLowerCase() === parameters.tokenAddress.toLowerCase()
            )
          );
          
          const decimals = token?.decimals || parameters.decimals || 18;
          amountInBaseUnits = parseUnits(parameters.amount, decimals).toString();
        }

        const hash = await walletClient.sendTransaction({
          to: parameters.tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spender, amountInBaseUnits],
        });
        
        return {
          success: true,
          txHash: hash.hash,
          message: "Token approval successful",
          spender,
          amount: amountInBaseUnits
        };
      } catch (error) {
        // eslint-disable-next-line max-len
        throw new TransactionError(`Failed to approve token: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    @Tool({
      description: "Revoke approval for an ERC20 token to an address",
    })
    async revokeApproval(walletClient: RadiusWalletInterface, parameters: RevokeApprovalParameters) {
      try {
        const spender = await walletClient.resolveAddress(parameters.spender);

        const hash = await walletClient.sendTransaction({
          to: parameters.tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spender, "0"],
        });
        
        return {
          success: true,
          txHash: hash.hash,
          message: "Token approval revoked successfully",
          spender
        };
      } catch (error) {
        // eslint-disable-next-line max-len
        throw new TransactionError(`Failed to revoke token approval: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    @Tool({
      description: "Transfer an amount of an ERC20 token from an address to another address",
    })
    async transferFrom(walletClient: RadiusWalletInterface, parameters: TransferFromParameters) {
      try {
        const from = await walletClient.resolveAddress(parameters.from);
        const to = await walletClient.resolveAddress(parameters.to);
        
        // Handle formatting if needed
        let amountInBaseUnits = parameters.amount;
        
        if (parameters.formatAmount) {
          // Find token to get decimals
          const token = this.tokens.find(t => 
            Object.values(t.chains).some(c => 
              c.contractAddress.toLowerCase() === parameters.tokenAddress.toLowerCase()
            )
          );
          
          const decimals = token?.decimals || parameters.decimals || 18;
          amountInBaseUnits = parseUnits(parameters.amount, decimals).toString();
        }

        const hash = await walletClient.sendTransaction({
          to: parameters.tokenAddress,
          abi: ERC20_ABI,
          functionName: "transferFrom",
          args: [from, to, amountInBaseUnits],
        });
        
        return {
          success: true,
          txHash: hash.hash,
          message: "Token transferFrom successful",
          from,
          to,
          amount: amountInBaseUnits
        };
      } catch (error) {
        // eslint-disable-next-line max-len
        throw new TransactionError(`Failed to transfer token from: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    @Tool({
      description: "Convert an amount of an ERC20 token to its base unit",
    })
    async convertToBaseUnit(parameters: ConvertToBaseUnitParameters) {
      try {
        const { amount, decimals } = parameters;
        // Use parseUnits from the SDK for better precision
        const baseUnit = parseUnits(amount.toString(), decimals);
        
        // Return both string and numeric representation
        return {
          value: baseUnit.toString(),
          decimals
        };
      } catch (error) {
        throw new Error(`Failed to convert to base units: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    @Tool({
      description: "Convert an amount of an ERC20 token from its base unit to its decimal unit",
    })
    async convertFromBaseUnit(parameters: ConvertFromBaseUnitParameters) {
      try {
        const { amount, decimals } = parameters;
        // Use formatUnits from the SDK for better precision
        const decimalStr = formatUnits(BigInt(amount), decimals);
        
        return {
          value: decimalStr,
          decimals
        };
      } catch (error) {
        throw new Error(`Failed to convert from base units: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
}
