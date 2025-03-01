import { describe, test, expect, vi, beforeEach } from "vitest";
import { EnsResolver, createEnsResolver } from "../ens-resolver";
import { AddressResolutionError } from "../../utils/errors";
import { WalletCache } from "../../utils/cache";

// Mock the SDK components
vi.mock("@radiustechsystems/sdk", () => {
  const mockContractInstances = new Map();
  
  // Mock contract for ENS Registry
  mockContractInstances.set("0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", {
    call: vi.fn().mockImplementation((client, method, nameHash) => {
      if (nameHash === "0x123hash") {
        return "0xresolveraddress";
      }
      return "0x0000000000000000000000000000000000000000";
    })
  });
  
  // Mock contract for ENS Resolver
  mockContractInstances.set("0xresolveraddress", {
    call: vi.fn().mockImplementation((client, method, nameHash) => {
      if (nameHash === "0x123hash") {
        return "0xresolvedaddress";
      }
      return "0x0000000000000000000000000000000000000000";
    })
  });
  
  return {
    Client: vi.fn(),
    Contract: {
      NewDeployed: vi.fn().mockImplementation((abi, address) => {
        return mockContractInstances.get(address) || {
          call: vi.fn().mockResolvedValue(null)
        };
      })
    },
    ABI: vi.fn(),
    Address: vi.fn().mockImplementation((address) => {
      return { address };
    })
  };
});

describe("EnsResolver", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  let resolver: EnsResolver;
  let mockCache: WalletCache;
  
  beforeEach(() => {
    mockClient = {};
    mockCache = new WalletCache(100);
      
    resolver = createEnsResolver(mockClient, undefined, mockCache);
  });
  
  test("should not resolve ENS names to addresses", async () => {
    await expect(resolver.resolveAddress("test.eth"))
      .rejects.toThrow(/Cannot resolve ENS name/);
  });
  
  test("should return lowercase hex address for valid addresses", async () => {
    const address = await resolver.resolveAddress("0x1234567890123456789012345678901234567890");
    expect(address).toBe("0x1234567890123456789012345678901234567890");
    
    const mixedCaseAddress = await resolver.resolveAddress("0x1234567890123456789012345678901234ABCDEF");
    expect(mixedCaseAddress).toBe("0x1234567890123456789012345678901234abcdef");
  });
  
  test("should use cached ENS addresses when available", async () => {
    const getSpy = vi.spyOn(mockCache, "get");
    
    // Simulate a cache hit for ENS name
    getSpy.mockReturnValue("0xcachedaddress");
    
    // Should use cached value and not throw
    const cachedAddress = await resolver.resolveAddress("test.eth");
    expect(cachedAddress).toBe("0xcachedaddress");
    expect(getSpy).toHaveBeenCalledWith("ens:test.eth");
  });
  
  test("should throw for invalid ENS names", async () => {
    await expect(resolver.resolveAddress("invalid.eth"))
      .rejects.toThrow(AddressResolutionError);
  });
  
  test("should throw for non-ENS and non-address strings", async () => {
    await expect(resolver.resolveAddress("not-an-address"))
      .rejects.toThrow(AddressResolutionError);
  });
  
  test("canResolve should only return true for hex addresses", async () => {
    // ENS names are no longer resolvable
    const canResolve = await resolver.canResolve("test.eth");
    expect(canResolve).toBe(false);
    
    // Hex addresses should still be resolvable
    const canResolveHex = await resolver.canResolve("0x1234567890123456789012345678901234567890");
    expect(canResolveHex).toBe(true);
  });
  
  test("canResolve should return false for non-resolvable addresses", async () => {
    const canResolve = await resolver.canResolve("invalid.eth");
    expect(canResolve).toBe(false);
    
    const canResolveInvalid = await resolver.canResolve("not-an-address");
    expect(canResolveInvalid).toBe(false);
  });
  
  test("createEnsResolver should return an EnsResolver instance", () => {
    const customRegistry = "0xcustomregistry";
    const resolver = createEnsResolver(mockClient, customRegistry, mockCache);
    
    expect(resolver).toBeInstanceOf(EnsResolver);
  });
});
