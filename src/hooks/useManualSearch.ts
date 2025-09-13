import { useState, useCallback } from 'react';

/**
 * Custom hook for manual search functionality
 * Only triggers search when user presses Enter or clicks search button
 * Provides immediate UI feedback while controlling when API calls are made
 * 
 * @param initialValue - Initial search value
 * @returns Object with search value, search term, and handlers
 */
export function useManualSearch(initialValue: string = '') {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Update the input value (immediate UI feedback)
  const handleInputChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  // Trigger search (update search term for API calls)
  const triggerSearch = useCallback(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchValue('');
    setSearchTerm('');
  }, []);

  // Handle Enter key press
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      triggerSearch();
    }
  }, [triggerSearch]);

  return {
    searchValue,        // Current input value (for immediate UI feedback)
    searchTerm,         // Search term used for API calls
    handleInputChange,  // Function to update input value
    triggerSearch,      // Function to trigger search
    clearSearch,        // Function to clear search
    handleKeyPress,     // Function to handle Enter key press
    hasSearchTerm: searchTerm.length > 0, // Helper to check if there's an active search
  };
}


