import React, { useState, useEffect } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { fetchDevicesFromMRP, refreshDeviceData } from '../utils/deviceApi';

export interface Device {
  id: string;
  model_name: string;
  manufacturer: string;
  msrp: number;
  condition: string;
  warranty_years: number;
  typical_treatment_time: number;
  consumables_per_treatment: number;
  description: string;
}

interface DeviceSelectorProps {
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device | null) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ selectedDevice, onDeviceSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const deviceData = await fetchDevicesFromMRP();
      setDevices(deviceData);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const deviceData = await refreshDeviceData();
      setDevices(deviceData);
    } catch (error) {
      console.error('Error refreshing devices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      device.model_name.toLowerCase().includes(query) ||
      device.manufacturer.toLowerCase().includes(query) ||
      device.description.toLowerCase().includes(query)
    );
  });

  const handleDeviceSelect = (device: Device) => {
    onDeviceSelect(device);
    setIsOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-dark-300 mb-2">
          Select Device from MRP Catalog
        </label>
        <div className="input-field animate-pulse">
          Loading devices...
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-dark-300 mb-2">
        Select Device from MRP Catalog
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input-field w-full text-left flex items-center justify-between"
        >
          <span>
            {selectedDevice 
              ? `${selectedDevice.manufacturer} ${selectedDevice.model_name}`
              : 'Choose a device from MRP catalog...'
            }
          </span>
          <ChevronDown className={`h-4 w-4 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-dark-800 border border-dark-600 rounded-md shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-dark-400">
                  {filteredDevices.length} of {devices.length} devices
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-xs text-dark-400 hover:text-dark-200 flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 text-sm bg-dark-700 border border-dark-600 rounded text-dark-100 placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              
              <div className="mt-2 max-h-64 overflow-y-auto">
                {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => handleDeviceSelect(device)}
                  className="p-3 hover:bg-dark-700 rounded-md cursor-pointer border-b border-dark-700 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-dark-100">
                        {device.manufacturer} {device.model_name}
                      </div>
                      <div className="text-sm text-dark-300 mt-1">
                        {device.description}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-dark-400">
                        <span>MSRP: {formatPrice(device.msrp)}</span>
                        <span>Condition: {device.condition}</span>
                        <span>Warranty: {device.warranty_years}yr</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium text-green-400">
                        {formatPrice(device.msrp)}
                      </div>
                      <div className="text-xs text-dark-400">
                        {device.typical_treatment_time}min tx
                      </div>
                    </div>
                  </div>
                </div>
                ))}
                
                {filteredDevices.length === 0 && searchQuery && (
                  <div className="p-3 text-center text-dark-400 text-sm">
                    No devices found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedDevice && (
        <div className="mt-3 p-3 bg-dark-800 border border-dark-600 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-dark-100">Selected Device</h4>
            <button
              onClick={() => onDeviceSelect(null)}
              className="text-xs text-dark-400 hover:text-dark-200"
            >
              Clear Selection
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-dark-400">Model:</span>
              <div className="font-medium text-dark-100">
                {selectedDevice.manufacturer} {selectedDevice.model_name}
              </div>
            </div>
            <div>
              <span className="text-dark-400">MSRP:</span>
              <div className="font-medium text-green-400">
                {formatPrice(selectedDevice.msrp)}
              </div>
            </div>
            <div>
              <span className="text-dark-400">Condition:</span>
              <div className="text-dark-200 capitalize">
                {selectedDevice.condition}
              </div>
            </div>
            <div>
              <span className="text-dark-400">Warranty:</span>
              <div className="text-dark-200">
                {selectedDevice.warranty_years} years
              </div>
            </div>
            <div>
              <span className="text-dark-400">Treatment Time:</span>
              <div className="text-dark-200">
                {selectedDevice.typical_treatment_time} minutes
              </div>
            </div>
            <div>
              <span className="text-dark-400">Consumables:</span>
              <div className="text-dark-200">
                ${selectedDevice.consumables_per_treatment}/treatment
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-dark-600">
            <div className="text-sm text-dark-300">
              {selectedDevice.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceSelector;
