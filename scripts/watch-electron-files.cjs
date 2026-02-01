#!/usr/bin/env node

/**
 * 监听 dist-electron 目录中的 .js 文件变化，自动重命名为 .cjs
 * 用于开发模式下的 watch 功能
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist-electron');
const filesToWatch = ['main.js', 'preload.js'];

function renameFile(file) {
  const srcPath = path.join(distDir, file);
  const dstPath = path.join(distDir, file.replace('.js', '.cjs'));
  
  if (fs.existsSync(srcPath)) {
    try {
      // 如果目标文件已存在，先删除
      if (fs.existsSync(dstPath)) {
        fs.unlinkSync(dstPath);
      }
      fs.renameSync(srcPath, dstPath);
      console.log(`[watch] ✓ Renamed ${file} → ${file.replace('.js', '.cjs')}`);
    } catch (error) {
      console.error(`[watch] ✗ Failed to rename ${file}:`, error.message);
    }
  }
}

// 初始重命名
filesToWatch.forEach(renameFile);

// 监听目录变化
if (fs.existsSync(distDir)) {
  console.log(`[watch] Watching ${distDir} for changes...`);
  
  fs.watch(distDir, { recursive: false }, (eventType, filename) => {
    if (filename && filesToWatch.includes(filename)) {
      // 延迟一下，确保文件写入完成
      setTimeout(() => renameFile(filename), 100);
    }
  });
} else {
  console.warn(`[watch] Directory not found: ${distDir}`);
}
