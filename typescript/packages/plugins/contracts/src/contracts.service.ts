import { Tool } from "@radiustechsystems/ai-agent-core";
import { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import {
  CallContractParameters,
  ExecuteContractParameters,
  SimulateContractParameters
} from "./parameters";

/**
 * Service class for interacting with smart contracts
 * Note: Only includes methods that are fully supported by the current wallet interface
 */
export class ContractsService {
  constructor() {}

  @Tool({
    description: "Call a read-only method on a smart contract and return the result",
  })
  async callContract(walletClient: RadiusWalletInterface, parameters: CallContractParameters) {
    try {
      const result = await walletClient.read({
        address: parameters.contractAddress,
        abi: parameters.abi,
        functionName: parameters.functionName,
        args: parameters.args || [],
      });
      
      // Return the result value (could be any type)
      return result.value;
    } catch (error) {
      throw Error(`Failed to call contract: ${error}`);
    }
  }

  @Tool({
    description: "Execute a state-changing method on a smart contract (requires transaction)",
  })
  async executeContract(walletClient: RadiusWalletInterface, parameters: ExecuteContractParameters) {
    try {
      const hash = await walletClient.sendTransaction({
        to: parameters.contractAddress,
        abi: parameters.abi,
        functionName: parameters.functionName,
        args: parameters.args || [],
        // Convert value to BigInt if it's provided as string
        value: parameters.value ? BigInt(parameters.value) : undefined,
      });
      
      return hash.hash;
    } catch (error) {
      throw Error(`Failed to execute contract: ${error}`);
    }
  }

  @Tool({
    description: "Simulate a contract interaction without submitting a transaction",
  })
  async simulateContract(walletClient: RadiusWalletInterface, parameters: SimulateContractParameters) {
    try {
      // Use the wallet's simulateTransaction method
      const result = await walletClient.simulateTransaction({
        to: parameters.contractAddress,
        abi: parameters.abi,
        functionName: parameters.functionName,
        args: parameters.args || [],
        value: parameters.value ? BigInt(parameters.value) : undefined
      });
      
      return {
        success: true,
        result: result.returnValue,
        gasEstimate: result.gasUsed.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Simulation failed: ${error}`
      };
    }
  }
}
