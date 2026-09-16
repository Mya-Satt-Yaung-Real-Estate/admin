import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { propertyNotesAPI } from '../api/propertyNotes';
import type { PropertyNoteListFilters } from '../../types/propertyNote';

export const propertyNoteKeys = {
  all: ['property-notes'] as const,
  lists: () => [...propertyNoteKeys.all, 'list'] as const,
  list: (params?: PropertyNoteListFilters) => [...propertyNoteKeys.lists(), params] as const,
  details: () => [...propertyNoteKeys.all, 'detail'] as const,
  detail: (id: number) => [...propertyNoteKeys.details(), id] as const,
};

export const usePropertyNotes = (params?: PropertyNoteListFilters) => {
  return useQuery({
    queryKey: propertyNoteKeys.list(params),
    queryFn: () => propertyNotesAPI.list(params),
    staleTime: 30 * 1000,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
};

export const usePropertyNote = (id: number) => {
  return useQuery({
    queryKey: propertyNoteKeys.detail(id),
    queryFn: () => propertyNotesAPI.get(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 30 * 1000,
  });
};
