import * as yup from 'yup';
import { ADVERTISEMENT_STATUSES, ADVERTISEMENT_TYPES, VERIFICATION_STATUSES } from '../../types/advertisement';

// Base advertisement validation schema
export const advertisementBaseSchema = yup.object({
  user_id: yup.number().optional(),
  property_type_id: yup.number().required('Property type is required'),
  listing_type_id: yup.number().required('Listing type is required'),
  title_en: yup
    .string()
    .required('English title is required')
    .max(255, 'English title must not exceed 255 characters'),
  title_mm: yup
    .string()
    .required('Myanmar title is required')
    .max(255, 'Myanmar title must not exceed 255 characters'),
  description: yup
    .string()
    .required('Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  advertisement_type: yup
    .string()
    .oneOf(ADVERTISEMENT_TYPES.map(type => type.value), 'Invalid advertisement type')
    .optional(),
  price: yup
    .number()
    .min(0, 'Price must be at least 0')
    .optional()
    .nullable(),
  // price_type: yup
  //   .string()
  //   .oneOf(PRICE_TYPES.map(type => type.value), 'Invalid price type')
  //   .optional(), // Removed as PRICE_TYPES no longer exists
  region_id: yup.number().nullable().optional(), // Made optional and nullable
  township_id: yup.number().nullable().optional(), // Made optional and nullable
  address: yup
    .string()
    .optional() // Made optional
    .max(500, 'Address must not exceed 500 characters'),
  contact_name: yup
    .string()
    .required('Contact name is required')
    .max(255, 'Contact name must not exceed 255 characters'),
  phone_numbers: yup
    .array()
    .of(
      yup
        .string()
        .max(20, 'Phone number must not exceed 20 characters')
    )
    .min(1, 'At least one phone number is required')
    .required('Phone numbers are required'),
  email: yup
    .string()
    .email('Must be a valid email address')
    .required('Email is required')
    .max(255, 'Email must not exceed 255 characters'),
  status: yup
    .string()
    .oneOf(ADVERTISEMENT_STATUSES.map(status => status.value), 'Invalid status')
    .optional(),
  verification_status: yup
    .string()
    .oneOf(VERIFICATION_STATUSES.map(status => status.value), 'Invalid verification status')
    .optional(),
  rejection_reason: yup
    .string()
    .max(500, 'Rejection reason must not exceed 500 characters')
    .when('verification_status', {
      is: 'rejected',
      then: (schema) => schema.required('Rejection reason is required when status is rejected'),
      otherwise: (schema) => schema.optional(),
    }),
  is_featured: yup.boolean().optional(),
  expires_at: yup
    .date()
    .min(new Date(), 'Expiration date must be in the future')
    .optional()
    .nullable(),
  media_ids: yup
    .array()
    .of(yup.number())
    .optional(),
});

// Create advertisement validation schema
export const createAdvertisementSchema = advertisementBaseSchema;

// Update advertisement validation schema (all fields optional)
export const updateAdvertisementSchema = advertisementBaseSchema.clone().shape({
  title_en: yup
    .string()
    .max(255, 'English title must not exceed 255 characters')
    .optional(),
  title_mm: yup
    .string()
    .max(255, 'Myanmar title must not exceed 255 characters')
    .optional(),
  description: yup
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  region_id: yup.number().optional(),
  township_id: yup.number().optional(),
  address: yup
    .string()
    .max(500, 'Address must not exceed 500 characters')
    .optional(),
  contact_name: yup
    .string()
    .max(255, 'Contact name must not exceed 255 characters')
    .optional(),
  phone_numbers: yup
    .array()
    .of(
      yup
        .string()
        .max(20, 'Phone number must not exceed 20 characters')
    )
    .optional(),
  email: yup
    .string()
    .email('Must be a valid email address')
    .max(255, 'Email must not exceed 255 characters')
    .optional(),
});

// Filter validation schema
export const advertisementFilterSchema = yup.object({
  search: yup.string().max(255, 'Search term must not exceed 255 characters').optional(),
  status: yup
    .string()
    .oneOf(['all', ...ADVERTISEMENT_STATUSES.map(status => status.value)], 'Invalid status filter')
    .optional(),
  verification_status: yup
    .string()
    .oneOf(['all', ...VERIFICATION_STATUSES.map(status => status.value)], 'Invalid verification status filter')
    .optional(),
  featured: yup
    .string()
    .oneOf(['all', 'featured', 'not_featured'], 'Invalid featured filter')
    .optional(),
  user_id: yup.number().optional(),
  property_type_id: yup.number().optional(),
  listing_type_id: yup.number().optional(),
  region_id: yup.number().optional(),
  township_id: yup.number().optional(),
  // price_min: yup.number().min(0, 'Minimum price must be at least 0').optional(), // Removed as price fields no longer exist
  // price_max: yup
  //   .number()
  //   .min(0, 'Maximum price must be at least 0')
  //   .test('price-range', 'Maximum price must be greater than or equal to minimum price', function (value) {
  //     const { price_min } = this.parent;
  //     if (price_min && value && value < price_min) {
  //       return false;
  //     }
  //     return true;
  //   })
  //   .optional(), // Removed as price fields no longer exist
  // price_type: yup
  //   .string()
  //   .oneOf(PRICE_TYPES.map(type => type.value), 'Invalid price type')
  //   .optional(), // Removed as PRICE_TYPES no longer exists
  date_from: yup.date().optional(),
  date_to: yup
    .date()
    .min(yup.ref('date_from'), 'End date must be after or equal to start date')
    .optional(),
  expiring_soon: yup.boolean().optional(),
  sort_by: yup
    .string()
    .oneOf(['created_at', 'updated_at', 'published_at', 'expires_at', 'view_count', 'favorite_count', 'contact_count', 'title_en'], 'Invalid sort field') // Removed 'price' as it no longer exists
    .optional(),
  sort_order: yup
    .string()
    .oneOf(['asc', 'desc'], 'Sort order must be asc or desc')
    .optional(),
  page: yup.number().min(1, 'Page must be at least 1').optional(),
  per_page: yup.number().min(1, 'Per page must be at least 1').max(100, 'Per page must not exceed 100').optional(),
});

// Bulk action validation schema
export const bulkActionSchema = yup.object({
  action: yup
    .string()
    .oneOf(['approve', 'reject', 'feature', 'unfeature', 'delete', 'renew'], 'Invalid action')
    .required('Action is required'),
  ids: yup
    .array()
    .of(yup.number().positive('ID must be positive'))
    .min(1, 'At least one ID is required')
    .required('IDs are required'),
  reason: yup
    .string()
    .max(500, 'Reason must not exceed 500 characters')
    .when('action', {
      is: 'reject',
      then: (schema) => schema.required('Reason is required for reject action'),
      otherwise: (schema) => schema.optional(),
    }),
});

// Reject advertisement validation schema
export const rejectAdvertisementSchema = yup.object({
  reason: yup
    .string()
    .required('Rejection reason is required')
    .max(500, 'Rejection reason must not exceed 500 characters'),
});

// Type exports
export type AdvertisementFormData = yup.InferType<typeof advertisementBaseSchema>;
export type AdvertisementFilterData = yup.InferType<typeof advertisementFilterSchema>;
export type BulkActionData = yup.InferType<typeof bulkActionSchema>;
export type RejectAdvertisementData = yup.InferType<typeof rejectAdvertisementSchema>;
