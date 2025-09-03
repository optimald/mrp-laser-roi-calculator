// Core financial calculation utilities for the MRP Calculator

export interface DeviceInputs {
  msrp: number;
  discount: number;
  accessories: number;
  shippingInstall: number;
  warrantyYears: number;
  extendedWarrantyCost: number;
  depreciationMethod: 'straight-line' | 'macrs';
  depreciationLife: number;
  salvageValue: number;
  section179: boolean;
  taxRate: number;
}

export interface FinancingInputs {
  purchaseMethod: 'cash' | 'loan' | 'lease-fmv' | 'lease-capital' | 'promo-0';
  downPayment: number;
  downPaymentType: 'dollar' | 'percent';
  apr: number;
  termMonths: number;
  paymentFrequency: 'monthly' | 'quarterly';
  balloonResidual: number;
  balloonType: 'dollar' | 'percent';
  originationFees: number;
  deferredMonths: number;
  prepaymentPenalty: number;
  includeSalesTax: boolean;
  salesTaxRate: number;
}

export interface UtilizationInputs {
  openDaysPerMonth: number;
  treatmentsPerDay: number;
  utilizationRamp: number[];
  noShowRate: number;
  avgTreatmentTime: number;
  seasonality: number[];
}

export interface PricingInputs {
  listPricePerTreatment: number;
  discountPercent: number;
  packages: Array<{
    sessions: number;
    price: number;
    attachRate: number;
  }>;
  membershipMRR: number;
  membershipPercent: number;
  upsellAvgPerTx: number;
  upsellAttachRate: number;
}

export interface VariableCosts {
  consumables: number;
  disposables: number;
  clinicalTimeCost: number;
  roomTimeOverhead: number;
  paymentProcessingPercent: number;
  paymentProcessingFixed: number;
}

export interface FixedOpex {
  marketingBudget: number;
  staffSalaryAllocation: number;
  rentAllocation: number;
  insurance: number;
  softwareEMR: number;
  maintenancePostWarranty: number;
  calibrationService: number;
  downtimeReserve: number;
}

export interface CalculatorInputs {
  device: DeviceInputs;
  financing: FinancingInputs;
  utilization: UtilizationInputs;
  pricing: PricingInputs;
  variableCosts: VariableCosts;
  fixedOpex: FixedOpex;
}

export interface MonthlyResults {
  month: number;
  treatments: number;
  revenue: number;
  variableCosts: number;
  grossProfit: number;
  fixedOpex: number;
  ebitda: number;
  depreciation: number;
  interest: number;
  ebit: number;
  taxes: number;
  netIncome: number;
  cashFlow: number;
  cumulativeCash: number;
  loanBalance: number;
}

export interface KPIs {
  monthlyPayment: number;
  monthlyRevenue: number;
  monthlyEBITDA: number;
  breakevenTreatmentsPerDay: number;
  paybackMonths: number;
  npv: number;
  irr: number;
  dscr: number;
}

// Loan payment calculation (PMT function)
export function calculatePMT(apr: number, termMonths: number, principal: number): number {
  const r = apr / 12;
  if (r === 0) return principal / termMonths;
  return (r * principal) / (1 - Math.pow(1 + r, -termMonths));
}

// Calculate monthly treatment volume with ramp and seasonality
export function calculateMonthlyTreatments(
  openDays: number,
  treatmentsPerDay: number,
  noShowRate: number,
  month: number,
  ramp: number[],
  seasonality: number[]
): number {
  const rampFactor = month <= ramp.length ? ramp[month - 1] / 100 : 1;
  const seasonalityFactor = seasonality[(month - 1) % 12] / 100;
  
  return openDays * treatmentsPerDay * (1 - noShowRate / 100) * rampFactor * seasonalityFactor;
}

