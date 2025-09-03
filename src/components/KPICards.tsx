import React from 'react';
import type { KPIs } from '../utils/calculations';
import { DollarSign, TrendingUp, Target, Clock, Calculator, BarChart3 } from 'lucide-react';

interface KPICardsProps {
  kpis: KPIs;
}

const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  // const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const formatNumber = (value: number, decimals: number = 1) => value.toFixed(decimals);

  const kpiData = [
    {
      title: 'Monthly Payment',
      value: formatCurrency(kpis.monthlyPayment),
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(kpis.monthlyRevenue),
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Monthly EBITDA',
      value: formatCurrency(kpis.monthlyEBITDA),
      icon: BarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Breakeven Tx/Day',
      value: formatNumber(kpis.breakevenTreatmentsPerDay),
      icon: Target,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      title: 'Payback Period',
      value: `${formatNumber(kpis.paybackMonths)} months`,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      title: 'NPV',
      value: formatCurrency(kpis.npv),
      icon: Calculator,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={index}
            className={`kpi-card ${kpi.bgColor} ${kpi.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <IconComponent className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </div>
                <div className="text-sm text-dark-400">
                  {kpi.title}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
