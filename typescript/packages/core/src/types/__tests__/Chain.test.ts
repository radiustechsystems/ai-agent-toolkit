import { describe, expect, test } from 'vitest';
import type { Chain, ChainType, RadiusChain } from '../Chain';

describe('Chain types', () => {
  test('should validate correct RadiusChain objects', () => {
    const validChain: RadiusChain = {
      type: 'evm',
      id: 123,
    };

    // Type check - if this compiles, the test passes
    const chainVar: Chain = validChain;

    // Runtime check
    expect(chainVar.type).toBe('evm');
    expect(chainVar.id).toBe(123);
  });

  test('should work with numeric chain IDs', () => {
    const chain: RadiusChain = {
      type: 'evm',
      id: 1,
    };

    expect(chain.id).toBe(1);
  });

  test('should define ChainType as the type property', () => {
    // Type check - this would fail to compile if ChainType wasn't defined correctly
    const chainType: ChainType = 'evm';

    expect(chainType).toBe('evm');
  });

  test('should validate Chain interface at runtime', () => {
    // Runtime check for type safety
    function isValidChain(obj: unknown): obj is Chain {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        'type' in obj &&
        'id' in obj &&
        (obj as { type: string }).type === 'evm' &&
        typeof (obj as { id: unknown }).id === 'number'
      );
    }

    expect(isValidChain({ type: 'evm', id: 1 })).toBe(true);
    expect(isValidChain({ type: 'other', id: 1 })).toBe(false);
    expect(isValidChain({ type: 'evm', id: '1' })).toBe(false);
    expect(isValidChain({})).toBe(false);
    expect(isValidChain(null)).toBe(false);
  });
});