// Calculate net price per treatment
export function calculateNetPricePerTreatment(
  listPrice: number,
  discount: number,
  upsellAvg: number,
  upsellAttachRate: number
): number {
  const discountedPrice = listPrice * (1 - discount / 100);
  const upsellRevenue = upsellAvg * (upsellAttachRate / 100);
  return discountedPrice + upsellRevenue;
}

// Calculate variable cost per treatment
export function calculateVariableCostPerTreatment(
  consumables: number,
  disposables: number,
  clinicalTimeCost: number,
  avgTreatmentTime: number,
  roomTimeOverhead: number,
  paymentProcessingPercent: number,
  paymentProcessingFixed: number,
  netPrice: number
): number {
  const clinicalCost = (clinicalTimeCost * avgTreatmentTime) / 60;
  const roomCost = (roomTimeOverhead * avgTreatmentTime) / 60;
  const processingCost = (netPrice * paymentProcessingPercent / 100) + paymentProcessingFixed;
  
  return consumables + disposables + clinicalCost + roomCost + processingCost;
}

// Calculate depreciation
export function calculateDepreciation(
  method: 'straight-line' | 'macrs',
  cost: number,
  salvageValue: number,
  life: number,
  month: number
): number {
  if (method === 'straight-line') {
    return (cost - salvageValue) / (life * 12);
  }
  
  // Simplified MACRS - 5-year property
  const macrsRates = [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576];
  const year = Math.floor((month - 1) / 12);
  if (year >= macrsRates.length) return 0;
  
  return (cost * macrsRates[year]) / 12;
}

// Calculate monthly results for a given month
export function calculateMonthlyResults(
  inputs: CalculatorInputs,
  month: number,
  previousBalance: number = 0,
  previousCumulativeCash: number = 0
): MonthlyResults {
  const { device, financing, utilization, pricing, variableCosts, fixedOpex } = inputs;
  
  // Calculate treatments
  const treatments = calculateMonthlyTreatments(
    utilization.openDaysPerMonth,
    utilization.treatmentsPerDay,
    utilization.noShowRate,
    month,
    utilization.utilizationRamp,
    utilization.seasonality
  );
  
  // Calculate revenue
  const netPricePerTx = calculateNetPricePerTreatment(
    pricing.listPricePerTreatment,
    pricing.discountPercent,
    pricing.upsellAvgPerTx,
    pricing.upsellAttachRate
  );
  
  const revenue = treatments * netPricePerTx + pricing.membershipMRR * (pricing.membershipPercent / 100);
  
  // Calculate variable costs
  const variableCostPerTx = calculateVariableCostPerTreatment(
    variableCosts.consumables,
    variableCosts.disposables,
    variableCosts.clinicalTimeCost,
    utilization.avgTreatmentTime,
    variableCosts.roomTimeOverhead,
    variableCosts.paymentProcessingPercent,
    variableCosts.paymentProcessingFixed,
    netPricePerTx
  );
  
  const totalVariableCosts = treatments * variableCostPerTx;
  const grossProfit = revenue - totalVariableCosts;
  
  // Calculate fixed costs
  const totalFixedOpex = Object.values(fixedOpex).reduce((sum, cost) => sum + cost, 0);
  
  // Calculate depreciation
  const totalCost = device.msrp - device.discount + device.accessories + device.shippingInstall;
  const depreciation = calculateDepreciation(
    device.depreciationMethod,
    totalCost,
    device.salvageValue,
    device.depreciationLife,
    month
  );
  
  // Calculate financing
  let monthlyPayment = 0;
  let interest = 0;
  let newBalance = previousBalance;
  
  if (financing.purchaseMethod === 'loan') {
    const principal = totalCost - (financing.downPaymentType === 'percent' ? 
      totalCost * financing.downPayment / 100 : financing.downPayment);
    
    if (month === 1) {
      newBalance = principal;
    }
    
    monthlyPayment = calculatePMT(financing.apr, financing.termMonths, principal);
    interest = newBalance * (financing.apr / 12);
    newBalance = Math.max(0, newBalance - (monthlyPayment - interest));
  }
  
  const ebitda = grossProfit - totalFixedOpex;
  const ebit = ebitda - depreciation;
  const taxes = Math.max(0, ebit * (device.taxRate / 100));
  const netIncome = ebit - taxes;
  
  // Calculate cash flow
  let cashFlow = ebitda - taxes;
  
  // Handle initial investment
  if (month === 1) {
    if (financing.purchaseMethod === 'cash') {
      cashFlow -= totalCost;
    } else if (financing.purchaseMethod === 'loan') {
      // For loans, subtract the down payment in month 1
      const downPaymentAmount = financing.downPaymentType === 'percent' ? 
        totalCost * financing.downPayment / 100 : financing.downPayment;
      cashFlow -= downPaymentAmount;
    }
  }
  
  // For loans, subtract monthly payment from cash flow (this is the correct approach)
  if (financing.purchaseMethod === 'loan') {
    cashFlow -= monthlyPayment;
  }
  
  const cumulativeCash = previousCumulativeCash + cashFlow;
  
  return {
    month,
    treatments,
    revenue,
    variableCosts: totalVariableCosts,
    grossProfit,
    fixedOpex: totalFixedOpex,
    ebitda,
    depreciation,
    interest,
    ebit,
    taxes,
    netIncome,
    cashFlow,
    cumulativeCash,
    loanBalance: newBalance
  };
}

