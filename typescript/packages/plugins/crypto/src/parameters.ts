import { createToolParameters } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

/**
 * Parameters for crypto-related tools
 */
export class ValidateAddressParameters extends createToolParameters(
  z.object({
    address: z.string().describe("The address to validate")
  }),
) {}

/**
 * Parameters for hashing data
 */
export class HashDataParameters extends createToolParameters(
  z.object({
    data: z.string().describe("The data to hash"),
    encoding: z.enum(["utf8", "hex"]).default("utf8").describe("The encoding of the input data")
  }),
) {}
