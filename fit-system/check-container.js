#!/usr/bin/env node

// 这个脚本用于检查 Docker 容器内实际运行的代码
const { exec } = require('child_process');

// 执行命令查看容器内的文件
const cmd = 'docker exec fit-system-backend bash -c "cd /app && cat src/app.js && echo -e \"\\n--- Stats Routes ---\" && cat src/routes/stats.js 2>/dev/null || echo \"File not found\""';

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }

  console.log('Container app.js content:');
  console.log(stdout);

  if (stderr) {
    console.error('stderr:', stderr);
  }
});
