# Contributing to the Radius TypeScript AI Agent Toolkit

This guide provides specific guidelines for contributing to the TypeScript AI Agent Toolkit.

## Development Setup

1. Install Node.js 20.12.2 or later
2. Install pnpm 9.14.2 or later
3. Clone the repository
4. Run `pnpm install`

## TypeScript-Specific Patterns

### Async Patterns

We use async/await consistently:

```typescript
class MyClass {
    static async New(url: string, ...opts: Option[]): Promise<MyClass> {
        // implementation
    }
}
```

### Type Safety

- Use strict TypeScript configuration
- Avoid `any` type
- Use branded types when appropriate
- Leverage union types for better type safety

### Class Structure

- Use static factory methods named `New`
- Implement interfaces explicitly
- Keep properties private when possible
- Use readonly when appropriate

Example:

```typescript
export class MyClass implements SomeInterface {
   private constructor(
           readonly foo: string,
           private readonly bar: number
   ) {}

   static async New(foo: string, bar: number): Promise<MyClass> {
      return new MyClass(foo, bar);
   }
}
```

### Method Arguments

- Use variadic arguments (...args) instead of arrays where possible
- When interfacing with underlying libraries that require arrays, convert variadic arguments internally
- Document when methods accept variable arguments

Example:

```typescript
// ✅ Use variadic arguments for optional parameters
async someFunc(foo: string, bar: Number, ...args: unknown[]): Promise<void>

// ❌ Avoid using arrays for optional parameters
async someFunc(foo: string, bar: Number, args: unknown[] = []): Promise<void>
```

### Code Organization

- Keep files focused and small
- Clear module exports
- Consistent import ordering
- Follow TypeScript project references

### Naming Conventions

- Use PascalCase for classes and interfaces
- Use camelCase for methods and properties
- Use UPPER_CASE for constants

## Quality Checks

Before submitting:

1. Run linter:

   ```bash
   pnpm lint
   ```

For convenience, you can fix all lint and formatting errors by running the cleanup script:

- On Windows: `cleanup.bat`
- On MacOS/Linux: `./cleanup.sh`

## Build System

We use tsup for building:

- Generates both ESM and CJS outputs
- Handles type definitions
- Manages source maps
- Optimizes production builds

## Dependencies

- Keep dependencies minimal
- Use peer dependencies appropriately
- Lock versions in package.json
- Document dependency purposes

## Common Patterns

### Async Factory Methods

Use static async factory methods:

```typescript
export class MyClass {
   private constructor(
           readonly foo: string,
           private readonly bar: number,
           private readonly options: Options = {}
   ) {}

   static async New(foo: string, bar: number, ...opts: Option[]): Promise<MyClass> {
      const options: Options = {};
      for (const opt of opts) {
         await opt(options);
      }
      return new MyClass(foo, bar, options);
   }
}
```

### Error Handling

Follow these principles:

- Use typed errors
- Provide meaningful error messages
- Handle async errors properly
- Use error subclasses when appropriate

Example:

```typescript
try {
   const result = await this.provider.send(tx);
   if (!result) {
      throw new Error('Transaction failed: no result returned');
   }
   return result;
} catch (error) {
   throw new Error(`Failed to send transaction: ${error instanceof Error ? error.message : String(error)}`);
}
```

### Interface Implementation

Implement interfaces explicitly:

```typescript
interface SomeInterface {
   someFunc(): Promise<string>;
}

export class MyImplementation implements SomeInterface {
   async someFunc(): Promise<string> {
      return 'result';
   }
}
```

## Documentation

- Update README.md
- Include TSDoc comments
- Maintain CHANGELOG.md
- Document breaking changes
- Include usage examples

## Type Definitions

- Export public types
- Use precise types when possible
- Document complex types
- Use utility types appropriately