// Calculate all monthly results
export function calculateAllResults(inputs: CalculatorInputs, months: number = 60): MonthlyResults[] {
  const results: MonthlyResults[] = [];
  let previousBalance = 0;
  let previousCumulativeCash = 0;
  
  for (let month = 1; month <= months; month++) {
    const result = calculateMonthlyResults(inputs, month, previousBalance, previousCumulativeCash);
    results.push(result);
    previousBalance = result.loanBalance;
    previousCumulativeCash = result.cumulativeCash;
  }
  
  return results;
}

// Calculate KPIs
export function calculateKPIs(results: MonthlyResults[], inputs: CalculatorInputs): KPIs {
  // const lastResult = results[results.length - 1];
  const avgMonthlyRevenue = results.reduce((sum, r) => sum + r.revenue, 0) / results.length;
  const avgMonthlyEBITDA = results.reduce((sum, r) => sum + r.ebitda, 0) / results.length;
  
  // Calculate monthly payment
  let monthlyPayment = 0;
  if (inputs.financing.purchaseMethod === 'loan') {
    const totalCost = inputs.device.msrp - inputs.device.discount + inputs.device.accessories + inputs.device.shippingInstall;
    const principal = totalCost - (inputs.financing.downPaymentType === 'percent' ? 
      totalCost * inputs.financing.downPayment / 100 : inputs.financing.downPayment);
    monthlyPayment = calculatePMT(inputs.financing.apr, inputs.financing.termMonths, principal);
  }
  
  // Calculate breakeven treatments per day
  const grossMarginPerTx = calculateNetPricePerTreatment(
    inputs.pricing.listPricePerTreatment,
    inputs.pricing.discountPercent,
    inputs.pricing.upsellAvgPerTx,
    inputs.pricing.upsellAttachRate
  ) - calculateVariableCostPerTreatment(
    inputs.variableCosts.consumables,
    inputs.variableCosts.disposables,
    inputs.variableCosts.clinicalTimeCost,
    inputs.utilization.avgTreatmentTime,
    inputs.variableCosts.roomTimeOverhead,
    inputs.variableCosts.paymentProcessingPercent,
    inputs.variableCosts.paymentProcessingFixed,
    calculateNetPricePerTreatment(
      inputs.pricing.listPricePerTreatment,
      inputs.pricing.discountPercent,
      inputs.pricing.upsellAvgPerTx,
      inputs.pricing.upsellAttachRate
    )
  );
  
  const totalFixedCosts = Object.values(inputs.fixedOpex).reduce((sum, cost) => sum + cost, 0);
  const breakevenTreatmentsPerMonth = (totalFixedCosts + monthlyPayment) / grossMarginPerTx;
  const breakevenTreatmentsPerDay = breakevenTreatmentsPerMonth / inputs.utilization.openDaysPerMonth;
  
  // Calculate payback period
  const paybackMonth = results.findIndex(r => r.cumulativeCash >= 0) + 1;
  const paybackMonths = paybackMonth > 0 ? paybackMonth : results.length;
  
  // Calculate NPV (simplified)
  const discountRate = 0.10; // 10% discount rate
  const npv = results.reduce((sum, r, index) => {
    return sum + (r.cashFlow / Math.pow(1 + discountRate, index / 12));
  }, 0);
  
  // Calculate IRR (simplified approximation)
  const irr = calculateIRR(results.map(r => r.cashFlow));
  
  // Calculate DSCR
  const dscr = avgMonthlyEBITDA / Math.max(monthlyPayment, 1);
  
  return {
    monthlyPayment,
    monthlyRevenue: avgMonthlyRevenue,
    monthlyEBITDA: avgMonthlyEBITDA,
    breakevenTreatmentsPerDay,
    paybackMonths,
    npv,
    irr,
    dscr
  };
}

