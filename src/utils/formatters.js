/**
 * Utility formatters for currency, dates, and percentages
 */

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatCompactCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

export const formatPercentage = (percent) => {
  const num = Number(percent) || 0;
  return `${num.toFixed(1)}%`;
};

/**
 * Format Google Calendar style ISO / date string into clean human-readable date & time
 */
export const formatCalendarDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch (e) {
    return String(dateString);
  }
};

export const formatDateOnly = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch (e) {
    return String(dateString);
  }
};
