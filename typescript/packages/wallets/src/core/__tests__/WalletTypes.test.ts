import { describe, expect, test, vi } from 'vitest';
import type {
  Abi,
  AbiItem,
  BalanceInfo,
  RadiusReadRequest,
  RadiusReadResult,
  RadiusTransaction,
  RadiusTypedData,
  RadiusWalletConfig,
  RadiusWalletOptions,
  TransactionDetails,
  TransactionSimulationResult,
} from '../WalletTypes';

describe('Type Definitions', () => {
  test('AbiItem type is correctly defined', () => {
    // Type checking test (compile-time)
    const abiItem: AbiItem = {
      name: 'transfer',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
    };

    // Runtime checks
    expect(abiItem.name).toBe('transfer');
    expect(abiItem.type).toBe('function');
    expect(abiItem.inputs?.length).toBe(2);
  });

  test('Abi type is correctly defined', () => {
    const abi: Abi = [
      {
        name: 'transfer',
        type: 'function',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
      {
        name: 'Transfer',
        type: 'event',
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
        ],
      },
    ];

    expect(Array.isArray(abi)).toBe(true);
    expect(abi.length).toBe(2);
    expect(abi[0].name).toBe('transfer');
    expect(abi[1].type).toBe('event');
  });

  test('RadiusTransaction type is correctly defined', () => {
    const tx: RadiusTransaction = {
      to: '0xrecipient',
      value: BigInt(1000000000000000000),
      gasLimit: BigInt(21000),
      simulate: false,
    };

    expect(tx.to).toBe('0xrecipient');
    expect(tx.value).toBe(BigInt(1000000000000000000));

    // With contract call
    const contractTx: RadiusTransaction = {
      to: '0xcontract',
      functionName: 'transfer',
      args: ['0xrecipient', BigInt(1000)],
      abi: [{ type: 'function', name: 'transfer', inputs: [], outputs: [] }],
    };

    expect(contractTx.functionName).toBe('transfer');
    expect(contractTx.args?.length).toBe(2);
  });

  test('RadiusWalletOptions type is correctly defined', () => {
    const options: RadiusWalletOptions = {
      enableBatchTransactions: true,
      logger: vi.fn(),
      enableENS: true,
      enableTransactionMonitoring: true,
      transactionTimeout: 60000,
      confirmations: 2,
      enableGasEstimation: true,
      gasMultiplier: 1.5,
      enableCaching: true,
      maxCacheAge: 60000,
    };

    expect(options.enableBatchTransactions).toBe(true);
    expect(options.enableENS).toBe(true);
    expect(typeof options.logger).toBe('function');
  });

  test('RadiusWalletConfig type is correctly defined', () => {
    const config: RadiusWalletConfig = {
      rpcUrl: 'https://rpc.radius.dev',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    };

    expect(config.rpcUrl).toBe('https://rpc.radius.dev');
    expect(config.privateKey).toMatch(/^0x[0-9a-f]{64}$/);
  });

  test('BalanceInfo type is correctly defined', () => {
    const balance: BalanceInfo = {
      value: '1.5',
      decimals: 18,
      symbol: 'ETH',
      name: 'Ether',
      inBaseUnits: '1500000000000000000',
    };

    expect(balance.value).toBe('1.5');
    expect(balance.decimals).toBe(18);
    expect(balance.symbol).toBe('ETH');
  });

  test('RadiusReadRequest type is correctly defined', () => {
    const request: RadiusReadRequest = {
      address: '0xcontract',
      functionName: 'balanceOf',
      args: ['0xuser'],
      abi: [
        {
          type: 'function',
          name: 'balanceOf',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [],
        },
      ],
    };

    expect(request.address).toBe('0xcontract');
    expect(request.functionName).toBe('balanceOf');
    expect(request.args?.length).toBe(1);
  });

  test('RadiusReadResult type is correctly defined', () => {
    const successResult: RadiusReadResult = {
      value: BigInt(1000),
      success: true,
    };

    expect(successResult.success).toBe(true);
    expect(successResult.value).toBe(BigInt(1000));

    const errorResult: RadiusReadResult = {
      value: null,
      success: false,
      error: 'Contract execution reverted',
    };

    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBe('Contract execution reverted');
  });

  test('TransactionDetails type is correctly defined', () => {
    const details: TransactionDetails = {
      hash: '0xtxhash',
      blockNumber: 12345,
      status: 1,
      gasUsed: BigInt(21000),
      effectiveGasPrice: BigInt(20000000000),
      fee: BigInt(420000000000000),
      nonce: 5,
      timestamp: 1625097600,
    };

    expect(details.hash).toBe('0xtxhash');
    expect(details.status).toBe(1);
    expect(details.blockNumber).toBe(12345);
  });

  test('TransactionSimulationResult type is correctly defined', () => {
    const successSimulation: TransactionSimulationResult = {
      success: true,
      gasUsed: BigInt(21000),
      returnValue: '0x0000000000000000000000000000000000000000000000000000000000000001',
    };

    expect(successSimulation.success).toBe(true);
    expect(successSimulation.gasUsed).toBe(BigInt(21000));

    const failedSimulation: TransactionSimulationResult = {
      success: false,
      gasUsed: BigInt(0),
      error: 'Execution reverted: Insufficient funds',
    };

    expect(failedSimulation.success).toBe(false);
    expect(failedSimulation.error).toContain('Insufficient funds');
  });

  test('RadiusTypedData type is correctly defined', () => {
    const typedData: RadiusTypedData = {
      domain: {
        name: 'Radius Protocol',
        version: '1',
        chainId: 1223953,
        verifyingContract: '0xcontract',
      },
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
      },
      primaryType: 'Person',
      message: {
        name: 'Alice',
        wallet: '0xalice',
      },
    };

    expect(typedData.domain.name).toBe('Radius Protocol');
    expect(typedData.primaryType).toBe('Person');
    expect(typedData.message).toHaveProperty('name', 'Alice');
  });
});
