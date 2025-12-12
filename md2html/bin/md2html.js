#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const converter = require('../lib/converter');
const watcher = require('../lib/watcher');

program
  .name('md2html')
  .description('A cross-platform CLI tool to convert Markdown to HTML')
  .version('1.0.0');

program
  .argument('<source>', 'Path to the Markdown file or directory')
  .option('-o, --output <path>', 'Output directory for HTML files (default: ./dist)')
  .option('-w, --watch', 'Watch for changes and recompile automatically')
  .option('-s, --style <path>', 'Custom CSS file path')
  .action((source, options) => {
    const sourcePath = path.resolve(source);
    const outputDir = path.resolve(options.output || './dist');
    const customCssPath = options.style ? path.resolve(options.style) : null;

    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`Error: Source path "${source}" does not exist.`);
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Perform initial conversion
    console.log(`Converting ${fs.lstatSync(sourcePath).isDirectory() ? 'directory' : 'file'}: ${source}`);
    console.log(`Output directory: ${outputDir}`);

    converter.convert(sourcePath, outputDir, customCssPath);

    // Start watch mode if requested
    if (options.watch) {
      console.log('\nWatch mode enabled. Press Ctrl+C to exit.');
      watcher.watch(sourcePath, outputDir, customCssPath);
    }
  });

program.parse();
