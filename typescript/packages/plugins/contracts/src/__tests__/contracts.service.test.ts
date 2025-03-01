import { describe, test, expect, vi, beforeEach } from "vitest";
import { ContractsService } from "../contracts.service";
import { 
  CallContractParameters, 
  ExecuteContractParameters,
  SimulateContractParameters 
} from "../parameters";
import { RadiusWalletInterface } from "@radiustechsystems/ai-agent-wallet";
import { EvmChain } from "@radiustechsystems/ai-agent-core";

// Import the actual ai-agent-core module and just mock the Tool decorator
vi.mock("@radiustechsystems/ai-agent-core", async () => {
  const actual = await vi.importActual("@radiustechsystems/ai-agent-core");
  return {
    ...actual,
    Tool: vi.fn().mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (target: any, propertyKey: string) => {
        // This mock implementation just marks the method as a tool
        target[propertyKey].isTool = true;
      };
    })
  };
});

// Mock sample ABI for testing
const mockAbi = [
  {
    "inputs": [{"name": "param1", "type": "uint256"}],
    "name": "testFunction",
    "outputs": [{"name": "value", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "param1", "type": "uint256"}],
    "name": "testWrite",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Create a mock wallet client
const mockWalletClient: Partial<RadiusWalletInterface> = {
  getChain: vi.fn(() => ({ id: 1, type: "evm" } as EvmChain)),
  getAddress: vi.fn(() => "0xmockaddress"),
  read: vi.fn().mockResolvedValue({ value: "mockResult", success: true }),
  sendTransaction: vi.fn().mockResolvedValue({ hash: "0xmocktxhash" }),
  simulateTransaction: vi.fn().mockResolvedValue({ 
    success: true, 
    gasUsed: BigInt(21000),
    returnValue: "0x" 
  })
};

describe("ContractsService", () => {
  let service: ContractsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ContractsService();
  });

  describe("callContract", () => {
    test("should successfully call a read-only contract method", async () => {
      const parameters = new CallContractParameters();
      parameters.contractAddress = "0xcontractaddress";
      parameters.abi = mockAbi;
      parameters.functionName = "testFunction";
      parameters.args = [123];

      const result = await service.callContract(
        mockWalletClient as RadiusWalletInterface,
        parameters
      );

      // Verify wallet client was called correctly
      expect(mockWalletClient.read).toHaveBeenCalledWith({
        address: "0xcontractaddress",
        abi: mockAbi,
        functionName: "testFunction",
        args: [123]
      });

      expect(result).toBe("mockResult");
    });

    test("should throw an error when contract call fails", async () => {
      const parameters = new CallContractParameters();
      parameters.contractAddress = "0xcontractaddress";
      parameters.abi = mockAbi;
      parameters.functionName = "testFunction";
      parameters.args = [123];

      // Mock an error in the read function
      mockWalletClient.read = vi.fn().mockRejectedValue(new Error("Contract call failed"));

      await expect(service.callContract(
        mockWalletClient as RadiusWalletInterface,
        parameters
      )).rejects.toThrow("Failed to call contract: Error: Contract call failed");
    });
  });

  describe("executeContract", () => {
    test("should execute a state-changing contract method", async () => {
      const parameters = new ExecuteContractParameters();
      parameters.contractAddress = "0xcontractaddress";
      parameters.abi = mockAbi;
      parameters.functionName = "testWrite";
      parameters.args = [123];
      parameters.value = "1000000";

      const result = await service.executeContract(
        mockWalletClient as RadiusWalletInterface,
        parameters
      );

      // Verify wallet client was called correctly
      expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith({
        to: "0xcontractaddress",
        abi: mockAbi,
        functionName: "testWrite",
        args: [123],
        value: BigInt(1000000)
      });

      expect(result).toBe("0xmocktxhash");
    });

    test("should handle missing args and value", async () => {
      const parameters = new ExecuteContractParameters();
      parameters.contractAddress = "0xcontractaddress";
      parameters.abi = mockAbi;
      parameters.functionName = "testWrite";
      // No args or value

      await service.executeContract(
        mockWalletClient as RadiusWalletInterface,
        parameters
      );

      // Verify wallet client was called with defaults
      expect(mockWalletClient.sendTransaction).toHaveBeenCalledWith({
        to: "0xcontractaddress",
        abi: mockAbi,
        functionName: "testWrite",
        args: [],
        value: undefined
      });
    });

    test("should throw an error when contract execution fails", async () => {
      const parameters = new ExecuteContractParameters();
      parameters.contractAddress = "0xcontractaddress";
      parameters.abi = mockAbi;
      parameters.functionName = "testWrite";
      parameters.args = [123];

      // Mock an error in the sendTransaction function
      mockWalletClient.sendTransaction = vi.fn().mockRejectedValue(new Error("Execution failed"));

      await expect(service.executeContract(
        mockWalletClient as RadiusWalletInterface,
        parameters
      )).rejects.toThrow("Failed to execute contract: Error: Execution failed");
    });
  });

  describe("simulateContract", () => {
    test("should simulate a contract interaction successfully", async () => {
      const parameters = new SimulateContractParameters();
      parameters.contractAddress = "0xcontractaddress";
      parameters.abi = mockAbi;
      parameters.functionName = "testWrite";
      parameters.args = [123];
      parameters.value = "1000000";

      const result = await service.simulateContract(
        mockWalletClient as RadiusWalletInterface,
        parameters
      );

      // Verify wallet client was called correctly
      expect(mockWalletClient.simulateTransaction).toHaveBeenCalledWith({
        to: "0xcontractaddress",
        abi: mockAbi,
        functionName: "testWrite",
        args: [123],
        value: BigInt(1000000)
      });

      expect(result).toEqual({
        success: true,
        result: "0x",
        gasEstimate: "21000"
      });
    });

    test("should handle simulation failures gracefully", async () => {
      const parameters = new SimulateContractParameters();
      parameters.contractAddress = "0xcontractaddress";
      parameters.abi = mockAbi;
      parameters.functionName = "testWrite";
      parameters.args = [123];

      // Mock an error in the simulateTransaction function
      mockWalletClient.simulateTransaction = vi.fn().mockRejectedValue(new Error("Simulation failed"));

      const result = await service.simulateContract(
        mockWalletClient as RadiusWalletInterface,
        parameters
      );

      expect(result).toEqual({
        success: false,
        error: "Simulation failed: Error: Simulation failed"
      });
    });
  });
});
