#!/usr/bin/env node

/**
 * 将 Electron 编译后的 .js 文件重命名为 .cjs
 * 因为 package.json 中设置了 "type": "module"，
 * 而 Electron 主进程使用 CommonJS，需要 .cjs 扩展名
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist-electron');
const filesToRename = ['main.js', 'preload.js'];

filesToRename.forEach(file => {
  const srcPath = path.join(distDir, file);
  const dstPath = path.join(distDir, file.replace('.js', '.cjs'));
  
  if (fs.existsSync(srcPath)) {
    try {
      fs.renameSync(srcPath, dstPath);
      console.log(`✓ Renamed ${file} → ${file.replace('.js', '.cjs')}`);
    } catch (error) {
      console.error(`✗ Failed to rename ${file}:`, error.message);
      process.exit(1);
    }
  } else {
    console.warn(`⚠ File not found: ${srcPath}`);
  }
});
