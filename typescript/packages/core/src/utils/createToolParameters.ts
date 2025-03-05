import type { z } from 'zod';

export type ToolParametersStatic<T extends z.ZodSchema> = {
  new (): z.infer<T>;
  schema: T;
};

export function createToolParameters<T extends z.ZodSchema>(schema: T): ToolParametersStatic<T> {
  // Create a function/constructor with a static schema property
  const SchemaHolder = function (this: unknown) {} as unknown as ToolParametersStatic<T>;
  // Add the schema property
  SchemaHolder.schema = schema;

  return SchemaHolder;
}
