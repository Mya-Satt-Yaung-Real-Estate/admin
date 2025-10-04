import * as yup from 'yup';

// Lawyer validation schema
export const lawyerCreateSchema = yup.object({
  name: yup
    .string()
    .required('Lawyer name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  
  title: yup
    .string()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must not exceed 255 characters'),
  
  region_id: yup
    .number()
    .required('Region is required')
    .positive('Please select a valid region'),
  
  township_id: yup
    .number()
    .required('Township is required')
    .positive('Please select a valid township'),
  
  address: yup
    .string()
    .optional()
    .max(500, 'Address must not exceed 500 characters'),
  
  experience_years: yup
    .number()
    .required('Experience years is required')
    .min(0, 'Experience years must be 0 or greater')
    .max(50, 'Experience years must not exceed 50'),
  
  phone: yup
    .string()
    .optional()
    .matches(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must not exceed 20 characters'),
  
  email: yup
    .string()
    .optional()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  
  specialization: yup
    .string()
    .required('Specialization is required')
    .min(2, 'Specialization must be at least 2 characters')
    .max(255, 'Specialization must not exceed 255 characters'),
  
  skillful_languages: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one language is required')
    .max(10, 'Maximum 10 languages allowed'),
  
  services: yup
    .array()
    .of(yup.string().required())
    .optional()
    .max(20, 'Maximum 20 services allowed'),
  
  about: yup
    .string()
    .optional()
    .max(2000, 'About section must not exceed 2000 characters'),
  
  education: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one education entry is required')
    .max(10, 'Maximum 10 education entries allowed'),
  
  certifications: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one certification is required')
    .max(15, 'Maximum 15 certifications allowed'),
  
  media_id: yup
    .number()
    .required('Profile image is required')
    .positive('Please upload a profile image'),
});

export const lawyerUpdateSchema = yup.object({
  name: yup
    .string()
    .optional()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  
  title: yup
    .string()
    .optional()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must not exceed 255 characters'),
  
  region_id: yup
    .number()
    .optional()
    .positive('Please select a valid region'),
  
  township_id: yup
    .number()
    .optional()
    .positive('Please select a valid township'),
  
  address: yup
    .string()
    .optional()
    .max(500, 'Address must not exceed 500 characters'),
  
  experience_years: yup
    .number()
    .optional()
    .min(0, 'Experience years must be 0 or greater')
    .max(50, 'Experience years must not exceed 50'),
  
  phone: yup
    .string()
    .optional()
    .matches(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must not exceed 20 characters'),
  
  email: yup
    .string()
    .optional()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  
  specialization: yup
    .string()
    .optional()
    .min(2, 'Specialization must be at least 2 characters')
    .max(255, 'Specialization must not exceed 255 characters'),
  
  skillful_languages: yup
    .array()
    .of(yup.string().required())
    .optional()
    .max(10, 'Maximum 10 languages allowed'),
  
  services: yup
    .array()
    .of(yup.string().required())
    .optional()
    .max(20, 'Maximum 20 services allowed'),
  
  about: yup
    .string()
    .optional()
    .max(2000, 'About section must not exceed 2000 characters'),
  
  education: yup
    .array()
    .of(yup.string().required())
    .optional()
    .max(10, 'Maximum 10 education entries allowed'),
  
  certifications: yup
    .array()
    .of(yup.string().required())
    .optional()
    .max(15, 'Maximum 15 certifications allowed'),
  
  media_id: yup
    .number()
    .optional()
    .positive('Please upload a valid profile image'),
  
  status: yup
    .boolean()
    .optional(),
});
