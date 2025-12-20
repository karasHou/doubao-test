import React, { useState } from 'react';
import { 快递 } from '../types/快递';
import './快递列表.css';

interface 快递列表Props {
  快递列表: 快递[];
  onDelete: (id: number) => void;
  onSync: (单号: string) => void;
}

const 快递列表: React.FC<快递列表Props> = ({ 快递列表, onDelete, onSync }) => {
  const [当前分类, set当前分类] = useState('all');

  const 分类列表 = [
    { key: 'all', 名称: '全部' },
    { key: '待处理', 名称: '待处理' },
    { key: '运输中', 名称: '运输中' },
    { key: '派送中', 名称: '派送中' },
    { key: '已签收', 名称: '已签收' },
    { key: '异常', 名称: '异常' },
  ];

  const 过滤后的快递 = 当前分类 === 'all'
    ? 快递列表
    : 快递列表.filter(快递 => 快递.当前状态 === 当前分类);

  const get状态样式 = (状态: string, 异常状态: boolean) => {
    if (异常状态) return 'status-error';
    switch (状态) {
      case '已签收':
        return 'status-delivered';
      case '派送中':
        return 'status-out-for-delivery';
      case '运输中':
        return 'status-in-transit';
      case '待处理':
        return 'status-pending';
      case '异常':
        return 'status-error';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className="快递列表">
      <div className="分类-tabs">
        {分类列表.map(分类 => (
          <button
            key={分类.key}
            className={`tab-button ${当前分类 === 分类.key ? 'active' : ''}`}
            onClick={() => set当前分类(分类.key)}
          >
            {分类.名称}
            {当前分类 === 'all' && 快递列表.length > 0 && ` (${快递列表.length})`}
            {当前分类 !== 'all' && 分类.key !== 'all' && ` (${快递列表.filter(kd => kd.当前状态 === 分类.key).length})`}
          </button>
        ))}
      </div>

      <div className="快递卡片容器">
        {过滤后的快递.map(快递 => (
          <div key={快递.id} className="快递卡片">
            <div className="快递头部">
              <div className="快递单号">
                <strong>单号:</strong> {快递.单号}
              </div>
              {快递.快递公司 && (
                <div className="快递公司">
                  <strong>公司:</strong> {快递.快递公司}
                </div>
              )}
            </div>
            <div className="快递状态">
              <span className={`status-badge ${get状态样式(快递.当前状态, 快递.异常状态)}`}>
                {快递.当前状态}
              </span>
              {快递.异常状态 && (
                <span className="异常标记">⚠️</span>
              )}
            </div>
            <div className="快递时间">
              <small>
                更新时间: {new Date(快递.更新时间).toLocaleString()}
              </small>
            </div>
            <div className="快递操作">
              <button
                className="btn btn-secondary"
                onClick={() => onSync(快递.单号)}
              >
                同步物流
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(快递.id)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {过滤后的快递.length === 0 && (
        <div className="空状态">
          暂无快递数据
        </div>
      )}
    </div>
  );
};

export default 快递列表;
