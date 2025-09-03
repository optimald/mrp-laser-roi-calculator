import React, { useState } from 'react';
import type { CalculatorInputs } from '../utils/calculations';
import { ChevronDown, ChevronRight } from 'lucide-react';
import DeviceSelector, { type Device } from './DeviceSelector';

interface InputPanelProps {
  inputs: CalculatorInputs;
  onInputChange: (section: keyof CalculatorInputs, field: string, value: any) => void;
  onDeviceSelect?: (device: Device | null) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ inputs, onInputChange, onDeviceSelect }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['device', 'financing', 'utilization'])
  );
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleDeviceSelect = (device: Device | null) => {
    setSelectedDevice(device);
    if (device) {
      // Auto-populate form fields with device data
      onInputChange('device', 'msrp', device.msrp);
      onInputChange('device', 'warrantyYears', device.warranty_years);
      onInputChange('utilization', 'avgTreatmentTime', device.typical_treatment_time);
      onInputChange('variableCosts', 'consumables', device.consumables_per_treatment);
    }
    if (onDeviceSelect) {
      onDeviceSelect(device);
    }
  };

  const InputField: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    type?: 'number' | 'currency' | 'percent';
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }> = ({ label, value, onChange, type = 'number', min, max, step, disabled }) => {
    const formatValue = (val: number) => {
      switch (type) {
        case 'currency':
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
        case 'percent':
          return `${val}%`;
        default:
          return val.toString();
      }
    };

    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-dark-300 mb-1">
          {label}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="input-field"
        />
        <div className="text-xs text-dark-400 mt-1">
          {formatValue(value)}
        </div>
      </div>
    );
  };

  const SectionHeader: React.FC<{ title: string; section: string; bgColor: string; hoverColor: string }> = ({ title, section, bgColor, hoverColor }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-3 ${bgColor} ${hoverColor} border-b border-dark-700 transition-colors`}
    >
      <h3 className="font-semibold text-dark-100">{title}</h3>
      {expandedSections.has(section) ? (
        <ChevronDown className="h-4 w-4 text-dark-400" />
      ) : (
        <ChevronRight className="h-4 w-4 text-dark-400" />
      )}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-4">
        <h2 className="text-lg font-bold text-dark-100 mb-4">Input Parameters</h2>
        
        {/* Device & Acquisition */}
        <div className="mb-4">
          <SectionHeader title="Device & Acquisition" section="device" bgColor="bg-blue-900/30" hoverColor="hover:bg-blue-800/40" />
          {expandedSections.has('device') && (
            <div className="p-4 bg-dark-800">
              <DeviceSelector
                selectedDevice={selectedDevice}
                onDeviceSelect={handleDeviceSelect}
              />
              <InputField
                label="Device MSRP"
                value={inputs.device.msrp}
                onChange={(value) => onInputChange('device', 'msrp', value)}
                type="currency"
              />
              <InputField
                label="Discount/Rebate (%)"
                value={inputs.device.discount}
                onChange={(value) => onInputChange('device', 'discount', value)}
                type="percent"
                min={0}
                max={100}
              />
              <InputField
                label="Accessories/Options"
                value={inputs.device.accessories}
                onChange={(value) => onInputChange('device', 'accessories', value)}
                type="currency"
              />
              <InputField
                label="Shipping/Install/Training"
                value={inputs.device.shippingInstall}
                onChange={(value) => onInputChange('device', 'shippingInstall', value)}
                type="currency"
              />
              <InputField
                label="Warranty (years)"
                value={inputs.device.warrantyYears}
                onChange={(value) => onInputChange('device', 'warrantyYears', value)}
                min={1}
                max={10}
              />
              <InputField
                label="Extended Warranty Cost/Year"
                value={inputs.device.extendedWarrantyCost}
                onChange={(value) => onInputChange('device', 'extendedWarrantyCost', value)}
                type="currency"
              />
              <div className="mb-3">
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Depreciation Method
                </label>
                <select
                  value={inputs.device.depreciationMethod}
                  onChange={(e) => onInputChange('device', 'depreciationMethod', e.target.value)}
                  className="input-field"
                >
                  <option value="straight-line">Straight Line</option>
                  <option value="macrs">MACRS</option>
                </select>
              </div>
              <InputField
                label="Depreciation Life (years)"
                value={inputs.device.depreciationLife}
                onChange={(value) => onInputChange('device', 'depreciationLife', value)}
                min={1}
                max={20}
              />
              <InputField
                label="Salvage Value"
                value={inputs.device.salvageValue}
                onChange={(value) => onInputChange('device', 'salvageValue', value)}
                type="currency"
              />
              <InputField
                label="Tax Rate (%)"
                value={inputs.device.taxRate}
                onChange={(value) => onInputChange('device', 'taxRate', value)}
                type="percent"
                min={0}
                max={50}
              />
            </div>
          )}
        </div>

        {/* Financing / Lease */}
        <div className="mb-4">
          <SectionHeader title="Financing / Lease" section="financing" bgColor="bg-green-900/30" hoverColor="hover:bg-green-800/40" />
          {expandedSections.has('financing') && (
            <div className="p-4 bg-dark-800">
              <div className="mb-3">
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Purchase Method
                </label>
                <select
                  value={inputs.financing.purchaseMethod}
                  onChange={(e) => onInputChange('financing', 'purchaseMethod', e.target.value)}
                  className="input-field"
                >
                  <option value="cash">Cash</option>
                  <option value="loan">Term Loan</option>
                  <option value="lease-fmv">Lease (FMV)</option>
                  <option value="lease-capital">Lease (Capital)</option>
                  <option value="promo-0">0% Promo</option>
                </select>
              </div>
              <InputField
                label="Down Payment"
                value={inputs.financing.downPayment}
                onChange={(value) => onInputChange('financing', 'downPayment', value)}
                type="currency"
              />
              <div className="mb-3">
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Down Payment Type
                </label>
                <select
                  value={inputs.financing.downPaymentType}
                  onChange={(e) => onInputChange('financing', 'downPaymentType', e.target.value)}
                  className="input-field"
                >
                  <option value="dollar">Dollar Amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </div>
              <InputField
                label="APR (%)"
                value={inputs.financing.apr}
                onChange={(value) => onInputChange('financing', 'apr', value)}
                type="percent"
                min={0}
                max={30}
                step={0.1}
              />
              <InputField
                label="Term (months)"
                value={inputs.financing.termMonths}
                onChange={(value) => onInputChange('financing', 'termMonths', value)}
                min={1}
                max={120}
              />
              <InputField
                label="Origination/Doc Fees"
                value={inputs.financing.originationFees}
                onChange={(value) => onInputChange('financing', 'originationFees', value)}
                type="currency"
              />
              <InputField
                label="Deferred/No-Pay Promo Months"
                value={inputs.financing.deferredMonths}
                onChange={(value) => onInputChange('financing', 'deferredMonths', value)}
                min={0}
                max={12}
              />
            </div>
          )}
        </div>

        {/* Utilization & Capacity */}
        <div className="mb-4">
          <SectionHeader title="Utilization & Capacity" section="utilization" bgColor="bg-purple-900/30" hoverColor="hover:bg-purple-800/40" />
          {expandedSections.has('utilization') && (
            <div className="p-4 bg-dark-800">
              <InputField
                label="Open Days/Month"
                value={inputs.utilization.openDaysPerMonth}
                onChange={(value) => onInputChange('utilization', 'openDaysPerMonth', value)}
                min={1}
                max={31}
              />
              <InputField
                label="Treatments/Day (avg)"
                value={inputs.utilization.treatmentsPerDay}
                onChange={(value) => onInputChange('utilization', 'treatmentsPerDay', value)}
                min={1}
                max={50}
              />
              <InputField
                label="No-Show Rate (%)"
                value={inputs.utilization.noShowRate}
                onChange={(value) => onInputChange('utilization', 'noShowRate', value)}
                type="percent"
                min={0}
                max={50}
              />
              <InputField
                label="Avg Treatment Time (min)"
                value={inputs.utilization.avgTreatmentTime}
                onChange={(value) => onInputChange('utilization', 'avgTreatmentTime', value)}
                min={5}
                max={120}
              />
            </div>
          )}
        </div>

        {/* Pricing & Revenue */}
        <div className="mb-4">
          <SectionHeader title="Pricing & Revenue" section="pricing" bgColor="bg-orange-900/30" hoverColor="hover:bg-orange-800/40" />
          {expandedSections.has('pricing') && (
            <div className="p-4 bg-dark-800">
              <InputField
                label="List Price/Treatment"
                value={inputs.pricing.listPricePerTreatment}
                onChange={(value) => onInputChange('pricing', 'listPricePerTreatment', value)}
                type="currency"
              />
              <InputField
                label="Discounts/Promos (%)"
                value={inputs.pricing.discountPercent}
                onChange={(value) => onInputChange('pricing', 'discountPercent', value)}
                type="percent"
                min={0}
                max={50}
              />
              <InputField
                label="Upsells/Cross-sells Avg $/Tx"
                value={inputs.pricing.upsellAvgPerTx}
                onChange={(value) => onInputChange('pricing', 'upsellAvgPerTx', value)}
                type="currency"
              />
              <InputField
                label="Upsell Attach Rate (%)"
                value={inputs.pricing.upsellAttachRate}
                onChange={(value) => onInputChange('pricing', 'upsellAttachRate', value)}
                type="percent"
                min={0}
                max={100}
              />
              <InputField
                label="Membership MRR"
                value={inputs.pricing.membershipMRR}
                onChange={(value) => onInputChange('pricing', 'membershipMRR', value)}
                type="currency"
              />
              <InputField
                label="Membership % of Patients"
                value={inputs.pricing.membershipPercent}
                onChange={(value) => onInputChange('pricing', 'membershipPercent', value)}
                type="percent"
                min={0}
                max={100}
              />
            </div>
          )}
        </div>

        {/* Variable Costs */}
        <div className="mb-4">
          <SectionHeader title="Variable Costs (per treatment)" section="variableCosts" bgColor="bg-red-900/30" hoverColor="hover:bg-red-800/40" />
          {expandedSections.has('variableCosts') && (
            <div className="p-4 bg-dark-800">
              <InputField
                label="Consumables"
                value={inputs.variableCosts.consumables}
                onChange={(value) => onInputChange('variableCosts', 'consumables', value)}
                type="currency"
              />
              <InputField
                label="Disposables"
                value={inputs.variableCosts.disposables}
                onChange={(value) => onInputChange('variableCosts', 'disposables', value)}
                type="currency"
              />
              <InputField
                label="Clinical Time Cost ($/hr)"
                value={inputs.variableCosts.clinicalTimeCost}
                onChange={(value) => onInputChange('variableCosts', 'clinicalTimeCost', value)}
                type="currency"
              />
              <InputField
                label="Room Time Overhead ($/hr)"
                value={inputs.variableCosts.roomTimeOverhead}
                onChange={(value) => onInputChange('variableCosts', 'roomTimeOverhead', value)}
                type="currency"
              />
              <InputField
                label="Payment Processing Fee (%)"
                value={inputs.variableCosts.paymentProcessingPercent}
                onChange={(value) => onInputChange('variableCosts', 'paymentProcessingPercent', value)}
                type="percent"
                min={0}
                max={10}
                step={0.1}
              />
              <InputField
                label="Payment Processing Fixed ($)"
                value={inputs.variableCosts.paymentProcessingFixed}
                onChange={(value) => onInputChange('variableCosts', 'paymentProcessingFixed', value)}
                type="currency"
                step={0.01}
              />
            </div>
          )}
        </div>

        {/* Fixed Opex */}
        <div className="mb-4">
          <SectionHeader title="Fixed Opex (monthly)" section="fixedOpex" bgColor="bg-teal-900/30" hoverColor="hover:bg-teal-800/40" />
          {expandedSections.has('fixedOpex') && (
            <div className="p-4 bg-dark-800">
              <InputField
                label="Marketing Budget"
                value={inputs.fixedOpex.marketingBudget}
                onChange={(value) => onInputChange('fixedOpex', 'marketingBudget', value)}
                type="currency"
              />
              <InputField
                label="Staff Salary Allocation"
                value={inputs.fixedOpex.staffSalaryAllocation}
                onChange={(value) => onInputChange('fixedOpex', 'staffSalaryAllocation', value)}
                type="currency"
              />
              <InputField
                label="Rent Allocation"
                value={inputs.fixedOpex.rentAllocation}
                onChange={(value) => onInputChange('fixedOpex', 'rentAllocation', value)}
                type="currency"
              />
              <InputField
                label="Insurance"
                value={inputs.fixedOpex.insurance}
                onChange={(value) => onInputChange('fixedOpex', 'insurance', value)}
                type="currency"
              />
              <InputField
                label="Software/EMR/Booking"
                value={inputs.fixedOpex.softwareEMR}
                onChange={(value) => onInputChange('fixedOpex', 'softwareEMR', value)}
                type="currency"
              />
              <InputField
                label="Maintenance (post-warranty)"
                value={inputs.fixedOpex.maintenancePostWarranty}
                onChange={(value) => onInputChange('fixedOpex', 'maintenancePostWarranty', value)}
                type="currency"
              />
              <InputField
                label="Calibration/Service Contracts"
                value={inputs.fixedOpex.calibrationService}
                onChange={(value) => onInputChange('fixedOpex', 'calibrationService', value)}
                type="currency"
              />
              <InputField
                label="Downtime Reserve (%)"
                value={inputs.fixedOpex.downtimeReserve}
                onChange={(value) => onInputChange('fixedOpex', 'downtimeReserve', value)}
                type="percent"
                min={0}
                max={20}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
