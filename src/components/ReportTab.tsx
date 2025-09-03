import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileText, Download, Mail, Settings, Eye, ClipboardList, BarChart3, Target, Microscope, DollarSign, TrendingUp, FileText as FileTextIcon, Globe, AlertTriangle, ChevronDown, X, Check, Minimize2, Maximize2 } from 'lucide-react';
import type { CalculatorInputs, MonthlyResults, KPIs } from '../utils/calculations';
import { generateTemplateReport, emailTemplateReport } from '../utils/reportGenerator';

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

interface Scenario {
  id: string;
  name: string;
  description: string;
  device: string;
  financing: string;
  keyMetrics: {
    monthlyRevenue: number;
    monthlyEBITDA: number;
    paybackMonths: number;
    npv: number;
  };
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
    sections: ['header', 'executive-summary', 'key-metrics', 'device-info', 'financing', 'disclaimer'],
    isDefault: true
  },
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis',
    description: 'Comprehensive report with full financial breakdown',
    sections: ['header', 'executive-summary', 'device-info', 'financing', 'monthly-breakdown', 'assumptions', 'disclaimer']
  },
  {
    id: 'investor-pitch',
    name: 'Investor Pitch',
    description: 'Professional presentation for funding requests',
    sections: ['header', 'executive-summary', 'key-metrics', 'device-info', 'financing', 'disclaimer']
  },
  {
    id: 'custom',
    name: 'Custom Report',
    description: 'Build your own report with selected sections',
    sections: ['header', 'disclaimer']
  }
];

