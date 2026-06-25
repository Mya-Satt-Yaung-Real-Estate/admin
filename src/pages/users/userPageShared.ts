import * as Yup from 'yup';
import { MEMBER_LEVEL_VALUES } from '../../constants/memberLevels';

export const DEFAULT_COVER_IMAGE = 'https://msy-demo.s3.ap-southeast-1.amazonaws.com/default/default-cover.jpeg';

/** Shared profile/cover image area height on user edit & detail pages (tier 6). */
export const USER_EDIT_IMAGE_MIN_HEIGHT = { xs: 230, sm: 250 } as const;

export const optionalFieldLabel = (label: string) => `${label} (Optional)`;

export const requiredFieldLabel = (label: string) => `${label} *`;

export const USER_FORM_HINT =
  'Fields marked with * are required. Optional fields are labeled (Optional).';

export const USER_CREATE_SUBMIT_TOUCH_FIELDS: Record<string, boolean> = {
  name: true,
  email: true,
  phone: true,
  user_type: true,
  member_level: true,
  is_active: true,
  company_name: true,
  company_type_id: true,
  address: true,
  region_id: true,
  township_id: true,
  description: true,
};

export function getFirstYupFormError(errors: Record<string, unknown>): string | null {
  for (const value of Object.values(errors)) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    if (value && typeof value === 'object') {
      const nested = getFirstYupFormError(value as Record<string, unknown>);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

export function buildTouchedFieldsForFormErrors(errors: Record<string, unknown>): Record<string, boolean> {
  return Object.keys(errors).reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});
}

const emptyToUndefined = (value: unknown, originalValue: unknown) =>
  originalValue === '' || originalValue === null ? undefined : value;

const requiredSelectId = (message: string) =>
  Yup.number()
    .transform(emptyToUndefined)
    .typeError(message)
    .required(message)
    .positive(message)
    .integer(message);

export const createUserValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  email: Yup.string()
    .trim()
    .transform((value) => (value === '' ? undefined : value))
    .optional()
    .email('Please enter a valid email address'),
  phone: Yup.string()
    .trim()
    .required('Phone number is required')
    .max(13, 'Phone number cannot exceed 13 characters'),
  user_type: Yup.string()
    .required('User type is required')
    .oneOf(['individual', 'company'], 'Invalid user type'),
  member_level: Yup.string()
    .required('Member level is required')
    .oneOf([...MEMBER_LEVEL_VALUES], 'Invalid member level'),
  is_active: Yup.string().oneOf(['true', 'false']),
  company_name: Yup.string().when('user_type', {
    is: 'company',
    then: (schema) => schema.trim().required('Company name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  company_type_id: Yup.number().when('user_type', {
    is: 'company',
    then: () => requiredSelectId('Company type is required'),
    otherwise: (schema) => schema.optional(),
  }),
  address: Yup.string().when('user_type', {
    is: 'company',
    then: (schema) => schema.trim().required('Business address is required'),
    otherwise: (schema) => schema.optional(),
  }),
  region_id: Yup.number().when('user_type', {
    is: 'company',
    then: () => requiredSelectId('Region is required'),
    otherwise: (schema) => schema.optional(),
  }),
  township_id: Yup.number().when('user_type', {
    is: 'company',
    then: () => requiredSelectId('Township is required'),
    otherwise: (schema) => schema.optional(),
  }),
  description: Yup.string().trim().optional(),
});

export const DETAIL_ICON_SX = {
  person: { color: 'primary.main' },
  phone: { color: 'success.main' },
  business: { color: 'primary.main' },
  star: { color: 'warning.main' },
  calendar: { color: 'info.main' },
  location: { color: 'error.main' },
  description: { color: 'secondary.main' },
  home: { color: 'primary.main' },
} as const;

export const detailListSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
  columnGap: 3,
  rowGap: 0.5,
  '& .MuiListItem-root': {
    px: 0,
    alignItems: 'flex-start',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 36,
    mt: 0.5,
  },
} as const;
