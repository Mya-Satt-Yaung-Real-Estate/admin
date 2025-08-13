import { getStatusColor, getStatusLabel } from '../constants/status';
import { STATUS_OPTIONS } from '../constants/filters';

/**
 * Get status display configuration for boolean active status
 * @param isActive - Boolean indicating if item is active
 * @returns Status display object with label and color
 */
export const getStatusDisplay = (isActive: boolean) => {
  const status = isActive ? STATUS_OPTIONS.active : STATUS_OPTIONS.inactive;
  const color = getStatusColor(status);
  
  return {
    label: getStatusLabel(status),
    color: color === 'primary' || color === 'secondary' ? 'default' : color,
  };
};

/**
 * Get status display configuration for string status
 * @param status - Status string
 * @returns Status display object with label and color
 */
export const getStatusDisplayFromString = (status: string) => {
  const color = getStatusColor(status);
  
  return {
    label: getStatusLabel(status),
    color: color === 'primary' || color === 'secondary' ? 'default' : color,
  };
};

/**
 * Check if status is active
 * @param status - Status string or boolean
 * @returns Boolean indicating if status is active
 */
export const isStatusActive = (status: string | boolean): boolean => {
  if (typeof status === 'boolean') {
    return status;
  }
  return status === STATUS_OPTIONS.active;
};

/**
 * Get status chip color for MUI Chip component
 * @param status - Status string or boolean
 * @returns Color string compatible with MUI Chip
 */
export const getStatusChipColor = (status: string | boolean): 'success' | 'error' | 'warning' | 'default' | 'info' => {
  if (typeof status === 'boolean') {
    return status ? 'success' : 'default';
  }
  
  const color = getStatusColor(status);
  return color === 'primary' || color === 'secondary' ? 'default' : color;
};
