const chokidar = require('chokidar');
const path = require('path');
const converter = require('./converter');

/**
 * Watch a file or directory for changes
 * @param {string} sourcePath - Path to source file or directory
 * @param {string} outputDir - Output directory
 * @param {string|null} customCssPath - Path to custom CSS file
 */
function watch(sourcePath, outputDir, customCssPath = null) {
  const watcher = chokidar.watch(sourcePath, {
    ignored: /(^|[\/\\])\../, // Ignore hidden files
    persistent: true,
    ignoreInitial: true // Don't trigger on initial scan
  });

  // Add event listeners
  watcher
    .on('add', (filePath) => {
      if (path.extname(filePath) === '.md') {
        console.log(`\n✚ File added: ${path.relative(process.cwd(), filePath)}`);
        converter.convertFile(filePath, outputDir, customCssPath);
      }
    })
    .on('change', (filePath) => {
      if (path.extname(filePath) === '.md') {
        console.log(`\n✎ File changed: ${path.relative(process.cwd(), filePath)}`);
        converter.convertFile(filePath, outputDir, customCssPath);
      }
    })
    .on('unlink', (filePath) => {
      if (path.extname(filePath) === '.md') {
        const htmlFileName = path.basename(filePath, '.md') + '.html';
        const htmlPath = path.join(outputDir, htmlFileName);

        if (require('fs').existsSync(htmlPath)) {
          require('fs').unlinkSync(htmlPath);
          console.log(`\n✘ File removed: ${path.relative(process.cwd(), htmlPath)}`);
        }
      }
    })
    .on('error', (error) => {
      console.error(`\n✗ Watcher error:`, error);
    });

  return watcher;
}

module.exports = {
  watch
};
