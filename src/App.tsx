import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import type { CalculatorInputs, MonthlyResults, KPIs } from './utils/calculations';
import { defaultInputs, calculateAllResults, calculateKPIs } from './utils/calculations';
import { exportToPDF } from './utils/pdfExport';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import ReportTab from './components/ReportTab';
import Header from './components/Header';
import './App.css';

// Main app component with routing logic
function AppContent() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [results, setResults] = useState<MonthlyResults[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on current route
  const activeTab = location.pathname === '/reports' ? 'reports' : 'calculator';

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
      exportToPDF(inputs, results, kpis, 'Your Practice', selectedDevice);
    }
  };

  const handleDeviceSelect = (device: any) => {
    setSelectedDevice(device);
  };

  const handleTabChange = (tab: 'calculator' | 'reports') => {
    if (tab === 'reports') {
      navigate('/reports');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">
      <Header 
        onExportPDF={handleExportPDF} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      <Routes>
        <Route path="/" element={
          <div className="flex h-screen pt-16">
            {/* Left Panel - Inputs */}
            <div className="w-1/3 bg-dark-900 border-r border-dark-700 overflow-y-auto">
              <InputPanel 
                inputs={inputs} 
                onInputChange={handleInputChange}
                onDeviceSelect={handleDeviceSelect}
              />
            </div>
            
            {/* Right Panel - Results */}
            <div className="w-2/3 bg-dark-950 overflow-y-auto">
              <ResultsPanel results={results} kpis={kpis} />
            </div>
          </div>
        } />
        
        <Route path="/reports" element={
          <div className="pt-16">
            <ReportTab 
              inputs={inputs}
              results={results}
              kpis={kpis}
              selectedDevice={selectedDevice}
            />
          </div>
        } />
      </Routes>
    </div>
  );
}

// Root App component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;