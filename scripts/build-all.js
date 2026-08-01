#!/usr/bin/env node

/**
 * Cross-platform build script for Bait El-Hakma
 * 
 * Usage:
 *   node scripts/build-all.js [platform]
 * 
 * Platforms:
 *   win     - Build Windows NSIS installer + portable
 *   linux   - Build Linux AppImage, deb, rpm, tar.gz
 *   mac     - Build macOS DMG + zip (universal)
 *   all     - Build for all platforms
 *   current - Build for current platform only
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const platform = process.argv[2] || 'current';

console.log('\n╔══════════════════════════════════════════╗');
console.log('║    Bait El-Hakma - Build System          ║');
console.log('╚══════════════════════════════════════════╝\n');

// Ensure build/icons directory exists
const iconsDir = join(ROOT, 'build', 'icons');
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
  console.log('Created build/icons directory');
}

// Copy icon if not present
const iconSource = join(ROOT, 'public', 'img', 'bait-el-hakma logo.png');
const iconDest = join(iconsDir, 'icon.png');
if (existsSync(iconSource) && !existsSync(iconDest)) {
  copyFileSync(iconSource, iconDest);
  console.log('Copied icon to build/icons/icon.png');
}

function runBuild(command, description) {
  console.log(`\n📦 ${description}...`);
  console.log(`   Command: ${command}\n`);
  
  try {
    execSync(command, { 
      cwd: ROOT, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log(`\n✅ ${description} - Success!\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${description} - Failed!\n`);
    return false;
  }
}

const results = {
  win: false,
  linux: false,
  mac: false
};

switch (platform) {
  case 'win':
    results.win = runBuild('npx vite build && npx electron-builder --win', 'Building Windows (NSIS + Portable)');
    break;

  case 'linux':
    results.linux = runBuild('npx vite build && npx electron-builder --linux', 'Building Linux (AppImage + deb + rpm + tar.gz)');
    break;

  case 'mac':
    results.mac = runBuild('npx vite build && npx electron-builder --mac', 'Building macOS (DMG + ZIP, Universal)');
    break;

  case 'all':
    console.log('Building for all platforms...\n');
    results.win = runBuild('npx vite build && npx electron-builder --win', 'Building Windows');
    results.linux = runBuild('npx vite build && npx electron-builder --linux', 'Building Linux');
    results.mac = runBuild('npx vite build && npx electron-builder --mac', 'Building macOS');
    break;

  case 'current':
  default:
    const currentPlatform = process.platform;
    if (currentPlatform === 'win32') {
      results.win = runBuild('npx vite build && npx electron-builder --win', 'Building Windows (current platform)');
    } else if (currentPlatform === 'linux') {
      results.linux = runBuild('npx vite build && npx electron-builder --linux', 'Building Linux (current platform)');
    } else if (currentPlatform === 'darwin') {
      results.mac = runBuild('npx vite build && npx electron-builder --mac', 'Building macOS (current platform)');
    } else {
      console.error(`Unsupported platform: ${currentPlatform}`);
      process.exit(1);
    }
    break;
}

// Print summary
console.log('\n╔══════════════════════════════════════════╗');
console.log('║           Build Summary                  ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`  Windows: ${results.win ? '✅ Success' : '⏭️  Skipped'}`);
console.log(`  Linux:   ${results.linux ? '✅ Success' : '⏭️  Skipped'}`);
console.log(`  macOS:   ${results.mac ? '✅ Success' : '⏭️  Skipped'}`);
console.log('\nOutput directory: release/\n');

// Check if any build failed
if ((results.win === false && platform !== 'linux' && platform !== 'mac') ||
    (results.linux === false && platform !== 'win' && platform !== 'mac') ||
    (results.mac === false && platform !== 'win' && platform !== 'linux')) {
  // Only exit with error if a requested build failed
  if (platform === 'all') {
    process.exit(1);
  }
}
