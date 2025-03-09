#!/usr/bin/env node

/**
 * This script adds a prepublishOnly script to all package.json files in the packages directory.
 * The script points to the replace-workspace-refs.js script to ensure workspace references are replaced
 * before publishing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Find all package.json files in packages directory
function findAllPackageJsonFiles() {
  const workspaceRoot = path.resolve(__dirname, '..');
  const packagesDir = path.join(workspaceRoot, 'packages');
  const packageJsonFiles = [];
  
  function findPackageJsonFilesRecursive(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
        // Check if this directory has a package.json
        const packageJsonPath = path.join(itemPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          packageJsonFiles.push(packageJsonPath);
        }
        
        // Continue recursively searching
        findPackageJsonFilesRecursive(itemPath);
      }
    }
  }
  
  if (fs.existsSync(packagesDir)) {
    findPackageJsonFilesRecursive(packagesDir);
  }
  
  return packageJsonFiles;
}

// Add prepublishOnly script to package.json
function addPrepublishScript(packageJsonPath) {
  console.log(`Processing ${packageJsonPath}`);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  // Calculate relative path to scripts directory
  const packageDir = path.dirname(packageJsonPath);
  const scriptPath = path.relative(packageDir, path.resolve(__dirname, 'replace-workspace-refs.js'));
  
  // Add prepublishOnly script
  packageJson.scripts.prepublishOnly = `node ${scriptPath}`;
  
  console.log(`Adding prepublishOnly script to ${packageJsonPath}`);
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

// Main execution
function main() {
  console.log('Adding prepublishOnly scripts to all packages');
  
  const packageJsonFiles = findAllPackageJsonFiles();
  
  for (const packageJsonPath of packageJsonFiles) {
    addPrepublishScript(packageJsonPath);
  }
  
  console.log(`Updated ${packageJsonFiles.length} package.json files`);
}

main();