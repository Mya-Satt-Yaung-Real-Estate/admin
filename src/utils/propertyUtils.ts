import { PROPERTY_CONDITIONS } from '../validations/constants/propertyConstants';

/**
 * Format property condition value to display label
 * @param condition - The property condition value from API
 * @returns The formatted display label
 */
export const formatPropertyCondition = (condition: string): string => {
  const conditionOption = PROPERTY_CONDITIONS.find(c => c.value === condition);
  return conditionOption ? conditionOption.label : condition;
};

/**
 * Get property condition label by value
 * @param condition - The property condition value
 * @returns The label for the condition or the original value if not found
 */
export const getPropertyConditionLabel = (condition: string): string => {
  return formatPropertyCondition(condition);
};
