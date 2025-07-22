import { useState, useCallback } from 'react';
import { DEFAULT_FILTERS, FilterState } from '../constants/filters';

export const useFilters = <T extends FilterState>(
  initialFilters: Partial<T> = {}
): {
  filters: T;
  setFilter: (key: keyof T, value: string) => void;
  setFilters: (newFilters: Partial<T>) => void;
  resetFilters: () => void;
  clearSearch: () => void;
} => {
  const [filters, setFiltersState] = useState<T>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  } as T);

  const setFilter = useCallback((key: keyof T, value: string) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({
      ...DEFAULT_FILTERS,
      ...initialFilters,
    } as T);
  }, [initialFilters]);

  const clearSearch = useCallback(() => {
    setFilter('searchTerm' as keyof T, '');
  }, [setFilter]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    clearSearch,
  };
}; 