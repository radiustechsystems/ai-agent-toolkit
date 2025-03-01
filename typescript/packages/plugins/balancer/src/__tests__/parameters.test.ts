import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import {
  LiquidityParameters,
  RemoveLiquidityParameters,
  SwapParameters,
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

describe("SwapParameters", () => {
  test("should be properly defined", () => {
    expect(SwapParameters).toBeDefined();
    const params = new SwapParameters();
    expect(params).toBeInstanceOf(SwapParameters);
    expect(SwapParameters.schema).toBeDefined();
  });

  test("should have the correct properties in schema", () => {
    const schema = SwapParameters.schema;
    expect(schema.shape.tokenIn).toBeDefined();
    expect(schema.shape.tokenOut).toBeDefined();
    expect(schema.shape.tokenInDecimals).toBeDefined();
    expect(schema.shape.tokenOutDecimals).toBeDefined();
    expect(schema.shape.amountIn).toBeDefined();
    expect(schema.shape.slippage).toBeDefined();
    expect(schema.shape.deadline).toBeDefined();
    expect(schema.shape.wethIsEth).toBeDefined();
  });
});

describe("LiquidityParameters", () => {
  test("should be properly defined", () => {
    expect(LiquidityParameters).toBeDefined();
    const params = new LiquidityParameters();
    expect(params).toBeInstanceOf(LiquidityParameters);
    expect(LiquidityParameters.schema).toBeDefined();
  });

  test("should have the correct properties in schema", () => {
    const schema = LiquidityParameters.schema;
    expect(schema.shape.pool).toBeDefined();
    expect(schema.shape.amounts).toBeDefined();
    expect(schema.shape.kind).toBeDefined();
    expect(schema.shape.slippage).toBeDefined();
    expect(schema.shape.deadline).toBeDefined();
    expect(schema.shape.wethIsEth).toBeDefined();
  });

  test("should have kind as an enum with correct values", () => {
    const kindSchema = LiquidityParameters.schema.shape.kind;
    // Check that it's an enum schema
    expect(kindSchema._def.typeName).toBe("ZodEnum");
    // Check that it has the correct values
    expect(kindSchema._def.values).toEqual(["Unbalanced", "Exact"]);
  });
});

describe("RemoveLiquidityParameters", () => {
  test("should be properly defined", () => {
    expect(RemoveLiquidityParameters).toBeDefined();
    const params = new RemoveLiquidityParameters();
    expect(params).toBeInstanceOf(RemoveLiquidityParameters);
    expect(RemoveLiquidityParameters.schema).toBeDefined();
  });

  test("should have the correct properties in schema", () => {
    const schema = RemoveLiquidityParameters.schema;
    expect(schema.shape.pool).toBeDefined();
    expect(schema.shape.bptAmountIn).toBeDefined();
    expect(schema.shape.kind).toBeDefined();
    expect(schema.shape.slippage).toBeDefined();
    expect(schema.shape.wethIsEth).toBeDefined();
  });

  test("should have kind as an enum with correct values", () => {
    const kindSchema = RemoveLiquidityParameters.schema.shape.kind;
    // Check that it's an enum schema
    expect(kindSchema._def.typeName).toBe("ZodEnum");
    // Check that it has the correct values
    expect(kindSchema._def.values).toEqual(["Proportional", "Single"]);
  });
});