const ReportTab: React.FC<ReportTabProps> = ({ inputs, results, kpis, selectedDevice }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(defaultTemplates[0]);
  const [customSections, setCustomSections] = useState<string[]>(['header', 'disclaimer']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario-a');
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: 'MRP Aesthetics Laser ROI Analysis',
    message: 'Please find attached the ROI analysis report for your review.'
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    businessName: '',
    email: ''
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowScenarioDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample scenarios data
  const scenarios: Scenario[] = useMemo(() => {
    const deviceName = selectedDevice ? `${selectedDevice.manufacturer} ${selectedDevice.model_name}` : 'No Device Selected';
    
    return [
      {
        id: 'scenario-a',
        name: 'Scenario A - Conservative',
        description: 'Conservative estimates with moderate growth',
        device: deviceName,
        financing: '30% Down, 5.5% APR, 84 months',
        keyMetrics: {
          monthlyRevenue: 85000,
          monthlyEBITDA: 48000,
          paybackMonths: 5.2,
          npv: 1250000
        }
      },
      {
        id: 'scenario-b',
        name: 'Scenario B - Optimistic',
        description: 'Optimistic projections with high growth',
        device: deviceName,
        financing: '20% Down, 6.5% APR, 60 months',
        keyMetrics: {
          monthlyRevenue: 120000,
          monthlyEBITDA: 75000,
          paybackMonths: 3.8,
          npv: 2100000
        }
      },
      {
        id: 'scenario-c',
        name: 'Scenario C - Aggressive',
        description: 'Aggressive expansion with premium pricing',
        device: deviceName,
        financing: '15% Down, 7.0% APR, 48 months',
        keyMetrics: {
          monthlyRevenue: 150000,
          monthlyEBITDA: 95000,
          paybackMonths: 2.9,
          npv: 2800000
        }
      }
    ];
  }, [selectedDevice]);

  // Report disclaimers
  const reportDisclaimers: Record<string, string> = {
    'executive-summary': 'This executive summary provides high-level financial projections based on current market data and industry benchmarks. Actual results may vary based on market conditions, operational efficiency, and competitive factors.',
    'detailed-analysis': 'This detailed analysis includes comprehensive financial modeling with multiple scenarios. All projections are based on current market data and should be reviewed by qualified financial professionals before making investment decisions.',
    'investor-pitch': 'This investor presentation contains forward-looking statements and projections. Past performance does not guarantee future results. Investment decisions should be based on thorough due diligence and professional financial advice.',
    'custom': 'This custom report combines selected financial metrics and projections. All data should be independently verified and reviewed by qualified professionals before making business decisions.'
  };

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
    { id: 'risk-analysis', name: 'Risk Analysis', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'disclaimer', name: 'Legal Disclaimer', icon: <AlertTriangle className="h-4 w-4" /> }
  ];

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    if (template.id === 'custom') {
      setCustomSections(['header', 'disclaimer']);
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

  const getActiveSections = () => {
    return selectedTemplate.id === 'custom' ? customSections : selectedTemplate.sections;
  };

  const handleGenerateReport = async () => {
    if (!kpis) return;
    
    setIsGenerating(true);
    try {
      const sections = getActiveSections();
      const currentScenario = scenarios.find(s => s.id === selectedScenario);
      await generateTemplateReport(inputs, results, kpis, selectedDevice, sections, selectedTemplate.name, customerInfo, currentScenario);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    if (!kpis) return;
    
    setIsGenerating(true);
    try {
      const sections = getActiveSections();
      const currentScenario = scenarios.find(s => s.id === selectedScenario);
      await emailTemplateReport(inputs, results, kpis, selectedDevice, sections, selectedTemplate.name, emailData, customerInfo, currentScenario);
    } catch (error) {
      console.error('Error emailing report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getSectionIcon = (sectionId: string) => {
    const icons: Record<string, React.ReactNode> = {
      'header': <ClipboardList className="h-4 w-4" />,
      'executive-summary': <BarChart3 className="h-4 w-4" />,
      'key-metrics': <Target className="h-4 w-4" />,
      'device-info': <Microscope className="h-4 w-4" />,
      'financing': <DollarSign className="h-4 w-4" />,
      'monthly-breakdown': <TrendingUp className="h-4 w-4" />,
      'charts': <BarChart3 className="h-4 w-4" />,
      'assumptions': <FileTextIcon className="h-4 w-4" />,
      'market-opportunity': <Globe className="h-4 w-4" />,
      'financial-projections': <BarChart3 className="h-4 w-4" />,
      'risk-analysis': <AlertTriangle className="h-4 w-4" />,
      'disclaimer': <AlertTriangle className="h-4 w-4" />
    };
    return icons[sectionId] || <FileText className="h-4 w-4" />;
  };

  // Generate preview data
  const previewData = useMemo(() => {
    const sections = getActiveSections();
    const sectionDetails = sections.map(sectionId => {
      const section = availableSections.find(s => s.id === sectionId);
      return section ? {
        id: section.id,
        name: section.name,
        icon: getSectionIcon(sectionId)
      } : null;
    }).filter(Boolean);

    const estimatedPages = Math.ceil(sections.length / 2) + 1; // Rough estimate
    const hasData = true; // Always show data for demo
    const currentScenario = scenarios.find(s => s.id === selectedScenario);
    
    return {
      sections: sectionDetails,
      estimatedPages,
      hasData,
      totalSections: sections.length,
      scenario: currentScenario,
      dummyContent: {
        practiceName: customerInfo?.businessName || "Aesthetic Laser Center",
        deviceName: currentScenario?.device || "No Device Selected",
        monthlyRevenue: currentScenario?.keyMetrics.monthlyRevenue || 85000,
        monthlyEBITDA: currentScenario?.keyMetrics.monthlyEBITDA || 48000,
        paybackMonths: currentScenario?.keyMetrics.paybackMonths || 5.2,
        npv: currentScenario?.keyMetrics.npv || 1250000,
        financing: currentScenario?.financing || "30% Down, 5.5% APR, 84 months"
      }
    };
  }, [selectedTemplate, customSections, selectedScenario, scenarios, customerInfo]);

  return (
    <div className="h-screen flex flex-col">
      {/* Report Controls Bar */}
      <div className="bg-dark-800 border-b border-dark-600 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-100">Report Generator</h2>
            <p className="text-dark-400 mt-1">Create professional reports to replace PandaDoc</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Scenario Mega Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowScenarioDropdown(!showScenarioDropdown)}
                className="btn-secondary flex items-center gap-2 min-w-[200px] justify-between"
              >
                <span>{scenarios.find(s => s.id === selectedScenario)?.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showScenarioDropdown && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-dark-800 border border-dark-600 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-dark-600">
                    <h3 className="font-semibold text-dark-100">Select Scenario</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {scenarios.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setSelectedScenario(scenario.id);
                          setShowScenarioDropdown(false);
                        }}
                        className={`w-full p-4 text-left border-b border-dark-600 last:border-b-0 hover:bg-dark-700 transition-colors ${
                          selectedScenario === scenario.id ? 'bg-blue-500/10 border-blue-500/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-dark-100">{scenario.name}</div>
                          {selectedScenario === scenario.id && <Check className="h-4 w-4 text-blue-400" />}
                        </div>
                        <div className="text-sm text-dark-400 mb-2">{scenario.description}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-dark-400">Revenue:</span>
                            <span className="text-green-400 ml-1">${(scenario.keyMetrics.monthlyRevenue / 1000).toFixed(0)}k</span>
                          </div>
                          <div>
                            <span className="text-dark-400">EBITDA:</span>
                            <span className="text-green-400 ml-1">${(scenario.keyMetrics.monthlyEBITDA / 1000).toFixed(0)}k</span>
                          </div>
                          <div>
                            <span className="text-dark-400">Payback:</span>
                            <span className="text-blue-400 ml-1">{scenario.keyMetrics.paybackMonths.toFixed(1)}m</span>
                          </div>
                          <div>
                            <span className="text-dark-400">NPV:</span>
                            <span className="text-purple-400 ml-1">${(scenario.keyMetrics.npv / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || !kpis}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Export PDF'}
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              disabled={isGenerating || !kpis}
              className="btn-secondary flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Report
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Show Sidebar Button (when collapsed) */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="fixed left-4 top-24 z-40 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg p-2 text-dark-300 hover:text-dark-100 transition-colors"
            title="Show sidebar"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-dark-800 border-r border-dark-600 overflow-y-auto">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-dark-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark-100">Report Settings</h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-dark-400 hover:text-dark-200 transition-colors"
                  title="Minimize sidebar"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.businessName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, businessName: e.target.value }))}
                      className="input-field"
                      placeholder="Aesthetic Laser Center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                      placeholder="john@lasercenter.com"
                    />
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Templates
                </h3>
                <div className="space-y-2">
                  {defaultTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full p-3 rounded-md border text-left transition-colors ${
                        selectedTemplate.id === template.id
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-dark-600 hover:border-dark-500 text-dark-200'
                      }`}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-dark-400">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Selection */}
              {selectedTemplate.id === 'custom' && (
                <div>
                  <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Report Sections
                  </h3>
                  <div className="space-y-2">
                    {availableSections.map((section) => (
                      <label key={section.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-dark-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customSections.includes(section.id)}
                          onChange={() => handleSectionToggle(section.id)}
                          className="rounded border-dark-600 bg-dark-700 text-blue-500 focus:ring-blue-500"
                        />
                        <div className="text-dark-400">{section.icon}</div>
                        <span className="text-dark-200 text-sm">{section.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Report Preview */}
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-dark-100 mb-6 flex items-center gap-2">
                  <Eye className="h-6 w-6" />
                  Report Preview
                </h3>
                
                <div className="space-y-6">
                  {/* Report Header */}
                  <div className="bg-dark-900 rounded-md p-4 border border-dark-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-medium text-dark-100 text-lg">Report: {selectedTemplate.name}</div>
                        <div className="text-sm text-dark-400 mt-1">
                          Scenario: <span className="text-blue-400">{scenarios.find(s => s.id === selectedScenario)?.name}</span>
                        </div>
                      </div>
                      <div className="text-sm text-dark-400">
                        {previewData.hasData ? '✅ Data Ready' : '⚠️ No Data'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                  </div>

                  {/* Report Contents */}
                  <div className="bg-dark-900 rounded-md p-4 border border-dark-600">
                    <div className="text-sm text-dark-400 mb-3">Report Contents:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {previewData.sections.map((section: any) => (
                        <div key={section.id} className="flex items-center gap-2 text-sm">
                          <div className="text-dark-400">{section.icon}</div>
                          <span className="text-dark-200">{section.name}</span>
                        </div>
                      ))}
                      {/* Always include disclaimer as a report section */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="text-yellow-400"><AlertTriangle className="h-4 w-4" /></div>
                        <span className="text-dark-200">Legal Disclaimer</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dummy Report Content Preview */}
                  <div className="bg-dark-900 rounded-md p-4 border border-dark-600">
                    <div className="text-sm text-dark-400 mb-3">Sample Content Preview:</div>
                    <div className="bg-dark-700 rounded-md p-4 text-sm space-y-3">
                      <div className="text-dark-200">
                        <strong>Practice:</strong> {previewData.dummyContent.practiceName}
                      </div>
                      <div className="text-dark-200">
                        <strong>Device:</strong> {previewData.dummyContent.deviceName}
                      </div>
                      <div className="text-dark-200">
                        <strong>Financing:</strong> {previewData.dummyContent.financing}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-green-400">Monthly Revenue: ${(previewData.dummyContent.monthlyRevenue / 1000).toFixed(0)}k</div>
                          <div className="text-green-400">Monthly EBITDA: ${(previewData.dummyContent.monthlyEBITDA / 1000).toFixed(0)}k</div>
                        </div>
                        <div>
                          <div className="text-blue-400">Payback Period: {previewData.dummyContent.paybackMonths} months</div>
                          <div className="text-purple-400">NPV: ${(previewData.dummyContent.npv / 1000000).toFixed(1)}M</div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-dark-600 text-yellow-200">
                        <strong>Disclaimer:</strong> {reportDisclaimers[selectedTemplate.id] || reportDisclaimers['custom']}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-100">Email Report</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-dark-400 hover:text-dark-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={customerInfo.businessName}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, businessName: e.target.value }))}
                  className="input-field"
                  placeholder="Aesthetic Laser Center"
                />
              </div>
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
                  className="input-field h-24 resize-none"
                  placeholder="Custom message for the recipient..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleEmailReport();
                  setShowEmailModal(false);
                }}
                disabled={!emailData.to}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTab;