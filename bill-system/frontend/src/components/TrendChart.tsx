import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

const API_BASE_URL = 'http://localhost:3001/api';

interface TrendData {
  period: string;
  total: number;
}

const TrendChart: React.FC = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    fetchTrend();
  }, []);

  const fetchTrend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/trend?period=month`);
      const data = await response.json();
      setTrendData(data);
    } catch (error) {
      console.error('Error fetching trend:', error);
    }
  };

  const getOption = () => {
    return {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: trendData.map(item => new Date(item.period).toLocaleDateString('zh-CN'))
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      series: [
        {
          name: '消费金额',
          type: 'line',
          smooth: true,
          data: trendData.map(item => parseFloat(item.total.toString())),
          itemStyle: {
            color: '#1890ff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0, color: 'rgba(24, 144, 255, 0.3)'
                },
                {
                  offset: 1, color: 'rgba(24, 144, 255, 0.05)'
                }
              ]
            }
          }
        }
      ]
    };
  };

  return <ReactECharts option={getOption()} style={{ height: '400px' }} />;
};

export default TrendChart;
