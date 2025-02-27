import { EVMWalletClient } from "./evm-wallet-client";
import type { EVMTransaction } from "./types";

export abstract class EVMSmartWalletClient extends EVMWalletClient {
    abstract sendBatchOfTransactions(transactions: EVMTransaction[]): Promise<{ hash: string }>;

    async sendTransaction(transaction: EVMTransaction): Promise<{ hash: string }> {
      // For smart wallets, we implement the single transaction case
      // as a batch of one transaction
      return this.sendBatchOfTransactions([transaction]);
    }
}
