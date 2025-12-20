const express = require('express');
const 快递Controller = require('../controllers/快递Controller');

const router = express.Router();

router.post('/packages', 快递Controller.创建快递);
router.get('/packages', 快递Controller.获取所有快递);
router.get('/packages/:单号', 快递Controller.获取快递详情);
router.put('/packages/:单号', 快递Controller.更新快递);
router.delete('/packages/:id', 快递Controller.删除快递);
router.post('/packages/:单号/sync', 快递Controller.手动同步物流);

module.exports = router;
