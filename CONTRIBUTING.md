# Contributing to the Radius AI Agent Toolkit

Thank you for your interest in contributing to the Radius AI Agent Toolkit! This document provides guidelines and instructions for
contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Repository Structure](#repository-structure)
- [Core Design Principles](#core-design-principles)
- [Development Workflow](#development-workflow)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Documentation](#documentation)
- [Language-Specific Guidelines](#language-specific-guidelines)
- [Questions](#questions)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to
uphold this code. Please report unacceptable behavior to: [opensource@radiustech.xyz](mailto:opensource@radiustech.xyz).

## Repository Structure

The Radius AI Agent Toolkit is organized in a monorepo structure:

```bash
ai-agent-toolkit/
├── CONTRIBUTING.md          # This file
├── README.md                # Repository overview
├── python/                  # Python Toolkit package
│   ├── CONTRIBUTING.md      # Python-specific guidelines
│   └── README.md            # Python Toolkit documentation
└── typescript/              # TypeScript Toolkit package
    ├── CONTRIBUTING.md      # TypeScript-specific guidelines
    └── README.md            # TypeScript Toolkit documentation
```

Each package maintains its own:

- Build configuration
- Tests
- Documentation
- Contributing guidelines

## Core Design Principles

The Radius AI Agent Toolkit follows these core design principles:

### 1. Consistent Interface, Idiomatic Implementation

While the toolkits provide a consistent interface across languages, they implement these interfaces in ways that feel
natural to each language:

- **TypeScript package**: Leverages classes, async/await, and strong typing

Example of consistent interface with idiomatic implementation:

```typescript
// TypeScript
const client = await Client.New(url, withLogger(console.log))
```

### 2. Clear Error Handling

Each package follows language-specific best practices for error handling:

- TypeScript: Promise rejections and Error objects

### 4. Interface-Based Design

The packages use interfaces to define contracts between components, enabling:

- Easier testing through mocks
- Flexible implementations
- Clear API boundaries

### 5. Consistent Directory Structure

Both packages follow similar package/module organization:

- `core` / `radius_ai_agent_sdk`: Core functionality, client implementation, and foundational interfaces
- `adapters/`: Adapters for the most popular agentic AI frameworks (e.g. Vercel AI SDK, LangChain, etc.)
- `plugins/`: Modular extensions that add EVM-compatible functionality to agents (e.g. ERC20 token transfers, Uniswap swaps, etc.)
- `wallets/`: Integrations for popular EVM-compatible wallets

## Development Workflow

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ai-agent-toolkit.git`
3. Create a new branch: `git checkout -b my-feature`
4. Make your changes
5. Run tests and linting
6. Push to your fork and submit a pull request

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```plaintext
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation only
- `style:` Code style changes
- `refactor:` Non-bug-fixing code changes
- `test:` Test updates
- `chore:` Build process updates

## Pull Requests

1. Clear title following conventional commits
2. Detailed description of changes
3. Reference related issues
4. Update documentation
5. Add tests
6. Update CHANGELOG.md
7. Ensure CI checks pass

## Documentation

- Update README.md files
- Document public APIs
- Update CHANGELOG.md
- Include examples
- Follow language-specific documentation styles

## Language-Specific Guidelines

Please refer to the language-specific CONTRIBUTING.md files:

- [TypeScript Contributing Guide](typescript/CONTRIBUTING.md)

These guides contain:

- Setup instructions
- Testing requirements
- Style guidelines
- Tool configurations
- Language-specific patterns

## Questions?

If you have questions:

1. Check existing issues
2. Create a new issue with `question` label
3. Ask in your PR if you're working on code

Thank you for contributing to the Radius AI Agent Toolkit!
