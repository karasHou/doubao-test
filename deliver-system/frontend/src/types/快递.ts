export interface 物流信息 {
  traces: {
    time: string;
    description: string;
    location?: string;
  }[];
}

export interface 快递 {
  id: number;
  单号: string;
  快递公司?: string;
  当前状态: string;
  物流信息?: 物流信息;
  异常状态: boolean;
  创建时间: string;
  更新时间: string;
}