// Simplified IRR calculation
function calculateIRR(cashFlows: number[]): number {
  // This is a simplified IRR calculation
  // In a real implementation, you'd use Newton-Raphson method
  let irr = 0.1; // Start with 10%
  let npv = 0;
  
  for (let i = 0; i < 100; i++) {
    npv = cashFlows.reduce((sum, cf, index) => {
      return sum + (cf / Math.pow(1 + irr, index / 12));
    }, 0);
    
    if (Math.abs(npv) < 0.01) break;
    
    irr += npv > 0 ? 0.01 : -0.01;
  }
  
  return irr * 100; // Return as percentage
}

// Default inputs for initial state
export const defaultInputs: CalculatorInputs = {
  device: {
    msrp: 150000,
    discount: 10,
    accessories: 5000,
    shippingInstall: 2000,
    warrantyYears: 2,
    extendedWarrantyCost: 2000,
    depreciationMethod: 'straight-line',
    depreciationLife: 5,
    salvageValue: 15000,
    section179: false,
    taxRate: 25
  },
  financing: {
    purchaseMethod: 'loan',
    downPayment: 30,
    downPaymentType: 'percent',
    apr: 5.5,
    termMonths: 84,
    paymentFrequency: 'monthly',
    balloonResidual: 0,
    balloonType: 'dollar',
    originationFees: 500,
    deferredMonths: 0,
    prepaymentPenalty: 0,
    includeSalesTax: true,
    salesTaxRate: 8.5
  },
  utilization: {
    openDaysPerMonth: 22,
    treatmentsPerDay: 15,
    utilizationRamp: [40, 60, 80, 90, 95, 100],
    noShowRate: 5,
    avgTreatmentTime: 30,
    seasonality: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
  },
  pricing: {
    listPricePerTreatment: 500,
    discountPercent: 5,
    packages: [
      { sessions: 6, price: 2500, attachRate: 30 },
      { sessions: 12, price: 4500, attachRate: 20 }
    ],
    membershipMRR: 300,
    membershipPercent: 20,
    upsellAvgPerTx: 100,
    upsellAttachRate: 30
  },
  variableCosts: {
    consumables: 15,
    disposables: 5,
    clinicalTimeCost: 150,
    roomTimeOverhead: 25,
    paymentProcessingPercent: 2.9,
    paymentProcessingFixed: 0.30
  },
  fixedOpex: {
    marketingBudget: 2000,
    staffSalaryAllocation: 1500,
    rentAllocation: 1200,
    insurance: 200,
    softwareEMR: 300,
    maintenancePostWarranty: 300,
    calibrationService: 150,
    downtimeReserve: 3
  }
};
