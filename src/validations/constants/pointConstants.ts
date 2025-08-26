// Point Package Validation Constants
export const POINT_PACKAGE_VALIDATION = {
  // Points validation
  POINTS: {
    MIN: 1,
    MAX: 10000,
    MIN_MESSAGE: 'Points must be at least 1',
    MAX_MESSAGE: 'Points cannot exceed 10,000',
  },
  
  // Price validation
  PRICE: {
    MIN: 1000,
    MAX: 10000000,
    MIN_MESSAGE: 'Price must be at least 1,000 MMK',
    MAX_MESSAGE: 'Price cannot exceed 10,000,000 MMK',
  },
  
  // Description validation
  DESCRIPTION: {
    MAX_LENGTH: 500,
    MAX_MESSAGE: 'Description must be less than 500 characters',
  },
  
  // Name validation
  NAME: {
    MAX_LENGTH: 255,
    MAX_MESSAGE: 'Name must be 255 characters or less',
  },
} as const;

// Validation helper functions
export const validatePoints = (points: number): string | null => {
  if (points < POINT_PACKAGE_VALIDATION.POINTS.MIN) {
    return POINT_PACKAGE_VALIDATION.POINTS.MIN_MESSAGE;
  }
  if (points > POINT_PACKAGE_VALIDATION.POINTS.MAX) {
    return POINT_PACKAGE_VALIDATION.POINTS.MAX_MESSAGE;
  }
  return null;
};

export const validatePrice = (price: number): string | null => {
  if (price < POINT_PACKAGE_VALIDATION.PRICE.MIN) {
    return POINT_PACKAGE_VALIDATION.PRICE.MIN_MESSAGE;
  }
  if (price > POINT_PACKAGE_VALIDATION.PRICE.MAX) {
    return POINT_PACKAGE_VALIDATION.PRICE.MAX_MESSAGE;
  }
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (description.length > POINT_PACKAGE_VALIDATION.DESCRIPTION.MAX_LENGTH) {
    return POINT_PACKAGE_VALIDATION.DESCRIPTION.MAX_MESSAGE;
  }
  return null;
};
