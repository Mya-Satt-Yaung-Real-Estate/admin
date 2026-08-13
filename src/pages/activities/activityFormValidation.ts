export interface ActivityFormValues {
  is_platform_activity: boolean;
  user_id: number | null;
  title: string;
  description: string;
  status: 'draft' | 'published';
  show_on_homepage: boolean;
}

export type ActivityFormErrorField =
  | 'user_id'
  | 'title'
  | 'description'
  | 'status'
  | 'media_ids';

export type ActivityFormErrors = Partial<Record<ActivityFormErrorField, string>>;

const FIELD_ORDER: ActivityFormErrorField[] = [
  'user_id',
  'title',
  'description',
  'status',
  'media_ids',
];

export function validateActivityForm(
  formData: ActivityFormValues,
  mediaCount: number
): ActivityFormErrors {
  const errors: ActivityFormErrors = {};

  if (!formData.is_platform_activity && !formData.user_id) {
    errors.user_id = 'User is required';
  }

  if (!formData.title.trim()) {
    errors.title = 'Title is required';
  } else if (formData.title.trim().length > 255) {
    errors.title = 'Title must be 255 characters or less';
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.trim().length > 5000) {
    errors.description = 'Description must be 5000 characters or less';
  }

  if (mediaCount < 1) {
    errors.media_ids = 'At least one photo is required';
  }

  return errors;
}

export function mapApiErrorsToFormErrors(
  apiErrors: Record<string, string[]>
): ActivityFormErrors {
  const allowedFields = new Set<string>(FIELD_ORDER);
  const errors: ActivityFormErrors = {};

  Object.entries(apiErrors).forEach(([field, messages]) => {
    if (!allowedFields.has(field)) {
      return;
    }

    errors[field as ActivityFormErrorField] = Array.isArray(messages)
      ? messages[0]
      : String(messages);
  });

  return errors;
}

export function getFirstActivityErrorFieldId(errors: ActivityFormErrors): string | null {
  for (const field of FIELD_ORDER) {
    if (errors[field]) {
      return field === 'media_ids' ? 'media_ids-section' : field;
    }
  }

  return null;
}

export function scrollToFirstActivityError(errors: ActivityFormErrors): void {
  const fieldId = getFirstActivityErrorFieldId(errors);
  if (!fieldId) return;

  document.getElementById(fieldId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

export function hasActivityFormErrors(errors: ActivityFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
