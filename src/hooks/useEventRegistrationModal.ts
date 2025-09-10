import { useState, useMemo } from 'react';
import { useEventRegistrationUsers } from '../services/queries/eventRegistration';
import { EventRegistrationModalData } from '../types/eventRegistration';
import { HousingEvent } from '../types/event';

interface UseEventRegistrationModalProps {
  events?: HousingEvent[]; // For list page usage
  event?: HousingEvent; // For detail page usage
}

export const useEventRegistrationModal = ({ events, event }: UseEventRegistrationModalProps = {}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Determine which event to use
  const targetEvent = event || (events && selectedEventSlug ? events.find(e => e.slug === selectedEventSlug) : null);

  // Registration data query - run when we have a slug
  const { 
    data: registrationResponse, 
    isLoading: registrationLoading, 
    error: registrationError
  } = useEventRegistrationUsers(selectedEventSlug || '', { 
    per_page: perPage, 
    page: currentPage 
  }, {
    enabled: !!selectedEventSlug, // Run query when we have a slug
  });

  // Transform API response to modal format
  const registrationData = useMemo((): EventRegistrationModalData | null => {
    if (!registrationResponse || !targetEvent) return null;

    return {
      event: {
        id: targetEvent.id,
        name_en: targetEvent.name_en,
        name_mm: targetEvent.name_mm,
        slug: targetEvent.slug,
        need_registration: targetEvent.need_registration,
        user_capacity: targetEvent.user_capacity || 0,
        registration_user_count: targetEvent.registration_user_count,
      },
      registered_users: registrationResponse.data
    };
  }, [registrationResponse, targetEvent]);

  // Reset pagination helper
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Modal handlers
  const openModal = (eventSlug: string) => {
    setSelectedEventSlug(eventSlug);
    resetPagination();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEventSlug(null);
    resetPagination();
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => setCurrentPage(newPage);
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    resetPagination();
  };

  return {
    // Modal state
    modalOpen,
    registrationData,
    registrationLoading,
    registrationError,
    
    // Pagination state
    currentPage,
    perPage,
    pagination: registrationResponse?.pagination,
    
    // Modal handlers
    openModal,
    closeModal,
    
    // Pagination handlers
    handlePageChange,
    handlePerPageChange,
  };
};
