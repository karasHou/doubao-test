import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

const API_BASE_URL = 'http://localhost:3001/api';

interface StatsData {
  category: string;
  total_amount: number;
  color: string;
}

const StatsChart: React.FC = () => {
  const [chartData, setChartData] = useState<StatsData[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/summary`);
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getOption = () => {
    return {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: 0,
        left: 'center'
      },
      series: [
        {
          name: '消费金额',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData.map(item => ({
            name: item.category,
            value: parseFloat(item.total_amount.toString()),
            itemStyle: {
              color: item.color
            }
          }))
        }
      ]
    };
  };

  return <ReactECharts option={getOption()} style={{ height: '400px' }} />;
};

export default StatsChart;
