import * as Yup from 'yup';

export const PROJECT_CONDITIONS = [
  { value: 'under_construction', label: 'Under Construction' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'upcoming', label: 'Upcoming' },
] as const;

export const PROJECT_PUBLISH_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
] as const;

export const PROJECT_CURRENCIES = [
  { value: 'MMK', label: 'MMK (Lakh)' },
  { value: 'USD', label: 'USD' },
  { value: 'THB', label: 'THB (Baht)' },
  { value: 'CNY', label: 'CNY (Yuan)' },
] as const;

const unitTypeSchema = Yup.object({
  name: Yup.string().required('Unit type name is required'),
  area: Yup.string().nullable(),
  price_range: Yup.string().nullable(),
  description: Yup.string().nullable(),
  units: Yup.string().nullable(),
});

const paymentPlanSchema = Yup.object({
  name: Yup.string().required('Plan name is required'),
  description: Yup.string().nullable(),
});

export const projectCreateSchema = Yup.object({
  is_platform_project: Yup.boolean(),
  user_id: Yup.number().when('is_platform_project', {
    is: false,
    then: (schema) => schema.required('Developer is required').min(1, 'Developer is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  title_en: Yup.string().required('English title is required').max(255),
  title_mm: Yup.string().required('Myanmar title is required').max(255),
  property_type_id: Yup.number().required('Property type is required').min(1),
  region_id: Yup.number().required('Region is required').min(1),
  township_id: Yup.number().required('Township is required').min(1),
  address: Yup.string().required('Address is required').max(1000),
  total_units: Yup.string().required('Total units is required').max(255),
  completion_text: Yup.string().required('Completion text is required').max(255),
  condition: Yup.string().oneOf(['under_construction', 'ongoing', 'upcoming']).required(),
  publish_status: Yup.string().oneOf(['draft', 'published', 'unpublished']).required(),
  price_min: Yup.number().required('Minimum price is required').min(0),
  price_max: Yup.number()
    .required('Maximum price is required')
    .min(0)
    .when('price_min', (priceMin, schema) =>
      schema.min(Number(priceMin) || 0, 'Maximum price must be greater than or equal to minimum price')
    ),
  currency: Yup.string().oneOf(['MMK', 'USD', 'THB', 'CNY']).required(),
  description_en: Yup.string().required('English description is required'),
  description_mm: Yup.string().required('Myanmar description is required'),
  contact_name: Yup.string().nullable().max(255),
  contact_phone: Yup.string().nullable().max(255),
  contact_email: Yup.string().email('Invalid email format').nullable(),
  is_featured: Yup.boolean(),
  show_on_homepage: Yup.boolean(),
  features: Yup.array().of(Yup.string()),
  unit_types: Yup.array().of(unitTypeSchema),
  payment_plans: Yup.array().of(paymentPlanSchema),
});

export const projectUpdateSchema = projectCreateSchema.shape({
  is_platform_project: Yup.boolean(),
  user_id: Yup.number().when('is_platform_project', {
    is: false,
    then: (schema) => schema.min(1),
    otherwise: (schema) => schema.notRequired(),
  }),
  title_en: Yup.string().max(255),
  title_mm: Yup.string().max(255),
  property_type_id: Yup.number().min(1),
  region_id: Yup.number().min(1),
  township_id: Yup.number().min(1),
  address: Yup.string().max(1000),
  total_units: Yup.string().max(255),
  completion_text: Yup.string().max(255),
  description_en: Yup.string(),
  description_mm: Yup.string(),
});
