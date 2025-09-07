import * as Yup from 'yup';

// Event Category Validation Schema
export const eventCategoryCreateSchema = Yup.object({
  name_en: Yup.string()
    .required('English name is required')
    .max(255, 'English name must be 255 characters or less')
    .matches(/^[A-Za-z\s\-\'\.]+$/, 'English name must contain only English letters, spaces, hyphens, apostrophes, or periods'),
  
  name_mm: Yup.string()
    .required('Myanmar name is required')
    .max(255, 'Myanmar name must be 255 characters or less')
    .matches(/^[\u1000-\u109F\s]+$/, 'Myanmar name must contain only Myanmar characters and spaces'),
  
  description: Yup.string()
    .max(255, 'Description must be 255 characters or less')
    .optional(),
  
  is_active: Yup.boolean().optional(),
});

export const eventCategoryEditSchema = eventCategoryCreateSchema;

// Event Validation Schema
export const eventCreateSchema = Yup.object({
  name_en: Yup.string()
    .required('English name is required')
    .max(255, 'English name must be 255 characters or less'),
  
  name_mm: Yup.string()
    .required('Myanmar name is required')
    .max(255, 'Myanmar name must be 255 characters or less'),
  
  description: Yup.string()
    .max(5000, 'Description must be 5000 characters or less')
    .optional(),
  
  tag: Yup.array().of(Yup.string()).optional(),
  
  housing_event_category_id: Yup.number()
    .min(1, 'Event category is required')
    .required('Event category is required'),
  
  event_type: Yup.string()
    .max(255, 'Event type must be 255 characters or less')
    .optional(),
  
  date: Yup.date()
    .required('Event date is required'),
  
  start_time: Yup.string()
    .required('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  
  end_time: Yup.string()
    .required('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  
  location: Yup.string()
    .max(255, 'Location must be 255 characters or less')
    .optional(),
  
  region_id: Yup.number()
    .min(1, 'Region is required')
    .required('Region is required'),
  
  township_id: Yup.number()
    .min(1, 'Township is required')
    .required('Township is required'),
  
  host_user_id: Yup.number()
    .min(1, 'Host user is required')
    .required('Host user is required'),
  
  host_contact_number: Yup.string()
    .required('Host contact number is required')
    .max(255, 'Host contact number must be 255 characters or less'),
  
  is_free: Yup.boolean().optional(),
  
  price: Yup.number()
    .min(0, 'Price must be positive')
    .optional(),
  
  need_registration: Yup.boolean().optional(),
  
  is_online: Yup.boolean().optional(),
  
  status: Yup.string()
    .oneOf(['draft', 'published', 'cancelled', 'done'], 'Invalid status')
    .optional(),
  
  user_capacity: Yup.number()
    .min(1, 'User capacity must be at least 1')
    .optional(),
  
  media_ids: Yup.array()
    .of(Yup.number())
    .min(1, 'At least one media is required')
    .required('Media is required'),
  
  is_active: Yup.boolean().optional(),
});

export const eventEditSchema = eventCreateSchema;

// Export validation schemas
export const eventValidationSchemas = {
  category: {
    create: eventCategoryCreateSchema,
    edit: eventCategoryEditSchema,
  },
  event: {
    create: eventCreateSchema,
    edit: eventEditSchema,
  },
};
