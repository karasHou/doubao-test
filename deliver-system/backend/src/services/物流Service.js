class 物流Service {
  static async 获取物流信息(单号, 快递公司) {
    try {
      // 模拟物流数据，实际使用时需要替换为真实的 API
      return {
        单号: 单号,
        快递公司: 快递公司,
        traces: [
          {
            time: new Date().toISOString(),
            description: '快件已签收',
            location: '北京市朝阳区'
          },
          {
            time: new Date(Date.now() - 3600000).toISOString(),
            description: '正在派送中',
            location: '北京市朝阳区派送点'
          },
          {
            time: new Date(Date.now() - 7200000).toISOString(),
            description: '运输中',
            location: '北京转运中心'
          }
        ]
      };
    } catch (error) {
      console.error('获取物流信息失败:', error);
      throw error;
    }
  }

  static 解析物流状态(物流数据) {
    // 解析物流数据，返回状态和是否异常
    if (!物流数据 || !物流数据.traces) {
      return { status: '异常', isError: true };
    }

    const latestTrace = 物流数据.traces[0];
    if (!latestTrace) {
      return { status: '待处理', isError: false };
    }

    // 根据物流描述判断状态
    const description = latestTrace.description || '';
    if (description.includes('签收')) {
      return { status: '已签收', isError: false };
    } else if (description.includes('派送')) {
      return { status: '派送中', isError: false };
    } else if (description.includes('运输')) {
      return { status: '运输中', isError: false };
    } else if (description.includes('异常') || description.includes('延误')) {
      return { status: '异常', isError: true };
    }

    return { status: '运输中', isError: false };
  }
}

module.exports = 物流Service;
