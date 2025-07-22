import { useForm as useReactHookForm, FieldError } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { FormErrors } from '../types';

export interface UseFormOptions {
  defaultValues: Record<string, any>;
  validationSchema?: yup.ObjectSchema<any>;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  onError?: (errors: FormErrors) => void;
}

export interface UseFormReturnType {
  register: any;
  handleSubmit: any;
  formState: any;
  control: any;
  watch: any;
  setValue: any;
  getValues: any;
  reset: any;
  isSubmitting: boolean;
  submitForm: () => Promise<void>;
  resetForm: () => void;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
}

export function useForm({
  defaultValues,
  validationSchema,
  onSubmit,
  onError,
}: UseFormOptions): UseFormReturnType {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useReactHookForm({
    defaultValues,
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    mode: 'onChange',
  });

  const submitForm = async () => {
    try {
      setIsSubmitting(true);
      const isValid = await form.trigger();
      
      if (!isValid) {
        const errors = form.formState.errors;
        const formattedErrors: FormErrors = {};
        
        Object.keys(errors).forEach((key) => {
          const error = errors[key] as FieldError;
          if (error?.message) {
            formattedErrors[key] = error.message;
          }
        });
        
        onError?.(formattedErrors);
        return;
      }

      const data = form.getValues();
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      onError?.({ submit: 'An error occurred while submitting the form' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset(defaultValues);
  };

  const setFieldError = (field: string, message: string) => {
    form.setError(field as any, { type: 'manual', message });
  };

  const clearFieldError = (field: string) => {
    form.clearErrors(field as any);
  };

  return {
    ...form,
    isSubmitting,
    submitForm,
    resetForm,
    setFieldError,
    clearFieldError,
  };
}

// Common validation schemas
export const commonValidations = {
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: (passwordField: string) =>
    yup.string()
      .oneOf([yup.ref(passwordField)], 'Passwords must match')
      .required('Please confirm your password'),
  required: (fieldName: string) => yup.string().required(`${fieldName} is required`),
  minLength: (fieldName: string, min: number) =>
    yup.string().min(min, `${fieldName} must be at least ${min} characters`),
  maxLength: (fieldName: string, max: number) =>
    yup.string().max(max, `${fieldName} must be no more than ${max} characters`),
  phone: yup.string().min(10, 'Phone number must be at least 10 digits').required('Phone number is required'),
}; 