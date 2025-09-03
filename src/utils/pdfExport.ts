import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { CalculatorInputs, MonthlyResults, KPIs } from './calculations';

export const exportToPDF = async (
  inputs: CalculatorInputs,
  results: MonthlyResults[],
  kpis: KPIs,
  practiceName: string = 'Your Practice',
  selectedDevice?: { image_url?: string; model_name?: string; manufacturer?: string; mrp_url?: string } | null
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize: number = 10) => {
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
  const addLine = (y: number) => {
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, y, pageWidth - 20, y);
    return y + 5;
  };

  // Helper function to load and add image
  const addImage = async (imageUrl: string, x: number, y: number, width: number, height: number): Promise<boolean> => {
    try {
      // Create a temporary image element to load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          try {
            // Convert image to base64
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            // Add image to PDF
            pdf.addImage(dataURL, 'JPEG', x, y, width, height);
            resolve(true);
          } catch (error) {
            console.error('Error adding image to PDF:', error);
            resolve(false);
          }
        };
        
        img.onerror = () => {
          console.error('Error loading image:', imageUrl);
          resolve(false);
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error in addImage:', error);
      return false;
    }
  };

  // Header
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  yPosition = addText('MRP Aesthetics Laser ROI Calculator', 20, 10, pageWidth - 40, 12);
  pdf.setTextColor(0, 0, 0);

  // Practice Information - Start after header with proper spacing
  yPosition = addText(`Practice: ${practiceName}`, 20, 35, pageWidth - 40, 12);
  yPosition = addText(`Report Date: ${new Date().toLocaleDateString()}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addLine(yPosition + 5);

  // Executive Summary
  yPosition = addText('Executive Summary', 20, yPosition + 5, pageWidth - 40, 14);
  yPosition = addText(`Monthly Payment: $${kpis.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition + 3, pageWidth - 40, 10);
  yPosition = addText(`Monthly Revenue: $${kpis.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Monthly EBITDA: $${kpis.monthlyEBITDA.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Breakeven Treatments/Day: ${kpis.breakevenTreatmentsPerDay.toFixed(1)}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Payback Period: ${kpis.paybackMonths.toFixed(1)} months`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`NPV: $${kpis.npv.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addLine(yPosition + 5);

  // Device Information
  yPosition = addText('Device & Acquisition Details', 20, yPosition + 5, pageWidth - 40, 14);
  
  // Add device image if available
  if (selectedDevice?.image_url) {
    const imageWidth = 40;
    const imageHeight = 30;
    const imageAdded = await addImage(selectedDevice.image_url, 20, yPosition + 3, imageWidth, imageHeight);
    if (imageAdded) {
      // Add device details next to the image
      const textStartX = 70;
      yPosition = addText(`${selectedDevice.manufacturer} ${selectedDevice.model_name}`, textStartX, yPosition + 8, pageWidth - textStartX - 20, 12);
      if (selectedDevice.mrp_url) {
        yPosition = addText(`View on MRP.io: ${selectedDevice.mrp_url}`, textStartX, yPosition, pageWidth - textStartX - 20, 9);
      }
      yPosition += 5;
    }
  }
  
  yPosition = addText(`Device MSRP: $${inputs.device.msrp.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition + 3, pageWidth - 40, 10);
  yPosition = addText(`Discount: ${inputs.device.discount}%`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Accessories: $${inputs.device.accessories.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Shipping/Install: $${inputs.device.shippingInstall.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Total Cost: $${(inputs.device.msrp - inputs.device.discount + inputs.device.accessories + inputs.device.shippingInstall).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addLine(yPosition + 5);

  // Financing Information
  yPosition = addText('Financing Details', 20, yPosition + 5, pageWidth - 40, 14);
  yPosition = addText(`Purchase Method: ${inputs.financing.purchaseMethod.replace('-', ' ').toUpperCase()}`, 20, yPosition + 3, pageWidth - 40, 10);
  yPosition = addText(`APR: ${inputs.financing.apr}%`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Term: ${inputs.financing.termMonths} months`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Down Payment: ${inputs.financing.downPaymentType === 'percent' ? inputs.financing.downPayment + '%' : '$' + inputs.financing.downPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addLine(yPosition + 5);

  // Monthly P&L Table (First 12 months)
  yPosition = addText('Monthly P&L Summary (First 12 Months)', 20, yPosition + 5, pageWidth - 40, 14);
  
  // Table headers
  const tableHeaders = ['Month', 'Treatments', 'Revenue', 'EBITDA', 'Cash Flow', 'Cumulative Cash'];
  const colWidths = [15, 20, 25, 25, 25, 30];
  let xPosition = 20;
  
  // Draw table headers
  pdf.setFillColor(240, 240, 240);
  pdf.rect(xPosition, yPosition, colWidths.reduce((sum, width) => sum + width, 0), 8, 'F');
  pdf.setTextColor(0, 0, 0);
  
  tableHeaders.forEach((header, index) => {
    pdf.text(header, xPosition + 2, yPosition + 5);
    xPosition += colWidths[index];
  });
  
  yPosition += 8;
  
  // Draw table rows
  results.slice(0, 12).forEach((result) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    
    xPosition = 20;
    const rowData = [
      result.month.toString(),
      Math.round(result.treatments).toString(),
      `$${result.revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      `$${result.ebitda.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      `$${result.cashFlow.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      `$${result.cumulativeCash.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    ];
    
    rowData.forEach((data, colIndex) => {
      pdf.text(data, xPosition + 2, yPosition + 5);
      xPosition += colWidths[colIndex];
    });
    
    yPosition += 6;
  });

  // Add new page for assumptions
  pdf.addPage();
  yPosition = 20;

  // Assumptions
  yPosition = addText('Key Assumptions', 20, yPosition, pageWidth - 40, 14);
  yPosition = addLine(yPosition + 5);

  // Utilization Assumptions
  yPosition = addText('Utilization & Capacity', 20, yPosition + 5, pageWidth - 40, 12);
  yPosition = addText(`Open Days/Month: ${inputs.utilization.openDaysPerMonth}`, 20, yPosition + 3, pageWidth - 40, 10);
  yPosition = addText(`Treatments/Day: ${inputs.utilization.treatmentsPerDay}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`No-Show Rate: ${inputs.utilization.noShowRate}%`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Avg Treatment Time: ${inputs.utilization.avgTreatmentTime} minutes`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addLine(yPosition + 5);

  // Pricing Assumptions
  yPosition = addText('Pricing & Revenue', 20, yPosition + 5, pageWidth - 40, 12);
  yPosition = addText(`List Price/Treatment: $${inputs.pricing.listPricePerTreatment}`, 20, yPosition + 3, pageWidth - 40, 10);
  yPosition = addText(`Discount: ${inputs.pricing.discountPercent}%`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Upsell Avg/Tx: $${inputs.pricing.upsellAvgPerTx}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Upsell Attach Rate: ${inputs.pricing.upsellAttachRate}%`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addLine(yPosition + 5);

  // Variable Costs
  yPosition = addText('Variable Costs (per treatment)', 20, yPosition + 5, pageWidth - 40, 12);
  yPosition = addText(`Consumables: $${inputs.variableCosts.consumables}`, 20, yPosition + 3, pageWidth - 40, 10);
  yPosition = addText(`Disposables: $${inputs.variableCosts.disposables}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Clinical Time Cost: $${inputs.variableCosts.clinicalTimeCost}/hr`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Room Time Overhead: $${inputs.variableCosts.roomTimeOverhead}/hr`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addLine(yPosition + 5);

  // Fixed Opex
  yPosition = addText('Fixed Operating Expenses (monthly)', 20, yPosition + 5, pageWidth - 40, 12);
  yPosition = addText(`Marketing Budget: $${inputs.fixedOpex.marketingBudget}`, 20, yPosition + 3, pageWidth - 40, 10);
  yPosition = addText(`Staff Salary Allocation: $${inputs.fixedOpex.staffSalaryAllocation}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Rent Allocation: $${inputs.fixedOpex.rentAllocation}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Insurance: $${inputs.fixedOpex.insurance}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Software/EMR: $${inputs.fixedOpex.softwareEMR}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addText(`Maintenance: $${inputs.fixedOpex.maintenancePostWarranty}`, 20, yPosition, pageWidth - 40, 10);
  yPosition = addLine(yPosition + 5);

  // Disclaimer
  yPosition = addText('Disclaimer', 20, yPosition + 5, pageWidth - 40, 12);
  yPosition = addText('This analysis is for illustrative purposes only and does not constitute financial, tax, or legal advice. Actual results may vary based on market conditions, operational factors, and other variables not accounted for in this model.', 20, yPosition + 3, pageWidth - 40, 9);
  yPosition = addText('Please consult with qualified professionals for advice specific to your situation.', 20, yPosition + 3, pageWidth - 40, 9);

  // Save the PDF
  const fileName = `MRP_Laser_ROI_Analysis_${practiceName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export const exportChartsToPDF = async () => {
  const chartsContainer = document.getElementById('charts-container');
  if (!chartsContainer) return;

  const canvas = await html2canvas(chartsContainer, {
    backgroundColor: '#0f172a',
    scale: 2
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  let position = 0;

  pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save('MRP_Laser_Charts.pdf');
};
