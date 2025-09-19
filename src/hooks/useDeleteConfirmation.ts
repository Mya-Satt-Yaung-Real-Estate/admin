import { useState } from 'react';

export interface DeleteConfirmationState {
  open: boolean;
  itemName?: string;
  itemType?: string;
  onConfirm?: (reason?: string) => void;
  actionType?: 'delete' | 'restore'; // Add action type
}

export const useDeleteConfirmation = () => {
  const [deleteState, setDeleteState] = useState<DeleteConfirmationState>({
    open: false,
  });

  const openDeleteConfirmation = (
    itemName: string,
    itemType: string = 'item',
    onConfirm: (reason?: string) => void,
    actionType: 'delete' | 'restore' = 'delete' // Add action type parameter
  ) => {
    setDeleteState({
      open: true,
      itemName,
      itemType,
      onConfirm,
      actionType,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteState({
      open: false,
    });
  };

  const handleConfirmDelete = (reason?: string) => {
    if (deleteState.onConfirm) {
      deleteState.onConfirm(reason);
    }
    closeDeleteConfirmation();
  };

  return {
    deleteState,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    handleConfirmDelete,
  };
};
