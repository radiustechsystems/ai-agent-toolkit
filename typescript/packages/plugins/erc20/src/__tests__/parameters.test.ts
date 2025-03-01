import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
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
} from "../parameters";

// Mock createToolParameters
vi.mock("@radiustechsystems/ai-agent-core", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createToolParameters: (schema: z.ZodObject<any>) => {
    return class {
      static schema = schema;
    };
  },
}));

describe("ERC20 Parameters", () => {
  describe("GetTokenInfoBySymbolParameters", () => {
    test("should be properly defined", () => {
      expect(GetTokenInfoBySymbolParameters).toBeDefined();
      const params = new GetTokenInfoBySymbolParameters();
      expect(params).toBeInstanceOf(GetTokenInfoBySymbolParameters);
      expect(GetTokenInfoBySymbolParameters.schema).toBeDefined();
    });

    test("should have the correct shape", () => {
      const schema = GetTokenInfoBySymbolParameters.schema;
      expect(schema.shape.symbol).toBeDefined();
    });
  });

  describe("GetTokenBalanceParameters", () => {
    test("should be properly defined", () => {
      expect(GetTokenBalanceParameters).toBeDefined();
      const params = new GetTokenBalanceParameters();
      expect(params).toBeInstanceOf(GetTokenBalanceParameters);
      expect(GetTokenBalanceParameters.schema).toBeDefined();
    });

    test("should have the correct shape", () => {
      const schema = GetTokenBalanceParameters.schema;
      expect(schema.shape.wallet).toBeDefined();
      expect(schema.shape.tokenAddress).toBeDefined();
      expect(schema.shape.decimals).toBeDefined();
    });
  });

  describe("TransferParameters", () => {
    test("should be properly defined", () => {
      expect(TransferParameters).toBeDefined();
      const params = new TransferParameters();
      expect(params).toBeInstanceOf(TransferParameters);
      expect(TransferParameters.schema).toBeDefined();
    });

    test("should have the correct shape", () => {
      const schema = TransferParameters.schema;
      expect(schema.shape.tokenAddress).toBeDefined();
      expect(schema.shape.to).toBeDefined();
      expect(schema.shape.amount).toBeDefined();
      expect(schema.shape.formatAmount).toBeDefined();
      expect(schema.shape.decimals).toBeDefined();
    });
  });

  describe("ConvertToBaseUnitParameters", () => {
    test("should be properly defined", () => {
      expect(ConvertToBaseUnitParameters).toBeDefined();
      const params = new ConvertToBaseUnitParameters();
      expect(params).toBeInstanceOf(ConvertToBaseUnitParameters);
      expect(ConvertToBaseUnitParameters.schema).toBeDefined();
    });

    test("should have the correct shape", () => {
      const schema = ConvertToBaseUnitParameters.schema;
      expect(schema.shape.amount).toBeDefined();
      expect(schema.shape.decimals).toBeDefined();
    });
  });

  // Similar tests for other parameter classes
  describe("Other Parameter Classes", () => {
    test("should all be properly defined", () => {
      expect(ConvertFromBaseUnitParameters).toBeDefined();
      expect(GetTokenTotalSupplyParameters).toBeDefined();
      expect(GetTokenAllowanceParameters).toBeDefined();
      expect(ApproveParameters).toBeDefined();
      expect(RevokeApprovalParameters).toBeDefined();
      expect(TransferFromParameters).toBeDefined();
    });
  });
});
