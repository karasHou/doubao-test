import Asset from '../models/Asset.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取资产统计信息
export const getAssetStats = async (req, res) => {
  try {
    const stats = await Asset.getStats();

    res.json({
      success: true,
      data: {
        total_assets: parseInt(stats.total_assets),
        in_use_assets: parseInt(stats.in_use_assets),
        in_stock_assets: parseInt(stats.in_stock_assets),
        total_value: parseFloat(stats.total_value) || 0
      }
    });
  } catch (error) {
    console.error('获取资产统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取资产统计失败',
      error: error.message
    });
  }
};

// 导出资产报表
export const exportAssets = async (req, res) => {
  try {
    const { type = 'asset_overview', format = 'excel', start_date, end_date } = req.query;

    // 验证格式
    const validFormats = ['excel', 'pdf', 'csv'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        message: '不支持的导出格式'
      });
    }

    // 获取报表数据
    const reportData = await Asset.getReportData({
      type,
      start_date,
      end_date
    });

    // 调用 Python 脚本生成报表
    const pythonScriptPath = path.join(__dirname, '../../report/generate_report.py');

    // 将数据传递给 Python 脚本
    const dataStr = JSON.stringify({
      data: reportData,
      type,
      format
    });

    const pythonProcess = spawn('python3', [pythonScriptPath]);

    let output = Buffer.alloc(0);
    let errorOutput = '';

    pythonProcess.stdin.write(dataStr);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output = Buffer.concat([output, data]);
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python 脚本执行失败:', errorOutput);
        return res.status(500).json({
          success: false,
          message: '报表生成失败',
          error: errorOutput
        });
      }

      // 设置响应头
      let contentType = '';
      let filename = '';

      switch (format) {
        case 'excel':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          filename = `asset_report_${type}.xlsx`;
          break;
        case 'pdf':
          contentType = 'application/pdf';
          filename = `asset_report_${type}.pdf`;
          break;
        case 'csv':
          contentType = 'text/csv';
          filename = `asset_report_${type}.csv`;
          break;
        default:
          contentType = 'application/octet-stream';
          filename = `asset_report_${type}.${format}`;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(output);
    });
  } catch (error) {
    console.error('导出报表失败:', error);
    res.status(500).json({
      success: false,
      message: '导出报表失败',
      error: error.message
    });
  }
};