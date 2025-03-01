import { createToolParameters } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

export class GenerateHashParameters extends createToolParameters(
  z.object({
    data: z.string().describe("The data to hash"),
    encoding: z
      .enum(["utf8", "hex"])
      .optional()
      .describe("The encoding of the input data (default: utf8)")
  }),
) {}

export class VerifySignatureParameters extends createToolParameters(
  z.object({
    message: z.string().describe("The original message that was signed"),
    signature: z.string().describe("The signature to verify"),
    address: z.string().describe("The address that supposedly signed the message"),
    isHashed: z
      .boolean()
      .optional()
      .describe("Whether the message is already hashed (default: false)")
  }),
) {}

export class RecoverAddressParameters extends createToolParameters(
  z.object({
    message: z.string().describe("The original message that was signed"),
    signature: z.string().describe("The signature to recover the address from"),
    isHashed: z
      .boolean()
      .optional()
      .describe("Whether the message is already hashed (default: false)")
  }),
) {}

export class ValidateAddressParameters extends createToolParameters(
  z.object({
    address: z.string().describe("The address to validate")
  }),
) {}

export class FormatAddressParameters extends createToolParameters(
  z.object({
    address: z.string().describe("The address to format"),
    format: z
      .enum(["checksum", "lowercase"])
      .describe("The desired format for the address")
  }),
) {}

export class HashMessageParameters extends createToolParameters(
  z.object({
    message: z.string().describe("The message to hash according to EIP-191"),
    encoding: z
      .enum(["utf8", "hex"])
      .optional()
      .describe("The encoding of the input message (default: utf8)")
  }),
) {}