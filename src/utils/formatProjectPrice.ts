export const formatProjectCurrencyLabel = (currency?: string): string => {
  const normalized = currency || 'MMK';
  return normalized === 'MMK' ? ' MMK (Lakhs)' : normalized;
};

export const formatProjectPriceRange = (
  range?: string | null,
  currency?: string
): string | null => {
  if (!range) {
    return null;
  }

  if ((currency || 'MMK') === 'MMK') {
    return range.replace(/\s+MMK$/, ' MMK (Lakhs)');
  }

  return range;
};
