import { formatDate } from '../constants/dateFormats';

/**
 * Get user initials from full name
 * @param name - Full name of the user
 * @returns User initials (max 2 characters)
 */
export const getUserInitials = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '?';
  }
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format last login date for display
 * @param dateString - Date string to format
 * @returns Formatted date string or 'Never' if no date
 */
export const formatLastLogin = (dateString?: string): string => {
  if (!dateString) return 'Never';
  return formatDate(dateString, 'display');
};

/**
 * Get user display name with fallback
 * @param name - User name
 * @param fallback - Fallback text if name is empty
 * @returns Display name
 */
export const getUserDisplayName = (name?: string, fallback: string = 'Unknown Name'): string => {
  return name || fallback;
};

/**
 * Get user email with fallback
 * @param email - User email
 * @param fallback - Fallback text if email is empty
 * @returns Display email
 */
export const getUserDisplayEmail = (email?: string, fallback: string = 'No email'): string => {
  return email || fallback;
};
