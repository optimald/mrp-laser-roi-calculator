import React from 'react';
import mrpLogo from '../assets/images/mrp-logo.png';

interface HeaderProps {
  onExportPDF: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExportPDF }) => {
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
        
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
