import React, { useState, useMemo } from 'react';
import { FileText, Download, Mail, Settings, Eye, Plus, Trash2, ClipboardList, BarChart3, Target, Microscope, DollarSign, TrendingUp, FileText as FileTextIcon, Globe, AlertTriangle } from 'lucide-react';
import type { CalculatorInputs, MonthlyResults, KPIs } from '../utils/calculations';
import { generateTemplateReport, emailTemplateReport, reportSections } from '../utils/reportGenerator';

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
    { id: 'header', name: 'Header & Practice Info', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'executive-summary', name: 'Executive Summary', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'key-metrics', name: 'Key Performance Metrics', icon: <Target className="h-4 w-4" /> },
    { id: 'device-info', name: 'Device Information', icon: <Microscope className="h-4 w-4" /> },
    { id: 'financing', name: 'Financing Details', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'monthly-breakdown', name: 'Monthly P&L Breakdown', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'charts', name: 'Financial Charts', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'assumptions', name: 'Assumptions & Methodology', icon: <FileTextIcon className="h-4 w-4" /> },
    { id: 'market-opportunity', name: 'Market Opportunity', icon: <Globe className="h-4 w-4" /> },
    { id: 'financial-projections', name: 'Financial Projections', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'risk-analysis', name: 'Risk Analysis', icon: <AlertTriangle className="h-4 w-4" /> }
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

  const getSectionIcon = (sectionId: string) => {
    const icons: Record<string, React.ReactNode> = {
      'header': <ClipboardList className="h-4 w-4" />,
      'executive-summary': <BarChart3 className="h-4 w-4" />,
      'key-metrics': <Target className="h-4 w-4" />,
      'device-info': <Microscope className="h-4 w-4" />,
      'financing': <DollarSign className="h-4 w-4" />,
      'monthly-breakdown': <TrendingUp className="h-4 w-4" />,
      'assumptions': <FileTextIcon className="h-4 w-4" />,
      'market-opportunity': <Globe className="h-4 w-4" />,
      'financial-projections': <BarChart3 className="h-4 w-4" />,
      'risk-analysis': <AlertTriangle className="h-4 w-4" />
    };
    return icons[sectionId] || <FileText className="h-4 w-4" />;
  };

  // Generate preview data
  const previewData = useMemo(() => {
    const sections = getActiveSections();
    const sectionDetails = sections.map(sectionId => {
      const section = reportSections[sectionId];
      return section ? {
        id: section.id,
        name: section.name,
        icon: getSectionIcon(sectionId)
      } : null;
    }).filter(Boolean);

    const estimatedPages = Math.ceil(sections.length / 2) + 1; // Rough estimate
    const hasData = kpis && results.length > 0;
    
    return {
      sections: sectionDetails,
      estimatedPages,
      hasData,
      totalSections: sections.length
    };
  }, [selectedTemplate, customSections, kpis, results]);

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
                      <div className="text-dark-400">{section.icon}</div>
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
                        <div className="text-dark-400">{section.icon}</div>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-dark-100">Report: {selectedTemplate.name}</div>
              <div className="text-sm text-dark-400">
                {previewData.hasData ? '✅ Data Ready' : '⚠️ No Data'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-dark-400">Sections:</span>
                <span className="text-dark-200 ml-2">{previewData.totalSections}</span>
              </div>
              <div>
                <span className="text-dark-400">Pages:</span>
                <span className="text-dark-200 ml-2">~{previewData.estimatedPages}</span>
              </div>
              <div>
                <span className="text-dark-400">Format:</span>
                <span className="text-dark-200 ml-2">PDF</span>
              </div>
              <div>
                <span className="text-dark-400">Size:</span>
                <span className="text-dark-200 ml-2">~{previewData.estimatedPages * 50}KB</span>
              </div>
            </div>
            
            {emailData.to && (
              <div className="pt-2 border-t border-dark-600">
                <div className="text-sm">
                  <span className="text-dark-400">Email to:</span>
                  <span className="text-blue-400 ml-2">{emailData.to}</span>
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t border-dark-600">
              <div className="text-sm text-dark-400 mb-2">Report Contents:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {previewData.sections.map((section: any) => (
                  <div key={section.id} className="flex items-center gap-2 text-sm">
                    <div className="text-dark-400">{section.icon}</div>
                    <span className="text-dark-200">{section.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {!previewData.hasData && (
              <div className="pt-2 border-t border-dark-600">
                <div className="text-sm text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  No calculation data available. Please run the calculator first to generate meaningful reports.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default ReportTab;
