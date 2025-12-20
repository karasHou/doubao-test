const 快递Model = require('../models/快递Model');
const { 添加物流更新任务 } = require('../queues/物流队列');

class 快递Controller {
  static async 创建快递(req, res) {
    try {
      const { 单号, 快递公司 } = req.body;

      if (!单号) {
        return res.status(400).json({ error: '快递单号不能为空' });
      }

      const 快递 = await 快递Model.创建快递(单号, 快递公司);

      // 添加到队列异步更新物流信息
      添加物流更新任务(单号, 快递公司);

      res.status(201).json({
        message: '快递录入成功',
        data: 快递
      });
    } catch (error) {
      console.error('创建快递失败:', error);
      res.status(500).json({ error: '创建快递失败' });
    }
  }

  static async 获取所有快递(req, res) {
    try {
      const 快递列表 = await 快递Model.获取所有快递();
      res.json(快递列表);
    } catch (error) {
      console.error('获取快递列表失败:', error);
      res.status(500).json({ error: '获取快递列表失败' });
    }
  }

  static async 获取快递详情(req, res) {
    try {
      const { 单号 } = req.params;
      const 快递 = await 快递Model.根据单号获取快递(单号);

      if (!快递) {
        return res.status(404).json({ error: '快递不存在' });
      }

      res.json(快递);
    } catch (error) {
      console.error('获取快递详情失败:', error);
      res.status(500).json({ error: '获取快递详情失败' });
    }
  }

  static async 更新快递(req, res) {
    try {
      const { 单号 } = req.params;
      const { 快递公司 } = req.body;

      const 快递 = await 快递Model.根据单号获取快递(单号);
      if (!快递) {
        return res.status(404).json({ error: '快递不存在' });
      }

      // 更新后重新触发物流查询
      添加物流更新任务(单号, 快递公司 || 快递.快递公司);

      res.json({ message: '快递信息已更新，正在同步物流状态' });
    } catch (error) {
      console.error('更新快递失败:', error);
      res.status(500).json({ error: '更新快递失败' });
    }
  }

  static async 删除快递(req, res) {
    try {
      const { id } = req.params;
      await 快递Model.删除快递(id);
      res.json({ message: '快递删除成功' });
    } catch (error) {
      console.error('删除快递失败:', error);
      res.status(500).json({ error: '删除快递失败' });
    }
  }

  static async 手动同步物流(req, res) {
    try {
      const { 单号 } = req.params;
      const 快递 = await 快递Model.根据单号获取快递(单号);

      if (!快递) {
        return res.status(404).json({ error: '快递不存在' });
      }

      添加物流更新任务(单号, 快递.快递公司);

      res.json({ message: '已开始同步物流信息' });
    } catch (error) {
      console.error('同步物流信息失败:', error);
      res.status(500).json({ error: '同步物流信息失败' });
    }
  }
}

module.exports = 快递Controller;
