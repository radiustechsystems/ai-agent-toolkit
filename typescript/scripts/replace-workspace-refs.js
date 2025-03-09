#!/usr/bin/env node

/**
 * This script replaces all "workspace:*" references in package.json dependencies 
 * with the actual version number of the package before publishing.
 */

import fs from 'fs';
import path from 'path';

// Get the root package.json
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get the version
const { version } = packageJson;

// Update dependencies
if (packageJson.dependencies) {
  let hasWorkspaceDeps = false;
  Object.keys(packageJson.dependencies).forEach(dep => {
    if (packageJson.dependencies[dep] === 'workspace:*') {
      console.log(`Replacing workspace:* reference for ${dep} with version ${version}`);
      packageJson.dependencies[dep] = version;
      hasWorkspaceDeps = true;
    }
  });

  if (hasWorkspaceDeps) {
    // Write the updated package.json back to disk
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('Updated package.json with resolved workspace references');
  } else {
    console.log('No workspace references found in dependencies');
  }
}