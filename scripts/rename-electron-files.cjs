#!/usr/bin/env node

/**
 * 将 Electron 编译后的 .js 文件重命名为 .cjs
 * 因为 package.json 中设置了 "type": "module"，
 * 而 Electron 主进程使用 CommonJS，需要 .cjs 扩展名
 * 
 * 同时移除 const __dirname 声明，因为 CommonJS 中 __dirname 是全局可用的
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist-electron');
const filesToProcess = ['main.js', 'preload.js', 'main.cjs', 'preload.cjs'];

filesToProcess.forEach(file => {
  const filePath = path.join(distDir, file);
  
  if (fs.existsSync(filePath)) {
    try {
      // 读取文件内容
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 移除 const __dirname 声明（CommonJS 中 __dirname 是全局可用的）
      // 匹配多行的 const __dirname 声明
      const dirnamePattern = /const __dirname\s*=\s*[^;]+;/g;
      if (dirnamePattern.test(content)) {
        content = content.replace(dirnamePattern, '');
        modified = true;
      }
      
      // 如果是 .js 文件，重命名为 .cjs
      if (file.endsWith('.js')) {
        const dstPath = path.join(distDir, file.replace('.js', '.cjs'));
        fs.writeFileSync(dstPath, content, 'utf8');
        fs.unlinkSync(filePath);
        console.log(`✓ Renamed ${file} → ${file.replace('.js', '.cjs')}${modified ? ' (removed __dirname declaration)' : ''}`);
      } else if (modified) {
        // 如果是 .cjs 文件且已修改，直接写入
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated ${file} (removed __dirname declaration)`);
      }
    } catch (error) {
      console.error(`✗ Failed to process ${file}:`, error.message);
      process.exit(1);
    }
  }
});
