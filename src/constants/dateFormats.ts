// Standard date formats used throughout the application
export const DATE_FORMATS = {
  // Display formats
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  displayShort: 'MMM dd',
  displayTime: 'HH:mm',
  
  // Input formats
  input: 'yyyy-MM-dd',
  inputWithTime: 'yyyy-MM-dd HH:mm',
  
  // API formats
  api: 'yyyy-MM-dd',
  apiWithTime: 'yyyy-MM-ddTHH:mm:ss.SSSZ',
  
  // Relative time thresholds (in milliseconds)
  relativeTimeThresholds: {
    justNow: 60 * 1000, // 1 minute
    minutes: 60 * 60 * 1000, // 1 hour
    hours: 24 * 60 * 60 * 1000, // 1 day
    days: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
} as const;

// Date utility functions
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  
  const { justNow, minutes, hours, days } = DATE_FORMATS.relativeTimeThresholds;
  
  if (diffInMs < justNow) return 'Just now';
  if (diffInMs < minutes) return `${Math.floor(diffInMs / (60 * 1000))} minutes ago`;
  if (diffInMs < hours) return `${Math.floor(diffInMs / (60 * 60 * 1000))} hours ago`;
  if (diffInMs < days) return `${Math.floor(diffInMs / (24 * 60 * 60 * 1000))} days ago`;
  
  return targetDate.toLocaleDateString();
};

export const formatDate = (date: Date | string, format: keyof typeof DATE_FORMATS = 'display'): string => {
  const targetDate = new Date(date);
  
  switch (format) {
    case 'display':
      return targetDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    case 'displayWithTime':
      return targetDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'displayShort':
      return targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case 'displayTime':
      return targetDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'input':
      return targetDate.toISOString().split('T')[0];
    default:
      return targetDate.toLocaleDateString();
  }
}; 