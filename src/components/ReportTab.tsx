import React, { useState } from 'react';
import { FileText, Download, Mail, Settings, Eye, Plus, Trash2 } from 'lucide-react';
import type { CalculatorInputs, MonthlyResults, KPIs } from '../utils/calculations';

interface ReportTabProps {
  inputs: CalculatorInputs;
  results: MonthlyResults[];
  kpis: KPIs | null;
  selectedDevice?: { 
    image_url?: string; 
    model_name?: string; 
    manufacturer?: string; 
    mrp_url?: string; 
  } | null;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  isDefault?: boolean;
}

const defaultTemplates: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview for decision makers',
    sections: ['header', 'executive-summary', 'key-metrics', 'device-info', 'financing'],
    isDefault: true
  },
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis',
    description: 'Comprehensive report with full financial breakdown',
    sections: ['header', 'executive-summary', 'device-info', 'financing', 'monthly-breakdown', 'charts', 'assumptions']
  },
  {
    id: 'investor-pitch',
    name: 'Investor Pitch',
    description: 'Professional presentation for funding requests',
    sections: ['header', 'executive-summary', 'market-opportunity', 'financial-projections', 'risk-analysis']
  },
  {
    id: 'custom',
    name: 'Custom Report',
    description: 'Build your own report with selected sections',
    sections: ['header']
  }
];

const ReportTab: React.FC<ReportTabProps> = ({ inputs, results, kpis, selectedDevice }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(defaultTemplates[0]);
  const [customSections, setCustomSections] = useState<string[]>(['header']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: 'MRP Aesthetics Laser ROI Analysis',
    message: 'Please find attached the ROI analysis report for your review.'
  });

  const availableSections = [
    { id: 'header', name: 'Header & Practice Info', icon: '📋' },
    { id: 'executive-summary', name: 'Executive Summary', icon: '📊' },
    { id: 'key-metrics', name: 'Key Performance Metrics', icon: '🎯' },
    { id: 'device-info', name: 'Device Information', icon: '🔬' },
    { id: 'financing', name: 'Financing Details', icon: '💰' },
    { id: 'monthly-breakdown', name: 'Monthly P&L Breakdown', icon: '📈' },
    { id: 'charts', name: 'Financial Charts', icon: '📊' },
    { id: 'assumptions', name: 'Assumptions & Methodology', icon: '📝' },
    { id: 'market-opportunity', name: 'Market Opportunity', icon: '🌍' },
    { id: 'financial-projections', name: 'Financial Projections', icon: '📊' },
    { id: 'risk-analysis', name: 'Risk Analysis', icon: '⚠️' }
  ];

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    if (template.id === 'custom') {
      setCustomSections(['header']);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    if (selectedTemplate.id === 'custom') {
      setCustomSections(prev => 
        prev.includes(sectionId) 
          ? prev.filter(id => id !== sectionId)
          : [...prev, sectionId]
      );
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // This will call the enhanced PDF generation with template support
      const sections = selectedTemplate.id === 'custom' ? customSections : selectedTemplate.sections;
      await generateTemplateReport(inputs, results, kpis, selectedDevice, sections, selectedTemplate.name);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    setIsGenerating(true);
    try {
      // This will generate and email the report
      const sections = selectedTemplate.id === 'custom' ? customSections : selectedTemplate.sections;
      await emailTemplateReport(inputs, results, kpis, selectedDevice, sections, selectedTemplate.name, emailData);
    } catch (error) {
      console.error('Error emailing report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getActiveSections = () => {
    return selectedTemplate.id === 'custom' ? customSections : selectedTemplate.sections;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-100">Report Generator</h2>
          <p className="text-dark-400 mt-1">Create professional reports to replace PandaDoc</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || !kpis}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
          <button
            onClick={handleEmailReport}
            disabled={isGenerating || !kpis || !emailData.to}
            className="btn-secondary flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Templates
            </h3>
            <div className="space-y-2">
              {defaultTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedTemplate.id === template.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-dark-600 hover:border-dark-500 text-dark-200'
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-dark-400 mt-1">{template.description}</div>
                  {template.isDefault && (
                    <div className="text-xs text-green-400 mt-1">Default</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section Configuration */}
        <div className="lg:col-span-2">
          <div className="bg-dark-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Report Sections
            </h3>
            
            {selectedTemplate.id === 'custom' ? (
              <div className="space-y-3">
                <p className="text-dark-400 text-sm">Select sections to include in your custom report:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableSections.map((section) => (
                    <label
                      key={section.id}
                      className="flex items-center gap-3 p-3 rounded-md border border-dark-600 hover:border-dark-500 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={customSections.includes(section.id)}
                        onChange={() => handleSectionToggle(section.id)}
                        className="rounded border-dark-600 bg-dark-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-dark-200">{section.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-dark-400 text-sm">This template includes the following sections:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getActiveSections().map((sectionId) => {
                    const section = availableSections.find(s => s.id === sectionId);
                    return section ? (
                      <div key={sectionId} className="flex items-center gap-3 p-3 rounded-md bg-dark-700">
                        <span className="text-lg">{section.icon}</span>
                        <span className="text-dark-200">{section.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-dark-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={emailData.to}
              onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
              className="input-field"
              placeholder="recipient@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Message
            </label>
            <textarea
              value={emailData.message}
              onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
              className="input-field h-20 resize-none"
              placeholder="Custom message for the recipient..."
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-dark-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Report Preview
        </h3>
        <div className="bg-dark-900 rounded-md p-4 border border-dark-600">
          <div className="text-dark-300 text-sm">
            <div className="font-medium text-dark-100 mb-2">Report: {selectedTemplate.name}</div>
            <div className="space-y-1">
              <div>Sections: {getActiveSections().length}</div>
              <div>Pages: ~{Math.ceil(getActiveSections().length / 3)}</div>
              <div>Format: PDF</div>
              {emailData.to && <div>Email: {emailData.to}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder functions - these will be implemented
const generateTemplateReport = async (
  inputs: CalculatorInputs,
  results: MonthlyResults[],
  kpis: KPIs | null,
  selectedDevice: any,
  sections: string[],
  templateName: string
) => {
  console.log('Generating template report:', { sections, templateName });
  // Implementation will be added
};

const emailTemplateReport = async (
  inputs: CalculatorInputs,
  results: MonthlyResults[],
  kpis: KPIs | null,
  selectedDevice: any,
  sections: string[],
  templateName: string,
  emailData: any
) => {
  console.log('Emailing template report:', { sections, templateName, emailData });
  // Implementation will be added
};

export default ReportTab;
