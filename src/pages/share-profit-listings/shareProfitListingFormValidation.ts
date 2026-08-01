/**
 * Client-side validation for Share Profit Listing create/edit forms.
 */

export interface ShareProfitListingFormValues {
  wanted_type: string;
  title: string;
  description: string;
  property_type_id: number;
  region_id: number | null;
  township_id: number | null;
  min_budget: number;
  max_budget: number;
  min_area?: number;
  max_area?: number;
  name: string;
  email: string;
  phone: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

export type ShareProfitListingFormErrorField =
  | 'wanted_type'
  | 'title'
  | 'description'
  | 'property_type_id'
  | 'region_id'
  | 'township_id'
  | 'min_budget'
  | 'max_budget'
  | 'min_area'
  | 'max_area'
  | 'name'
  | 'email'
  | 'phone'
  | 'media_ids'
  | 'rejection_reason';

export type ShareProfitListingFormErrors = Partial<
  Record<ShareProfitListingFormErrorField, string>
>;

const ALLOWED_WANTED_TYPES = ['buyer', 'renter', 'seller', 'share_profit'];

const FIELD_ORDER: ShareProfitListingFormErrorField[] = [
  'wanted_type',
  'property_type_id',
  'rejection_reason',
  'title',
  'region_id',
  'township_id',
  'min_budget',
  'max_budget',
  'min_area',
  'max_area',
  'media_ids',
  'name',
  'email',
  'phone',
];

export function validateShareProfitListingForm(
  formData: ShareProfitListingFormValues,
  mediaCount: number
): ShareProfitListingFormErrors {
  const errors: ShareProfitListingFormErrors = {};

  if (!formData.wanted_type || !ALLOWED_WANTED_TYPES.includes(formData.wanted_type)) {
    errors.wanted_type = 'Listing type is required';
  }

  if (!formData.property_type_id) {
    errors.property_type_id = 'Property type is required';
  }

  if (formData.verification_status === 'rejected' && !formData.rejection_reason?.trim()) {
    errors.rejection_reason = 'Rejection reason is required';
  }

  if (!formData.title.trim()) {
    errors.title = 'Title is required';
  }

  if (!formData.region_id) {
    errors.region_id = 'Region is required';
  }

  if (!formData.township_id) {
    errors.township_id = 'Township is required';
  }

  if (!formData.min_budget || formData.min_budget <= 0) {
    errors.min_budget = 'Min budget must be greater than 0';
  }

  if (!formData.max_budget || formData.max_budget <= 0) {
    errors.max_budget = 'Max budget must be greater than 0';
  }

  if (
    formData.min_budget > 0 &&
    formData.max_budget > 0 &&
    formData.min_budget > formData.max_budget
  ) {
    errors.max_budget = 'Max budget must be greater than or equal to min budget';
  }

  const minArea = formData.min_area ?? 0;
  const maxArea = formData.max_area ?? 0;
  if (minArea > 0 && maxArea > 0 && minArea > maxArea) {
    errors.min_area = 'Minimum area must be less than or equal to maximum area';
    errors.max_area = 'Maximum area must be greater than or equal to minimum area';
  }

  if (!formData.name.trim()) {
    errors.name = 'Full name is required';
  }

  if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required';
  }

  if (mediaCount < 1) {
    errors.media_ids = 'At least one photo is required';
  }

  return errors;
}

/**
 * Only keep API keys that match known form fields (ignore unrelated keys).
 */
export function mapApiErrorsToFormErrors(
  apiErrors: Record<string, string[]>
): ShareProfitListingFormErrors {
  const allowedFields = new Set<string>(FIELD_ORDER);
  const errors: ShareProfitListingFormErrors = {};

  Object.entries(apiErrors).forEach(([field, messages]) => {
    if (!allowedFields.has(field)) {
      return;
    }

    const message = Array.isArray(messages) ? messages[0] : String(messages);
    errors[field as ShareProfitListingFormErrorField] = message;
  });

  return errors;
}

export function getFirstShareProfitListingErrorFieldId(
  errors: ShareProfitListingFormErrors
): string | null {
  for (const field of FIELD_ORDER) {
    if (errors[field]) {
      return field === 'media_ids' ? 'media_ids-section' : field;
    }
  }

  return null;
}

export function scrollToFirstShareProfitListingError(
  errors: ShareProfitListingFormErrors
): void {
  const fieldId = getFirstShareProfitListingErrorFieldId(errors);
  if (!fieldId) {
    return;
  }

  document.getElementById(fieldId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

export function hasShareProfitListingFormErrors(
  errors: ShareProfitListingFormErrors
): boolean {
  return Object.keys(errors).length > 0;
}
