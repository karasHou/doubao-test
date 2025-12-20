import React, { useState } from 'react';
import './快递录入Form.css';

interface 快递录入FormProps {
  onSubmit: (单号: string, 快递公司?: string) => void;
}

const 快递录入Form: React.FC<快递录入FormProps> = ({ onSubmit }) => {
  const [单号, set单号] = useState('');
  const [快递公司, set快递公司] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (单号.trim()) {
      onSubmit(单号.trim(), 快递公司.trim() || undefined);
      set单号('');
      set快递公司('');
    }
  };

  return (
    <form className="快递录入Form" onSubmit={handleSubmit}>
      <h2>录入新快递</h2>
      <div className="form-group">
        <label htmlFor="单号">快递单号:</label>
        <input
          type="text"
          id="单号"
          value={单号}
          onChange={(e) => set单号(e.target.value)}
          placeholder="请输入快递单号"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="快递公司">快递公司:</label>
        <input
          type="text"
          id="快递公司"
          value={快递公司}
          onChange={(e) => set快递公司(e.target.value)}
          placeholder="请输入快递公司名称（可选）"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        录入快递
      </button>
    </form>
  );
};

export default 快递录入Form;
