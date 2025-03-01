import { createToolParameters } from "@radiustechsystems/ai-agent-core";
import { z } from "zod";

/**
 * Parameters for crypto-related tools
 * Note: Only includes parameters for methods that can be reliably implemented
 */
export class ValidateAddressParameters extends createToolParameters(
  z.object({
    address: z.string().describe("The address to validate")
  }),
) {}
