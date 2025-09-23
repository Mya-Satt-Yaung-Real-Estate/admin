import * as Yup from 'yup';

// Employee validation schemas
export const employeeCreateSchema = Yup.object({
  employee_id: Yup.string()
    .nullable()
    .max(50, 'Employee ID must be at most 50 characters'),
  name: Yup.string()
    .required('Name is required')
    .max(255, 'Name must be at most 255 characters'),
  phone: Yup.string()
    .required('Phone is required')
    .max(20, 'Phone must be at most 20 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters'),
  position: Yup.string()
    .required('Position is required')
    .max(100, 'Position must be at most 100 characters'),
  department: Yup.string()
    .nullable()
    .max(100, 'Department must be at most 100 characters'),
  hire_date: Yup.date()
    .nullable()
    .max(new Date(), 'Hire date cannot be in the future'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['active', 'inactive', 'terminated'], 'Invalid status'),
  notes: Yup.string()
    .nullable()
    .max(1000, 'Notes must be at most 1000 characters'),
});

export const employeeUpdateSchema = employeeCreateSchema.partial();
