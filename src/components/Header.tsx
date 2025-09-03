import React from 'react';
import mrpLogo from '../assets/images/mrp-logo.png';

interface HeaderProps {
  onExportPDF: () => void;
  activeTab: 'calculator' | 'reports';
  onTabChange: (tab: 'calculator' | 'reports') => void;
}

const Header: React.FC<HeaderProps> = ({ onExportPDF, activeTab, onTabChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900 border-b border-dark-700 px-6 py-3 h-16">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          <img 
            src={mrpLogo} 
            alt="MRP Logo" 
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-xl font-bold text-dark-50">
              Aesthetics Laser Cost & ROI Calculator
            </h1>
            <p className="text-sm text-dark-400">
              Model total cost of ownership and return on investment
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => onTabChange('calculator')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white'
                  : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => onTabChange('reports')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'text-dark-300 hover:text-dark-100 hover:bg-dark-700'
              }`}
            >
              Reports
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {activeTab === 'calculator' && (
              <>
                <div className="text-sm text-dark-400">
                  <span className="font-medium">Scenario:</span> A
                </div>
                <button 
                  onClick={onExportPDF}
                  className="btn-secondary text-sm"
                >
                  Export PDF
                </button>
                <button className="btn-primary text-sm">
                  Compare Scenarios
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
