// Dayjs configuration for Myanmar timezone (UTC+6:30)
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Myanmar timezone constant (UTC+6:30)
export const MYANMAR_TIMEZONE = 'Asia/Yangon';

/**
 * Get current time in Myanmar timezone
 */
export const getMyanmarTime = () => {
  return dayjs().tz(MYANMAR_TIMEZONE);
};

/**
 * Convert a date to Myanmar timezone
 */
export const toMyanmarTime = (date: string | Date | dayjs.Dayjs) => {
  if (dayjs.isDayjs(date)) {
    return date.tz(MYANMAR_TIMEZONE);
  }
  return dayjs(date).tz(MYANMAR_TIMEZONE);
};

/**
 * Format date in Myanmar timezone
 */
export const formatMyanmarDate = (
  date: string | Date | dayjs.Dayjs,
  format: string = 'YYYY-MM-DD HH:mm:ss'
) => {
  return toMyanmarTime(date).format(format);
};

/**
 * Convert Myanmar time to UTC for API
 */
export const myanmarTimeToUTC = (myanmarTime: dayjs.Dayjs | string) => {
  const dt = typeof myanmarTime === 'string' 
    ? dayjs.tz(myanmarTime, MYANMAR_TIMEZONE) 
    : (dayjs.isDayjs(myanmarTime) ? myanmarTime : dayjs(myanmarTime));
  // If already in Myanmar timezone, convert to UTC
  return dt.tz(MYANMAR_TIMEZONE).utc();
};

/**
 * Convert UTC time to Myanmar time
 */
export const utcToMyanmarTime = (utcTime: string | Date | dayjs.Dayjs) => {
  // Parse as UTC first, then convert to Myanmar timezone
  const utcDate = dayjs.isDayjs(utcTime) ? utcTime : dayjs(utcTime);
  return utcDate.utc().tz(MYANMAR_TIMEZONE);
};

export default dayjs;

