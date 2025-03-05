import type { z } from 'zod';

export type ToolParametersStatic<T extends z.ZodSchema> = {
  new (): z.infer<T>;
  schema: T;
};

export function createToolParameters<T extends z.ZodSchema>(schema: T) {
  // This class is used to hold the schema as a static property
  class SchemaHolder {
    static schema = schema;
  }
  return SchemaHolder as ToolParametersStatic<T>;
}
