const Queue = require('bull');
const 物流Service = require('../services/物流Service');
const 快递Model = require('../models/快递Model');

const 物流更新队列 = new Queue('物流更新', process.env.REDIS_URL || 'redis://localhost:6379');

物流更新队列.process(async (job) => {
  const { 单号, 快递公司 } = job.data;

  try {
    console.log(`开始更新快递 ${单号} 的物流信息`);

    const 物流数据 = await 物流Service.获取物流信息(单号, 快递公司);
    const { status, isError } = 物流Service.解析物流状态(物流数据);

    await 快递Model.更新快递状态(单号, status, 物流数据, isError);

    console.log(`快递 ${单号} 状态更新为: ${status}`);

    return { success: true, status };
  } catch (error) {
    console.error(`更新快递 ${单号} 物流信息失败:`, error);
    throw error;
  }
});

物流更新队列.on('failed', (job, error) => {
  console.error(`队列任务失败 (${job.id}):`, error.message);
});

module.exports = {
  物流更新队列,
  添加物流更新任务: (单号, 快递公司) => {
    物流更新队列.add({ 单号, 快递公司 }, { attempts: 3, backoff: 5000 });
  }
};
