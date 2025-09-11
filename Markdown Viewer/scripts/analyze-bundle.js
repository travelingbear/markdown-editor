/**
 * Bundle Analysis Script - Phase 4 Optimization
 * Measures CSS file sizes and reports optimization results
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

function analyzeBundle() {
  const srcPath = path.join(__dirname, '..', 'src');
  const stylesPath = path.join(srcPath, 'styles.css');
  
  // Main CSS file
  const mainSize = getFileSize(stylesPath);
  const mainLines = countLines(stylesPath);
  
  // Theme files
  const themesPath = path.join(srcPath, 'styles', 'themes');
  const themeFiles = ['dark.css', 'retro.css', 'contrast.css'];
  let totalThemeSize = 0;
  let totalThemeLines = 0;
  
  console.log('📊 CSS Bundle Analysis - Phase 4 Results\n');
  console.log('=' .repeat(50));
  
  console.log('\n🎯 Core CSS File:');
  console.log(`   styles.css: ${formatBytes(mainSize)} (${mainLines} lines)`);
  
  console.log('\n🎨 Theme Files (Dynamic Loading):');
  themeFiles.forEach(file => {
    const filePath = path.join(themesPath, file);
    const size = getFileSize(filePath);
    const lines = countLines(filePath);
    totalThemeSize += size;
    totalThemeLines += lines;
    
    if (size > 0) {
      console.log(`   ${file}: ${formatBytes(size)} (${lines} lines)`);
    } else {
      console.log(`   ${file}: Not found`);
    }
  });
  
  // Feature files
  const featuresPath = path.join(srcPath, 'styles', 'features');
  const featureFiles = ['markdown-toolbar.css', 'settings-modal.css', 'tab-system.css'];
  let totalFeatureSize = 0;
  let totalFeatureLines = 0;
  
  console.log('\n🔧 Feature Files (Dynamic Loading):');
  featureFiles.forEach(file => {
    const filePath = path.join(featuresPath, file);
    const size = getFileSize(filePath);
    const lines = countLines(filePath);
    totalFeatureSize += size;
    totalFeatureLines += lines;
    
    if (size > 0) {
      console.log(`   ${file}: ${formatBytes(size)} (${lines} lines)`);
    } else {
      console.log(`   ${file}: Not found`);
    }
  });
  
  // Utility files
  const utilitiesPath = path.join(srcPath, 'styles', 'utilities');
  const printSize = getFileSize(path.join(utilitiesPath, 'print.css'));
  const printLines = countLines(path.join(utilitiesPath, 'print.css'));
  
  console.log('\n🛠️ Utility Files (Dynamic Loading):');
  if (printSize > 0) {
    console.log(`   print.css: ${formatBytes(printSize)} (${printLines} lines)`);
  } else {
    console.log(`   print.css: Not found`);
  }
  
  // Summary
  const totalDynamicSize = totalThemeSize + totalFeatureSize + printSize;
  const totalDynamicLines = totalThemeLines + totalFeatureLines + printLines;
  const totalSize = mainSize + totalDynamicSize;
  const totalLines = mainLines + totalDynamicLines;
  
  console.log('\n' + '=' .repeat(50));
  console.log('📈 Summary:');
  console.log(`   Core CSS (always loaded): ${formatBytes(mainSize)} (${mainLines} lines)`);
  console.log(`   Dynamic CSS (on-demand): ${formatBytes(totalDynamicSize)} (${totalDynamicLines} lines)`);
  console.log(`   Total CSS: ${formatBytes(totalSize)} (${totalLines} lines)`);
  
  // Performance benefits
  const corePercentage = ((mainSize / totalSize) * 100).toFixed(1);
  const dynamicPercentage = ((totalDynamicSize / totalSize) * 100).toFixed(1);
  
  console.log('\n🚀 Performance Benefits:');
  console.log(`   Initial load: ${corePercentage}% of total CSS`);
  console.log(`   On-demand loading: ${dynamicPercentage}% of total CSS`);
  console.log(`   Memory savings: Themes and features only load when needed`);
  
  // Estimated before/after (assuming original was ~3000 lines)
  const estimatedOriginalLines = 3000;
  const reductionPercentage = ((estimatedOriginalLines - mainLines) / estimatedOriginalLines * 100).toFixed(1);
  
  console.log('\n📊 Estimated Improvements:');
  console.log(`   Core CSS reduction: ~${reductionPercentage}% (from ~${estimatedOriginalLines} to ${mainLines} lines)`);
  console.log(`   Faster initial load: Only core styles loaded upfront`);
  console.log(`   Better maintainability: Modular CSS architecture`);
  
  console.log('\n' + '=' .repeat(50));
}

// Run analysis
analyzeBundle();