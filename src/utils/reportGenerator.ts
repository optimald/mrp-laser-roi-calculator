import jsPDF from 'jspdf';
import type { CalculatorInputs, MonthlyResults, KPIs } from './calculations';

export interface ReportSection {
  id: string;
  name: string;
  content: (pdf: jsPDF, inputs: CalculatorInputs, results: MonthlyResults[], kpis: KPIs | null, selectedDevice: any, yPosition: number) => number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  isDefault?: boolean;
}

// Helper function to add text with word wrap
const addText = (pdf: jsPDF, text: string, x: number, y: number, maxWidth?: number, fontSize: number = 10) => {
  pdf.setFontSize(fontSize);
  if (maxWidth) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  } else {
    pdf.text(text, x, y);
    return y + fontSize * 0.4;
  }
};

// Helper function to add a line
const addLine = (pdf: jsPDF, y: number, pageWidth: number) => {
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, y, pageWidth - 20, y);
  return y + 5;
};

// Helper function to add a section header
const addSectionHeader = (pdf: jsPDF, title: string, y: number, pageWidth: number) => {
  pdf.setFontSize(14);
  pdf.setTextColor(59, 130, 246); // Blue color
  y = addText(pdf, title, 20, y, pageWidth - 40, 14);
  pdf.setTextColor(0, 0, 0);
  return y + 5;
};

// Helper function to add a table
const addTable = (pdf: jsPDF, headers: string[], rows: string[][], y: number, pageWidth: number) => {
  const colWidths = headers.map(() => (pageWidth - 40) / headers.length);
  let xPosition = 20;
  
  // Draw table headers
  pdf.setFillColor(240, 240, 240);
  pdf.rect(xPosition, y, colWidths.reduce((sum, width) => sum + width, 0), 8, 'F');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  
  headers.forEach((header, index) => {
    pdf.text(header, xPosition + 2, y + 5);
    xPosition += colWidths[index];
  });
  
  y += 8;
  
  // Draw table rows
  rows.forEach((row) => {
    xPosition = 20;
    row.forEach((cell, index) => {
      pdf.text(cell, xPosition + 2, y + 5);
      xPosition += colWidths[index];
    });
    y += 8;
  });
  
  return y + 5;
};

