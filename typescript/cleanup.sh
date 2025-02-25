#!/bin/bash
set -e

echo "Running linting and formatting for TypeScript AI Agent Toolkit..."
echo "Running linting with fixes..."
pnpm lint:fix
echo "TypeScript AI Agent Toolkit checks completed successfully!"
