import React from 'react';
import type { MonthlyResults, KPIs } from '../utils/calculations';
import KPICards from './KPICards';
import Charts from './Charts';

interface ResultsPanelProps {
  results: MonthlyResults[];
  kpis: KPIs | null;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, kpis }) => {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-dark-100 mb-6">Financial Analysis</h2>
        
        {/* KPI Cards */}
        {kpis && <KPICards kpis={kpis} />}
        
        {/* Charts */}
        <div id="charts-container" className="mt-8">
          <Charts results={results} />
        </div>
        
        {/* Summary Table */}
        <div className="mt-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Monthly Summary (First 12 Months)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-2 px-3 text-dark-300">Month</th>
                    <th className="text-right py-2 px-3 text-dark-300">Treatments</th>
                    <th className="text-right py-2 px-3 text-dark-300">Revenue</th>
                    <th className="text-right py-2 px-3 text-dark-300">EBITDA</th>
                    <th className="text-right py-2 px-3 text-dark-300">Cash Flow</th>
                    <th className="text-right py-2 px-3 text-dark-300">Cumulative Cash</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 12).map((result) => (
                    <tr key={result.month} className="border-b border-dark-700 hover:bg-dark-700">
                      <td className="py-2 px-3 text-dark-200">{result.month}</td>
                      <td className="py-2 px-3 text-right text-dark-200">
                        {Math.round(result.treatments)}
                      </td>
                      <td className="py-2 px-3 text-right text-green-400">
                        ${result.revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2 px-3 text-right text-blue-400">
                        ${result.ebitda.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className={`py-2 px-3 text-right ${result.cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${result.cashFlow.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className={`py-2 px-3 text-right ${result.cumulativeCash >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${result.cumulativeCash.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
