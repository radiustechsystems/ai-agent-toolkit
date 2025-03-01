import { Tool } from "@radiustechsystems/ai-agent-core";
import { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import {
  CallContractParameters,
  DeployContractParameters,
  ExecuteContractParameters,
  GetContractEventsParameters,
  EstimateContractGasParameters,
  EncodeAbiParameters,
  DecodeAbiParameters,
  SimulateContractParameters,
  GetContractInfoParameters
} from "./parameters";

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
        value: parameters.value,
      });
      
      return hash.hash;
    } catch (error) {
      throw Error(`Failed to execute contract: ${error}`);
    }
  }

  @Tool({
    description: "Deploy a new smart contract from bytecode and ABI",
  })
  async deployContract(walletClient: RadiusWalletInterface, parameters: DeployContractParameters) {
    try {
      // Use the SDK NewContract functionality through the wallet
      const result = await walletClient.sendTransaction({
        abi: parameters.abi,
        bytecode: parameters.bytecode,
        args: parameters.constructorArgs || [],
        value: parameters.value
      });
      
      return {
        hash: result.hash,
        contractAddress: result.contractAddress,
      };
    } catch (error) {
      throw Error(`Failed to deploy contract: ${error}`);
    }
  }

  @Tool({
    description: "Estimate gas needed to execute a contract method",
  })
  async estimateContractGas(walletClient: RadiusWalletInterface, parameters: EstimateContractGasParameters) {
    try {
      const gasEstimate = await walletClient.estimateGas({
        address: parameters.contractAddress,
        abi: parameters.abi,
        functionName: parameters.functionName,
        args: parameters.args || [],
        value: parameters.value
      });
      
      return gasEstimate.toString();
    } catch (error) {
      throw Error(`Failed to estimate gas: ${error}`);
    }
  }

  @Tool({
    description: "Retrieve events emitted by a smart contract",
  })
  async getContractEvents(walletClient: RadiusWalletInterface, parameters: GetContractEventsParameters) {
    try {
      const logs = await walletClient.getLogs({
        address: parameters.contractAddress,
        eventName: parameters.eventName,
        abi: parameters.abi,
        fromBlock: parameters.fromBlock,
        toBlock: parameters.toBlock,
        filter: parameters.filter
      });
      
      return logs.map(log => ({
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        args: log.args
      }));
    } catch (error) {
      throw Error(`Failed to get contract events: ${error}`);
    }
  }

  @Tool({
    description: "Encode function call data using a contract ABI",
  })
  async encodeAbi(parameters: EncodeAbiParameters) {
    try {
      // Encode function call data
      const encodedData = await walletClient.encodeAbiParameters({
        abi: parameters.abi,
        functionName: parameters.functionName,
        args: parameters.args
      });
      
      return encodedData;
    } catch (error) {
      throw Error(`Failed to encode ABI: ${error}`);
    }
  }

  @Tool({
    description: "Decode function call data or return data using a contract ABI",
  })
  async decodeAbi(parameters: DecodeAbiParameters) {
    try {
      // Decode function call data
      const decodedData = await walletClient.decodeAbiParameters({
        abi: parameters.abi,
        functionName: parameters.functionName,
        data: parameters.data
      });
      
      return decodedData;
    } catch (error) {
      throw Error(`Failed to decode ABI: ${error}`);
    }
  }

  @Tool({
    description: "Simulate a contract interaction without submitting a transaction",
  })
  async simulateContract(walletClient: RadiusWalletInterface, parameters: SimulateContractParameters) {
    try {
      const from = parameters.from || await walletClient.getAddress();
      
      const result = await walletClient.simulateContract({
        address: parameters.contractAddress,
        abi: parameters.abi,
        functionName: parameters.functionName,
        args: parameters.args || [],
        value: parameters.value,
        account: from
      });
      
      return {
        success: true,
        result: result.value,
        gasEstimate: result.gasEstimate?.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Simulation failed: ${error}`
      };
    }
  }

  @Tool({
    description: "Get information about a smart contract at a specific address",
  })
  async getContractInfo(walletClient: RadiusWalletInterface, parameters: GetContractInfoParameters) {
    try {
      let abi = Array.isArray(parameters.abiOrVerified) ? parameters.abiOrVerified : null;
      
      // If abiOrVerified is true, attempt to fetch verified contract ABI
      if (parameters.abiOrVerified === true) {
        try {
          abi = await walletClient.getVerifiedContractAbi(parameters.contractAddress);
        } catch (error) {
          throw Error(`Failed to fetch verified contract ABI: ${error}`);
        }
      }
      
      if (!abi) {
        throw Error("Contract ABI is required but was not provided or could not be fetched");
      }
      
      // Get contract code to check if it exists
      const code = await walletClient.getCode(parameters.contractAddress);
      const isContract = code !== '0x' && code !== '0x0';
      
      if (!isContract) {
        return {
          exists: false,
          address: parameters.contractAddress,
          message: "No contract exists at this address"
        };
      }
      
      // Extract function and event signatures from the ABI
      const functions = abi
        .filter(item => item.type === 'function')
        .map(func => ({
          name: func.name,
          type: func.stateMutability,
          inputs: func.inputs,
          outputs: func.outputs
        }));
        
      const events = abi
        .filter(item => item.type === 'event')
        .map(event => ({
          name: event.name,
          inputs: event.inputs
        }));
      
      return {
        exists: true,
        address: parameters.contractAddress,
        functions,
        events,
        abi
      };
    } catch (error) {
      throw Error(`Failed to get contract info: ${error}`);
    }
  }
}