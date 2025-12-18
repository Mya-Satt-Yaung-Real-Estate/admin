import * as Yup from 'yup';
import { PROPERTY_CONDITIONS, PROPERTY_STATUSES } from '../constants/propertyConstants';

// Base validation schema for shared property fields
export const propertyBaseSchema = Yup.object({
  // Basic property information
  property_type_id: Yup.number().min(1, 'Property type is required').required('Property type is required'),
  listing_type_id: Yup.number().min(1, 'Listing type is required').required('Listing type is required'),
  title_en: Yup.string().required('English title is required').max(255, 'Title must be 255 characters or less'),
  title_mm: Yup.string().required('Myanmar title is required').max(255, 'Title must be 255 characters or less'),
  description: Yup.string().required('Description is required').max(5000, 'Description must be 5000 characters or less'),
  property_condition: Yup.string()
    .oneOf(PROPERTY_CONDITIONS.map(c => c.value), 'Invalid property condition')
    .required('Property condition is required'),

  // Location information
  region_id: Yup.number().min(1, 'Region is required').required('Region is required'),
  township_id: Yup.number().min(1, 'Township is required').required('Township is required'),
  address: Yup.string().required('Address is required').max(500, 'Address must be 500 characters or less'),
  latitude: Yup.number().min(-90).max(90).optional(),
  longitude: Yup.number().min(-180).max(180).optional(),

  // Property details
  price_lakh: Yup.number().min(0, 'Price (Lakh) must be positive').required('Price (Lakh) is required'),
  area_sqft: Yup.number().min(0, 'Area must be positive').required('Area is required'),
  length: Yup.number().min(0, 'Length must be positive').optional(),
  width: Yup.number().min(0, 'Width must be positive').optional(),
  bedrooms: Yup.number().min(0, 'Bedrooms must be positive').optional(),
  bathrooms: Yup.number().min(0, 'Bathrooms must be positive').optional(),
  bank_installment_available: Yup.boolean().optional(),

  // Contact information
  owner_name: Yup.string().when('is_platform_property', {
    is: false,
    then: (schema) => schema.required('Owner name is required for user properties').max(255, 'Owner name must be 255 characters or less'),
    otherwise: (schema) => schema.optional().max(255, 'Owner name must be 255 characters or less'),
  }),
  phone_numbers: Yup.array().of(Yup.string().min(1, 'Phone number cannot be empty')).min(1, 'At least one phone number is required').required('Phone numbers are required'),
  email: Yup.string().email('Invalid email format').optional(),

  // Status and settings - Fixed to match API requirements
  status: Yup.string()
    .oneOf(PROPERTY_STATUSES.map(s => s.value), 'Invalid status')
    .optional(),

  // Media and tan_tan_tan - Added to match API requirements
  media_ids: Yup.array().of(Yup.number()).nullable().optional(),
  tan_tan_tan: Yup.boolean().transform((value) => {
    if (typeof value === 'string') {
      return value === 'true' || value === 'on';
    }
    return Boolean(value);
  }).optional(),
  is_trending: Yup.boolean().transform((value) => {
    if (typeof value === 'string') {
      return value === 'true' || value === 'on';
    }
    return Boolean(value);
  }).optional(),
  features: Yup.array().of(Yup.string()).optional(),
});

// Dual-mode fields schema (for create/edit forms)
export const propertyDualModeSchema = Yup.object({
  // Dual-mode fields
  is_platform_property: Yup.boolean().required(),
  user_id: Yup.number().min(1, 'User is required for user properties').when('is_platform_property', {
    is: false,
    then: (schema) => schema.required('User is required for user properties'),
    otherwise: (schema) => schema.optional(),
  }),
});

// Complete validation schema for property create form
export const propertyCreateSchema = propertyDualModeSchema.concat(propertyBaseSchema);

// Complete validation schema for property edit form
export const propertyEditSchema = propertyDualModeSchema.concat(propertyBaseSchema);

// Export the main schemas for backward compatibility
export const propertyValidationSchemas = {
  create: propertyCreateSchema,
  edit: propertyEditSchema,
  base: propertyBaseSchema,
  dualMode: propertyDualModeSchema,
};
