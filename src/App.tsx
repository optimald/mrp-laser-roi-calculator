import { useState, useEffect } from 'react';
import type { CalculatorInputs, MonthlyResults, KPIs } from './utils/calculations';
import { defaultInputs, calculateAllResults, calculateKPIs } from './utils/calculations';
import { exportToPDF } from './utils/pdfExport';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import Header from './components/Header';
import './App.css';

function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [results, setResults] = useState<MonthlyResults[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);

  useEffect(() => {
    const monthlyResults = calculateAllResults(inputs, 60);
    const calculatedKPIs = calculateKPIs(monthlyResults, inputs);
    
    setResults(monthlyResults);
    setKpis(calculatedKPIs);
  }, [inputs]);

  const handleInputChange = (section: keyof CalculatorInputs, field: string, value: any) => {
    setInputs(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleExportPDF = () => {
    if (kpis) {
      exportToPDF(inputs, results, kpis, 'Your Practice');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">
      <Header onExportPDF={handleExportPDF} />
      <div className="flex h-screen pt-16">
        {/* Left Panel - Inputs */}
        <div className="w-1/3 bg-dark-900 border-r border-dark-700 overflow-y-auto">
          <InputPanel 
            inputs={inputs} 
            onInputChange={handleInputChange}
          />
        </div>
        
        {/* Right Panel - Results */}
        <div className="w-2/3 bg-dark-950 overflow-y-auto">
          <ResultsPanel results={results} kpis={kpis} />
        </div>
      </div>
    </div>
  );
}

export default App;