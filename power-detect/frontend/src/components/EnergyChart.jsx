import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

function EnergyChart({ data, label }) {
  const chartData = {
    labels: data.map(d => new Date(d.time)),
    datasets: [
      {
        label: label || '功率 (W)',
        data: data.map(d => d.power),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute'
        },
        title: {
          display: true,
          text: '时间'
        }
      },
      y: {
        title: {
          display: true,
          text: '功率 (W)'
        },
        beginAtZero: true
      }
    }
  };

  return <Line data={chartData} options={options} />;
}

export default EnergyChart;