// Report Sections
export const reportSections: Record<string, ReportSection> = {
  'header': {
    id: 'header',
    name: 'Header & Practice Info',
    content: (pdf, _inputs, _results, _kpis, _selectedDevice, yPosition) => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      yPosition = addText(pdf, 'MRP Aesthetics Laser ROI Analysis', 20, 10, pageWidth - 40, 12);
      pdf.setTextColor(0, 0, 0);
      
      // Practice Information
      yPosition = addText(pdf, 'Practice: Your Practice', 20, 35, pageWidth - 40, 12);
      yPosition = addText(pdf, `Report Date: ${new Date().toLocaleDateString()}`, 20, yPosition, pageWidth - 40, 10);
      yPosition = addLine(pdf, yPosition + 5, pageWidth);
      
      return yPosition;
    }
  },
  
  'executive-summary': {
    id: 'executive-summary',
    name: 'Executive Summary',
    content: (pdf, _inputs, _results, kpis, _selectedDevice, yPosition) => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      yPosition = addSectionHeader(pdf, 'Executive Summary', yPosition, pageWidth);
      
      if (kpis) {
        const summaryData = [
          ['Metric', 'Value'],
          ['Monthly Payment', `$${kpis.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`],
          ['Monthly Revenue', `$${kpis.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`],
          ['Monthly EBITDA', `$${kpis.monthlyEBITDA.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`],
          ['Breakeven Treatments/Day', kpis.breakevenTreatmentsPerDay.toFixed(1)],
          ['Payback Period', `${kpis.paybackMonths.toFixed(1)} months`],
          ['NPV', `$${kpis.npv.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`]
        ];
        
        yPosition = addTable(pdf, summaryData[0], summaryData.slice(1), yPosition, pageWidth);
      }
      
      return yPosition;
    }
  },
  
  'key-metrics': {
    id: 'key-metrics',
    name: 'Key Performance Metrics',
    content: (pdf, inputs, _results, kpis, _selectedDevice, yPosition) => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      yPosition = addSectionHeader(pdf, 'Key Performance Metrics', yPosition, pageWidth);
      
      if (kpis) {
        const totalCost = inputs.device.msrp - inputs.device.discount + inputs.device.accessories + inputs.device.shippingInstall;
        const monthlyCashFlow = kpis.monthlyEBITDA - kpis.monthlyPayment;
        const monthlyTreatments = (kpis.monthlyRevenue / inputs.pricing.listPricePerTreatment);
        const revenuePerTreatment = inputs.pricing.listPricePerTreatment;
        
        const metricsData = [
          ['Metric', 'Value', 'Target'],
          ['ROI', `${(kpis.npv / totalCost * 100).toFixed(1)}%`, '>15%'],
          ['Monthly Cash Flow', `$${monthlyCashFlow.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 'Positive'],
          ['Treatment Volume', `${monthlyTreatments.toFixed(0)}`, '>200'],
          ['Revenue per Treatment', `$${revenuePerTreatment.toFixed(0)}`, '>$400']
        ];
        
        yPosition = addTable(pdf, metricsData[0], metricsData.slice(1), yPosition, pageWidth);
      }
      
      return yPosition;
    }
  },
  
  'device-info': {
    id: 'device-info',
    name: 'Device Information',
    content: (pdf, inputs, _results, _kpis, selectedDevice, yPosition) => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      yPosition = addSectionHeader(pdf, 'Device Information', yPosition, pageWidth);
      
      // Device details
      const deviceData = [
        ['Parameter', 'Value'],
        ['Device MSRP', `$${inputs.device.msrp.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`],
        ['Discount', `${inputs.device.discount}%`],
        ['Accessories', `$${inputs.device.accessories.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`],
        ['Shipping/Install', `$${inputs.device.shippingInstall.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`],
        ['Total Cost', `$${(inputs.device.msrp - inputs.device.discount + inputs.device.accessories + inputs.device.shippingInstall).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`]
      ];
      
      if (selectedDevice) {
        deviceData.push(['Selected Device', `${selectedDevice.manufacturer} ${selectedDevice.model_name}`]);
        if (selectedDevice.mrp_url) {
          deviceData.push(['MRP.io Link', selectedDevice.mrp_url]);
        }
      }
      
      yPosition = addTable(pdf, deviceData[0], deviceData.slice(1), yPosition, pageWidth);
      
      return yPosition;
    }
  },
  
  'financing': {
    id: 'financing',
    name: 'Financing Details',
    content: (pdf, inputs, _results, _kpis, _selectedDevice, yPosition) => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      yPosition = addSectionHeader(pdf, 'Financing Details', yPosition, pageWidth);
      
      const financingData = [
        ['Parameter', 'Value'],
        ['Purchase Method', inputs.financing.purchaseMethod.replace('-', ' ').toUpperCase()],
        ['APR', `${inputs.financing.apr}%`],
        ['Term', `${inputs.financing.termMonths} months`],
        ['Down Payment', inputs.financing.downPaymentType === 'percent' ? `${inputs.financing.downPayment}%` : `$${inputs.financing.downPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`]
      ];
      
      yPosition = addTable(pdf, financingData[0], financingData.slice(1), yPosition, pageWidth);
      
      return yPosition;
    }
  },
  
  'monthly-breakdown': {
    id: 'monthly-breakdown',
    name: 'Monthly P&L Breakdown',
    content: (pdf, _inputs, results, _kpis, _selectedDevice, yPosition) => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      yPosition = addSectionHeader(pdf, 'Monthly P&L Summary (First 12 Months)', yPosition, pageWidth);
      
      const tableHeaders = ['Month', 'Treatments', 'Revenue', 'EBITDA', 'Cash Flow', 'Cumulative Cash'];
      const tableRows = results.slice(0, 12).map(result => [
        `M${result.month}`,
        result.treatments.toFixed(0),
        `$${result.revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        `$${result.ebitda.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        `$${result.cashFlow.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        `$${result.cumulativeCash.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      ]);
      
      yPosition = addTable(pdf, tableHeaders, tableRows, yPosition, pageWidth);
      
      return yPosition;
    }
  },
  
  'assumptions': {
    id: 'assumptions',
    name: 'Assumptions & Methodology',
    content: (pdf, _inputs, _results, _kpis, _selectedDevice, yPosition) => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      yPosition = addSectionHeader(pdf, 'Key Assumptions', yPosition, pageWidth);
      
      const assumptions = [
        '• Treatment pricing based on market rates and competitive analysis',
        '• Utilization ramp-up follows industry standard patterns',
        '• No-show rate accounts for typical patient behavior',
        '• Fixed costs include all operational overhead',
        '• Financing terms reflect current market conditions',
        '• Revenue projections based on conservative estimates',
        '• All calculations exclude inflation adjustments'
      ];
      
      assumptions.forEach(assumption => {
        yPosition = addText(pdf, assumption, 20, yPosition, pageWidth - 40, 10);
      });
      
      return yPosition + 10;
    }
  },
  
  'disclaimer': {
    id: 'disclaimer',
    name: 'Legal Disclaimer',
    content: (pdf, _inputs, _results, _kpis, _selectedDevice, yPosition) => {
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      yPosition = addSectionHeader(pdf, 'Legal Disclaimer', yPosition, pageWidth);
      
      // Set text color to red for disclaimer
      pdf.setTextColor(220, 38, 38);
      
      const disclaimerText = [
        'IMPORTANT LEGAL NOTICE:',
        '',
        'This financial analysis and ROI projection report contains forward-looking statements and projections based on current market data and industry benchmarks. The information provided is for informational purposes only and should not be construed as financial, investment, or business advice.',
        '',
        'Key Disclaimers:',
        '• All financial projections are estimates based on current market conditions and may not reflect actual results',
        '• Past performance does not guarantee future results',
        '• Market conditions, competitive factors, and operational efficiency may significantly impact actual outcomes',
        '• This analysis should be reviewed by qualified financial professionals before making investment decisions',
        '• MRP.io and its affiliates make no warranties or guarantees regarding the accuracy of these projections',
        '• Users should conduct their own due diligence and seek professional advice before making business decisions',
        '',
        'By using this report, you acknowledge that you have read, understood, and agree to these terms and conditions.'
      ];
      
      disclaimerText.forEach(line => {
        if (line === '') {
          yPosition += 5;
        } else {
          yPosition = addText(pdf, line, 20, yPosition, pageWidth - 40, 9);
        }
      });
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      return yPosition + 10;
    }
  }
};

// Generate template-based report
export const generateTemplateReport = async (
  inputs: CalculatorInputs,
  results: MonthlyResults[],
  kpis: KPIs | null,
  selectedDevice: any,
  sections: string[],
  templateName: string
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Generate each section
  for (const sectionId of sections) {
    const section = reportSections[sectionId];
    if (section) {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }
      
      yPosition = section.content(pdf, inputs, results, kpis, selectedDevice, yPosition);
    }
  }
  
  // Save the PDF
  const fileName = `MRP_Laser_ROI_Analysis_${templateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

// Email template report (placeholder for now)
export const emailTemplateReport = async (
  inputs: CalculatorInputs,
  results: MonthlyResults[],
  kpis: KPIs | null,
  selectedDevice: any,
  sections: string[],
  templateName: string,
  _emailData: any
) => {
  // For now, just generate and download the report
  // In a real implementation, this would integrate with an email service
  console.log('Email functionality not yet implemented. Generating report instead...');
  await generateTemplateReport(inputs, results, kpis, selectedDevice, sections, templateName);
};
