import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { MonthlyResults } from '../utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsProps {
  results: MonthlyResults[];
}

const Charts: React.FC<ChartsProps> = ({ results }) => {
  // const months = results.map(r => `Month ${r.month}`);
  const first24Months = results.slice(0, 24);

  // Cash Flow Chart
  const cashFlowData = {
    labels: first24Months.map(r => `M${r.month}`),
    datasets: [
      {
        label: 'Monthly Cash Flow',
        data: first24Months.map(r => r.cashFlow),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.1
      }
    ]
  };

  // Cumulative Cash Chart
  const cumulativeCashData = {
    labels: first24Months.map(r => `M${r.month}`),
    datasets: [
      {
        label: 'Cumulative Cash',
        data: first24Months.map(r => r.cumulativeCash),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.1
      },
      {
        label: 'Break-even Line',
        data: first24Months.map(() => 0),
        borderColor: 'rgb(239, 68, 68)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      }
    ]
  };

  // Revenue vs Costs Chart
  const revenueVsCostsData = {
    labels: first24Months.map(r => `M${r.month}`),
    datasets: [
      {
        label: 'Revenue',
        data: first24Months.map(r => r.revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      },
      {
        label: 'Variable Costs',
        data: first24Months.map(r => r.variableCosts),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      },
      {
        label: 'Fixed Costs',
        data: first24Months.map(r => r.fixedOpex),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f1f5f9'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          callback: function(value: any) {
            return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function(value: any) {
            return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Cash Flow Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">Monthly Cash Flow (24 Months)</h3>
        <div className="h-64">
          <Line data={cashFlowData} options={lineChartOptions} />
        </div>
      </div>

      {/* Cumulative Cash Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">Cumulative Cash Position (24 Months)</h3>
        <div className="h-64">
          <Line data={cumulativeCashData} options={lineChartOptions} />
        </div>
      </div>

      {/* Revenue vs Costs Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">Revenue vs Costs (24 Months)</h3>
        <div className="h-64">
          <Bar data={revenueVsCostsData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Charts;
