import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { addParametersToDescription } from '../addParametersToDescription';

describe('addParametersToDescription', () => {
  test('should add parameter information to description', () => {
    const schema = z.object({
      name: z.string().describe("User's name"),
      age: z.number().describe("User's age"),
    });

    const description = 'Get user information';
    const result = addParametersToDescription(description, schema);

    expect(result).toContain(description);
    expect(result).toContain("- name (string): User's name");
    expect(result).toContain("- age (number): User's age");
  });

  test('should handle optional parameters', () => {
    const schema = z.object({
      required: z.string().describe('Required parameter'),
      optional: z.string().optional().describe('Optional parameter'),
    });

    const result = addParametersToDescription('Test', schema);

    expect(result).toContain('- required (string): Required parameter');
    expect(result).toContain('- optional (optional) (string): Optional parameter');
  });

  test('should handle empty parameter descriptions', () => {
    const schema = z.object({
      noDescription: z.string(),
    });

    const result = addParametersToDescription('Test', schema);

    expect(result).toContain('- noDescription (string):');
  });

  test('should handle various parameter types', () => {
    const schema = z.object({
      string: z.string().describe('String param'),
      number: z.number().describe('Number param'),
      boolean: z.boolean().describe('Boolean param'),
      array: z.array(z.string()).describe('Array param'),
      object: z.object({ key: z.string() }).describe('Object param'),
    });

    const result = addParametersToDescription('Test', schema);

    expect(result).toContain('- string (string): String param');
    expect(result).toContain('- number (number): Number param');
    expect(result).toContain('- boolean (boolean): Boolean param');
    expect(result).toContain('- array (array): Array param');
    expect(result).toContain('- object (object): Object param');
  });

  test('should return original description if schema is not an object', () => {
    const schema = z.string();
    const description = 'Test description';

    const result = addParametersToDescription(description, schema);

    // Should contain just the description and a newline
    expect(result).toBe('Test description\n');
  });

  test('should handle nested optional types', () => {
    const schema = z.object({
      nested: z.optional(z.string()).describe('Nested optional'),
    });

    const result = addParametersToDescription('Test', schema);

    expect(result).toContain('- nested (optional) (string): Nested optional');
  });
});
