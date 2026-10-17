import React from 'react';
import { Bar } from 'react-chartjs-2';
import './ChartRegister';

const MonthlyRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted small">Chưa có dữ liệu doanh thu tháng</div>;
  }

  const chartData = {
    labels: data.map(i => `Tháng ${i.month}`),
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: data.map(i => i.total_revenue),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  return <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
};

export default MonthlyRevenueChart;
