// API utilities for fetching device data from MRP catalog

export interface DeviceApiResponse {
  devices: Device[];
  total: number;
  lastUpdated: string;
}

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
  image_url?: string;
  mrp_url?: string;
  source_url?: string;
}

// For now, we'll use local data, but this can be extended to call the scraper API
export const fetchDevicesFromMRP = async (): Promise<Device[]> => {
  try {
    // In a real implementation, this would call the scraper API
    // const response = await fetch('/api/devices');
    // const data = await response.json();
    // return data.devices;
    
    // For now, return local data
    const devices = await import('../data/devices.json');
    return devices.default as Device[];
  } catch (error) {
    console.error('Error fetching devices from MRP:', error);
    return [];
  }
};

// Function to refresh device data from the scraper
export const refreshDeviceData = async (): Promise<Device[]> => {
  try {
    // This would call the scraper service to get fresh data
    // const response = await fetch('/api/devices/refresh', { method: 'POST' });
    // const data = await response.json();
    // return data.devices;
    
    // For now, return the same local data
    return fetchDevicesFromMRP();
  } catch (error) {
    console.error('Error refreshing device data:', error);
    return [];
  }
};

// Function to search devices by manufacturer or model
export const searchDevices = async (query: string): Promise<Device[]> => {
  const devices = await fetchDevicesFromMRP();
  
  if (!query.trim()) {
    return devices;
  }
  
  const searchTerm = query.toLowerCase();
  return devices.filter(device => 
    device.model_name.toLowerCase().includes(searchTerm) ||
    device.manufacturer.toLowerCase().includes(searchTerm) ||
    device.description.toLowerCase().includes(searchTerm)
  );
};
