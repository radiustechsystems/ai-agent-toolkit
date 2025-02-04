import type { ToolBase } from "../classes/ToolBase";
import type { WalletClientBase } from "../classes/WalletClientBase";

export type GetToolsParams<TWalletClient extends WalletClientBase> = {
  wallet: TWalletClient;
};

export function getTools<TWalletClient extends WalletClientBase>({
  wallet,
}: GetToolsParams<TWalletClient>): ToolBase[] {
  return wallet.getCoreTools();
}
