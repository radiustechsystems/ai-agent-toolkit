import { describe, test, expect } from "vitest";
import { RadiusWalletClient } from "../radius-wallet-client";

describe("RadiusWalletInterface", () => {
  // Since interfaces are TypeScript-only constructs and don't exist at runtime,
  // we should test that our implementation (RadiusWalletClient) correctly implements the interface
  
  test("RadiusWalletClient should implement RadiusWalletInterface", () => {
    // This is essentially a type test - if RadiusWalletClient implements all required
    // methods from RadiusWalletInterface, the code will compile
    
    // We just need to check that the implementation includes required methods
    const clientMethods = Object.getOwnPropertyNames(RadiusWalletClient.prototype);
    
    // Sample of methods that should be present from the interface
    expect(clientMethods).toContain("getChain");
    expect(clientMethods).toContain("sendTransaction");
    expect(clientMethods).toContain("resolveAddress");
    expect(clientMethods).toContain("balanceOf");
    expect(clientMethods).toContain("dispose");
  });
});