import { Region, Township } from '../types/location';
import { getStatusColor } from '../constants/status';

export const getStatusCount = (items: (Region | Township)[], status: string): number => {
  return items.filter(item => item.status === status).length;
};

export const filterLocations = (
  items: (Region | Township)[],
  searchTerm: string,
  statusFilter: string
) => {
  return items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export const getPageTitle = (selectedRegion: Region | null) => {
  if (!selectedRegion) {
    return 'Location Management';
  }
  return `${selectedRegion.name} - Townships`;
};

export const getPageSubtitle = (selectedRegion: Region | null) => {
  if (!selectedRegion) {
    return 'Manage regions and their townships';
  }
  return `Manage townships in ${selectedRegion.name}`;
};

export const getBreadcrumbs = (selectedRegion: Region | null) => {
  if (!selectedRegion) {
    return 'Dashboard / Location Management';
  }
  return `Dashboard / Location Management / ${selectedRegion.name}`;
};

// Re-export status utilities for convenience
export { getStatusColor }; 