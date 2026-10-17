import React from 'react';
import { Bar } from 'react-chartjs-2';
import './ChartRegister';

const TopProductChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted small">Chưa có dữ liệu sản phẩm bán chạy</div>;
  }

  const chartData = {
    labels: data.map(i => i.product_name),
    datasets: [
      {
        label: 'Số lượng đã bán',
        data: data.map(i => i.total_sold),
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  return <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
};

export default TopProductChart;
