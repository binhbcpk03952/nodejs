import React from 'react';
import { Pie } from 'react-chartjs-2';
import './ChartRegister';

const PaymentMethodChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-4 text-muted small">Chưa có dữ liệu thanh toán</div>;
  }

  const chartData = {
    labels: data.map(i => i.payment_method === 'cod' ? 'Tiền mặt (COD)' : i.payment_method === 'vnpay' ? 'VNPay' : i.payment_method),
    datasets: [
      {
        data: data.map(i => i.total_revenue),
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444'
        ]
      }
    ]
  };

  return <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />;
};

export default PaymentMethodChart;
