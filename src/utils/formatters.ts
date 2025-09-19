/**
 * Format currency value for display
 * @param amount - Currency amount to format
 * @param currency - Currency code (default: 'MMK')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'MMK'): string => {
  if (amount === undefined || amount === null) return 'N/A';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl fails
    return `${currency} ${amount.toLocaleString()}`;
  }
};

/**
 * Format percentage value for display
 * @param value - Percentage value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (value === undefined || value === null) return 'N/A';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with commas for display
 * @param value - Number to format
 * @returns Formatted number string with commas
 */
export const formatNumber = (value: number): string => {
  if (value === undefined || value === null) return 'N/A';
  
  return value.toLocaleString();
};