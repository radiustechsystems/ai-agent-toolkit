#!/usr/bin/env node

/**
 * This script replaces all "workspace:*" references in package.json dependencies 
 * with the actual version number of the package before publishing.
 * 
 * It processes the current package.json and can optionally process all packages
 * in the workspace.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Process all packages in workspace when --all flag is provided
const processAllPackages = process.argv.includes('--all');

// Get the version of all packages
const packagesVersions = {};

/**
 * Replace workspace references in package.json with actual versions
 */
function replaceWorkspaceReferences(packageJsonPath) {
  console.log(`Processing ${packageJsonPath}`);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const { name, version } = packageJson;
  
  // Store version for reference by other packages
  if (name) {
    packagesVersions[name] = version;
  }

  let hasWorkspaceDeps = false;
  const sections = ['dependencies', 'peerDependencies', 'devDependencies', 'optionalDependencies'];
  
  // Process each dependency section
  sections.forEach(section => {
    if (packageJson[section]) {
      Object.keys(packageJson[section]).forEach(dep => {
        if (packageJson[section][dep] === 'workspace:*') {
          // Get the version from package mappings or use this package's version
          const depVersion = packagesVersions[dep] || version;
          console.log(`Replacing workspace:* reference for ${dep} with version ${depVersion} in ${section}`);
          packageJson[section][dep] = depVersion;
          hasWorkspaceDeps = true;
        }
      });
    }
  });

  if (hasWorkspaceDeps) {
    // Write the updated package.json back to disk
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated ${packageJsonPath} with resolved workspace references`);
  }
  
  return { name, version };
}

// Get list of all package.json files in the workspace
function findAllPackageJsonFiles() {
  // First, locate the workspace root
  const workspaceRoot = path.resolve(process.cwd(), '.');
  
  // Define packages directory based on pnpm workspace structure
  const packagesDir = path.join(workspaceRoot, 'packages');
  
  const packageJsonFiles = [];
  
  // Find all package.json files in packages directory
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

// Main execution
async function main() {
  if (processAllPackages) {
    console.log('Processing all packages in workspace');
    
    // First pass: collect version information from all packages
    const packageJsonFiles = findAllPackageJsonFiles();
    
    packageJsonFiles.forEach(packageJsonPath => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.name && packageJson.version) {
        packagesVersions[packageJson.name] = packageJson.version;
      }
    });
    
    console.log('Collected versions:', packagesVersions);
    
    // Second pass: replace workspace references
    packageJsonFiles.forEach(packageJsonPath => {
      replaceWorkspaceReferences(packageJsonPath);
    });
    
    // Process the root package.json last
    const rootPackageJsonPath = path.resolve(process.cwd(), 'package.json');
    replaceWorkspaceReferences(rootPackageJsonPath);
  } else {
    // Just process the current package
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    replaceWorkspaceReferences(packageJsonPath);
  }
}

main().catch(error => {
  console.error('Error processing workspace references:', error);
  process.exit(1);
});