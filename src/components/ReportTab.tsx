import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileText, Download, Mail, Settings, Eye, ClipboardList, BarChart3, Target, Microscope, DollarSign, TrendingUp, FileText as FileTextIcon, Globe, AlertTriangle, ChevronDown, X, Check, Minimize2, Maximize2 } from 'lucide-react';
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
    msrp?: number;
    description?: string;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  // Get current scenario
  const currentScenario = useMemo(() => {
    return scenarios.find(s => s.id === selectedScenario);
  }, [scenarios, selectedScenario]);

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
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-dark-800 border-r border-dark-600 overflow-y-auto transition-all duration-300`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-dark-600">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h3 className="text-lg font-semibold text-dark-100">Report Settings</h3>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-dark-400 hover:text-dark-200 transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {!sidebarCollapsed ? (
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
          ) : (
            <div className="p-2 space-y-4">
              {/* Collapsed sidebar - just icons */}
              <div className="flex flex-col items-center space-y-3">
                <div className="p-2 bg-dark-700 rounded" title="Customer Information">
                  <ClipboardList className="h-4 w-4 text-dark-300" />
                </div>
                <div className="p-2 bg-dark-700 rounded" title="Report Templates">
                  <FileText className="h-4 w-4 text-dark-300" />
                </div>
                <div className="p-2 bg-dark-700 rounded" title="Report Sections">
                  <Settings className="h-4 w-4 text-dark-300" />
                </div>
              </div>
            </div>
          )}
        </div>

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
                  
                  {/* Sample Content Preview */}
                  <div className="bg-dark-900 rounded-md p-4 border border-dark-600">
                    <div className="text-sm text-dark-400 mb-3">Sample Content Preview:</div>
                    <div className="bg-dark-700 rounded-md p-4 text-sm space-y-4">
                      {getActiveSections().map((sectionId) => {
                        const section = reportSections[sectionId];
                        if (!section) return null;
                        
                        return (
                          <div key={sectionId} className="border-b border-dark-600 pb-3 last:border-b-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getSectionIcon(sectionId)}
                              <span className="font-semibold text-dark-100">{section.name}</span>
                            </div>
                            
                            {/* Section-specific mock content */}
                            {sectionId === 'header' && (
                              <div className="space-y-1 text-dark-300">
                                <div><strong>Practice:</strong> {customerInfo.businessName || 'Aesthetic Laser Center'}</div>
                                <div><strong>Client:</strong> {customerInfo.name || 'Dr. Sarah Johnson'}</div>
                                <div><strong>Email:</strong> {customerInfo.email || 'sarah@aestheticcenter.com'}</div>
                                <div><strong>Report Date:</strong> {new Date().toLocaleDateString()}</div>
                                {currentScenario && (
                                  <>
                                    <div><strong>Scenario:</strong> {currentScenario.name}</div>
                                    <div className="text-xs">{currentScenario.description}</div>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {sectionId === 'executive-summary' && (
                              <div className="space-y-2 text-dark-300">
                                <div className="text-xs">This analysis evaluates the financial viability of acquiring the {selectedDevice?.model_name || 'selected laser device'} for your practice.</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div><strong>Device:</strong> {selectedDevice?.model_name || 'Laser Device'}</div>
                                  <div><strong>Financing:</strong> {previewData.dummyContent.financing}</div>
                                  <div><strong>Monthly Revenue:</strong> ${(previewData.dummyContent.monthlyRevenue / 1000).toFixed(0)}k</div>
                                  <div><strong>Payback Period:</strong> {previewData.dummyContent.paybackMonths} months</div>
                                </div>
                              </div>
                            )}
                            
                            {sectionId === 'key-metrics' && (
                              <div className="grid grid-cols-2 gap-2 text-dark-300">
                                <div><strong>Monthly Revenue:</strong> <span className="text-green-400">${(previewData.dummyContent.monthlyRevenue / 1000).toFixed(0)}k</span></div>
                                <div><strong>Monthly EBITDA:</strong> <span className="text-green-400">${(previewData.dummyContent.monthlyEBITDA / 1000).toFixed(0)}k</span></div>
                                <div><strong>Payback Period:</strong> <span className="text-blue-400">{previewData.dummyContent.paybackMonths} months</span></div>
                                <div><strong>NPV (5 years):</strong> <span className="text-purple-400">${(previewData.dummyContent.npv / 1000000).toFixed(1)}M</span></div>
                                <div><strong>IRR:</strong> <span className="text-yellow-400">45.2%</span></div>
                                <div><strong>Breakeven Tx/Day:</strong> <span className="text-orange-400">6.7</span></div>
                              </div>
                            )}
                            
                            {sectionId === 'device-info' && (
                              <div className="space-y-2 text-dark-300">
                                <div><strong>Device:</strong> {selectedDevice?.model_name || 'Laser Device'}</div>
                                <div><strong>MSRP:</strong> ${selectedDevice?.msrp?.toLocaleString() || '150,000'}</div>
                                <div><strong>Manufacturer:</strong> {selectedDevice?.manufacturer || 'Aesthetic Laser'}</div>
                                <div className="text-xs"><strong>Description:</strong> {selectedDevice?.description || 'Advanced aesthetic laser system for various treatments'}</div>
                                {selectedDevice?.image_url && (
                                  <div className="bg-dark-600 rounded p-2 text-center text-xs text-dark-400">
                                    📷 Device Image Placeholder
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {sectionId === 'financing' && (
                              <div className="space-y-1 text-dark-300">
                                <div><strong>Financing Type:</strong> {previewData.dummyContent.financing}</div>
                                <div><strong>Down Payment:</strong> $15,000 (10%)</div>
                                <div><strong>Monthly Payment:</strong> $2,847</div>
                                <div><strong>Interest Rate:</strong> 6.5% APR</div>
                                <div><strong>Term:</strong> 60 months</div>
                              </div>
                            )}
                            
                            {sectionId === 'monthly-breakdown' && (
                              <div className="space-y-1 text-dark-300">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div><strong>Revenue:</strong> <span className="text-green-400">$154,815</span></div>
                                  <div><strong>COGS:</strong> <span className="text-red-400">$15,482</span></div>
                                  <div><strong>Labor:</strong> <span className="text-red-400">$12,000</span></div>
                                  <div><strong>Rent:</strong> <span className="text-red-400">$8,000</span></div>
                                  <div><strong>Marketing:</strong> <span className="text-red-400">$5,000</span></div>
                                  <div><strong>Other OpEx:</strong> <span className="text-red-400">$3,000</span></div>
                                </div>
                                <div className="pt-1 border-t border-dark-600">
                                  <strong>Net Income:</strong> <span className="text-green-400">$111,333</span>
                                </div>
                              </div>
                            )}
                            
                            {sectionId === 'assumptions' && (
                              <div className="space-y-1 text-dark-300 text-xs">
                                <div><strong>Treatments per Day:</strong> 8-12 (ramp-up over 6 months)</div>
                                <div><strong>No-Show Rate:</strong> 15%</div>
                                <div><strong>Package Discount:</strong> 20%</div>
                                <div><strong>Membership Rate:</strong> 30% of patients</div>
                                <div><strong>Upsell Rate:</strong> 25% of treatments</div>
                                <div><strong>Depreciation:</strong> 5-year straight line</div>
                              </div>
                            )}
                            
                            {sectionId === 'charts' && (
                              <div className="space-y-2 text-dark-300">
                                <div className="bg-dark-600 rounded p-4 text-center text-xs text-dark-400">
                                  📊 Financial Charts Placeholder
                                </div>
                                <div className="text-xs">
                                  <div>• Monthly Cash Flow Chart</div>
                                  <div>• Revenue vs Expenses Trend</div>
                                  <div>• ROI Projection Graph</div>
                                  <div>• Breakeven Analysis Chart</div>
                                </div>
                              </div>
                            )}
                            
                            {sectionId === 'market-opportunity' && (
                              <div className="space-y-2 text-dark-300 text-xs">
                                <div><strong>Market Analysis:</strong></div>
                                <div>• Aesthetic laser market growing at 12% annually</div>
                                <div>• Average treatment cost: $200-$800 per session</div>
                                <div>• High demand for non-invasive procedures</div>
                                <div className="pt-2"><strong>Target Demographics:</strong></div>
                                <div>• Age 25-65 with disposable income</div>
                                <div>• Health-conscious individuals</div>
                                <div>• Both male and female clientele</div>
                              </div>
                            )}
                            
                            {sectionId === 'financial-projections' && (
                              <div className="space-y-2 text-dark-300 text-xs">
                                <div><strong>5-Year Financial Projections:</strong></div>
                                <div>• Year 1: Revenue $1,020k, EBITDA $576k</div>
                                <div>• Year 2: Revenue $1,173k, EBITDA $662k</div>
                                <div>• Year 3: Revenue $1,326k, EBITDA $749k</div>
                                <div>• Year 4: Revenue $1,479k, EBITDA $835k</div>
                                <div>• Year 5: Revenue $1,632k, EBITDA $922k</div>
                                <div className="pt-2"><strong>Growth Assumptions:</strong></div>
                                <div>• 15% annual revenue growth</div>
                                <div>• Improved operational efficiency</div>
                              </div>
                            )}
                            
                            {sectionId === 'risk-analysis' && (
                              <div className="space-y-2 text-dark-300 text-xs">
                                <div><strong>Market Risks:</strong></div>
                                <div>• Economic downturns affecting spending</div>
                                <div>• Increased competition</div>
                                <div>• Regulatory changes</div>
                                <div className="pt-2"><strong>Operational Risks:</strong></div>
                                <div>• Equipment maintenance and downtime</div>
                                <div>• Staff turnover and training costs</div>
                                <div>• Technology obsolescence</div>
                                <div className="pt-2"><strong>Mitigation Strategies:</strong></div>
                                <div>• Diversified service offerings</div>
                                <div>• Strong customer retention programs</div>
                              </div>
                            )}
                            
                            {sectionId === 'disclaimer' && (
                              <div className="text-xs text-yellow-200 bg-yellow-900/20 p-2 rounded">
                                <strong>Legal Disclaimer:</strong> {reportDisclaimers[selectedTemplate.id] || reportDisclaimers['custom']}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Always include disclaimer if not already in active sections */}
                      {!getActiveSections().includes('disclaimer') && (
                        <div className="border-b border-dark-600 pb-3 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            <span className="font-semibold text-dark-100">Legal Disclaimer</span>
                          </div>
                          <div className="text-xs text-yellow-200 bg-yellow-900/20 p-2 rounded">
                            <strong>Legal Disclaimer:</strong> {reportDisclaimers[selectedTemplate.id] || reportDisclaimers['custom']}
                          </div>
                        </div>
                      )}
                      
                      {/* Prepared by MRP block - always included */}
                      <div className="border-t border-dark-600 pt-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-dark-100">Prepared by</span>
                        </div>
                        <div className="bg-dark-600 rounded p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src="/mrp-logo.png" 
                              alt="MRP Logo" 
                              className="h-8 w-auto"
                            />
                            <div>
                              <div className="text-dark-100 font-semibold">Powered by MRP</div>
                              <div className="text-dark-400 text-xs">Medical Revenue Partners</div>
                            </div>
                          </div>
                          <a 
                            href="https://mrp.io" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                          >
                            Visit mrp.io
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
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