import * as yup from 'yup';

export const announcementCreateSchema = yup.object({
  announcement_type: yup
    .string()
    .oneOf(['notification'], 'Invalid announcement type')
    .required('Announcement type is required'),
  
  all_users: yup
    .boolean()
    .required('All users selection is required'),
  
  user_ids: yup
    .array()
    .of(yup.number().positive('Invalid user ID'))
    .when('all_users', {
      is: false,
      then: (schema) => schema.min(1, 'At least one user must be selected'),
      otherwise: (schema) => schema,
    }),
  
  title: yup
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must not exceed 255 characters')
    .required('Title is required'),
  
  body: yup
    .string()
    .trim()
    .min(10, 'Message body must be at least 10 characters')
    .max(2000, 'Message body must not exceed 2000 characters')
    .required('Message body is required'),
});

