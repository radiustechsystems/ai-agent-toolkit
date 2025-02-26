#!/bin/bash
set -e

echo "Running cleanup for all Radius AI Agent Toolkit packages..."

echo -e "\nRunning TypeScript AI Agent Toolkit cleanup..."
cd typescript
./cleanup.sh
cd ..

echo -e "\nAll Radius AI Agent Toolkit checks completed successfully!"
