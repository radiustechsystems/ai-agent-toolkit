import { describe, test, expect, vi, beforeEach } from "vitest";
import { createRadiusWallet } from "../radius-wallet-client";
import { radiusTestnetBase } from "../radius-chain";

// Mock the SDK components
vi.mock("@radiustechsystems/sdk", () => {
  return {
    Client: {
      New: vi.fn().mockImplementation((rpcUrl, ...options) => {
        return {
          getChainId: vi.fn().mockResolvedValue(radiusTestnetBase.id),
          getBalance: vi.fn().mockResolvedValue(BigInt(1000000000000000000)), // 1 ETH
          send: vi.fn().mockResolvedValue({ hash: "0xmocktxhash" }),
          getTransactionReceipt: vi.fn().mockResolvedValue({
            blockNumber: 123,
            status: 1,
            gasUsed: BigInt(21000),
            effectiveGasPrice: BigInt(20000000000),
          }),
          getBlockNumber: vi.fn().mockResolvedValue(125),
          estimateGas: vi.fn().mockResolvedValue(BigInt(21000)),
          getGasPrice: vi.fn().mockResolvedValue(BigInt(20000000000)),
        };
      })
    },
    Account: {
      New: vi.fn().mockImplementation((options) => {
        return {
          address: {
            toHex: vi.fn().mockReturnValue("0xmockaddress"),
          },
          signMessage: vi.fn().mockResolvedValue("0xmocksignature"),
        };
      })
    },
    Address: vi.fn().mockImplementation((address) => {
      return {
        toHex: vi.fn().mockReturnValue(address),
      };
    }),
    Contract: {
      NewDeployed: vi.fn().mockImplementation((abi, address) => {
        return {
          execute: vi.fn().mockResolvedValue({ hash: "0xmockcontracttxhash" }),
          call: vi.fn().mockResolvedValue("mockCallResult"),
          estimateGas: vi.fn().mockResolvedValue(BigInt(50000)),
        };
      })
    },
    ABI: vi.fn().mockImplementation((abiJson) => {
      return { abiJson };
    }),
    withPrivateKey: vi.fn().mockImplementation((privateKey, client) => {
      return { privateKey, client };
    }),
    withLogger: vi.fn().mockImplementation((logger) => {
      return { logger };
    })
  };
});

describe("RadiusWalletClient", () => {
  const mockRpcUrl = "https://mock-rpc.radius.dev";
  const mockPrivateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const mockLogger = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test("creates a wallet instance correctly", async () => {
    const wallet = await createRadiusWallet(
      { rpcUrl: mockRpcUrl, privateKey: mockPrivateKey },
      false,
      mockLogger
    );
    
    expect(wallet).toBeDefined();
    expect(wallet.getAddress()).toBe("0xmockaddress");
    expect(wallet.getChain()).toEqual({
      type: "evm",
      id: radiusTestnetBase.id,
    });
  });
  
  test("sends a transaction correctly", async () => {
    const wallet = await createRadiusWallet(
      { rpcUrl: mockRpcUrl, privateKey: mockPrivateKey },
      false,
      mockLogger
    );
    
    const result = await wallet.sendTransaction({
      to: "0xrecipient",
      value: BigInt(100000000000000000) // 0.1 ETH
    });
    
    expect(result).toEqual({ hash: "0xmocktxhash" });
  });
  
  test("resolves addresses correctly", async () => {
    const wallet = await createRadiusWallet(
      { rpcUrl: mockRpcUrl, privateKey: mockPrivateKey }
    );
    
    // Should handle hex addresses
    const resolved = await wallet.resolveAddress("0x1234567890123456789012345678901234567890");
    expect(resolved).toBe("0x1234567890123456789012345678901234567890");
    
    // Should reject non-hex addresses
    await expect(wallet.resolveAddress("not-an-address")).rejects.toThrow();
  });
  
  test("signs messages correctly", async () => {
    const wallet = await createRadiusWallet(
      { rpcUrl: mockRpcUrl, privateKey: mockPrivateKey }
    );
    
    const signature = await wallet.signMessage("Hello, world!");
    expect(signature).toEqual({ signature: "0xmocksignature" });
  });
  
  test("reads contract data correctly", async () => {
    const wallet = await createRadiusWallet(
      { rpcUrl: mockRpcUrl, privateKey: mockPrivateKey }
    );
    
    const result = await wallet.read({
      address: "0xcontract",
      functionName: "balanceOf",
      args: ["0xuser"],
      abi: [{
        name: "balanceOf",
        type: "function",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "balance", type: "uint256" }]
      }]
    });
    
    expect(result).toEqual({ value: "mockCallResult" });
  });
  
  test("gets balance correctly", async () => {
    const wallet = await createRadiusWallet(
      { rpcUrl: mockRpcUrl, privateKey: mockPrivateKey }
    );
    
    const balance = await wallet.balanceOf("0xuser");
    
    expect(balance).toEqual({
      value: "1",
      decimals: 18,
      symbol: radiusTestnetBase.nativeCurrency.symbol,
      name: radiusTestnetBase.nativeCurrency.name,
      inBaseUnits: "1000000000000000000",
    });
  });
});