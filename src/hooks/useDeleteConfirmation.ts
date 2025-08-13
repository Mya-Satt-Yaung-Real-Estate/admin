import { useState } from 'react';

export interface DeleteConfirmationState {
  open: boolean;
  itemName?: string;
  itemType?: string;
  onConfirm?: () => void;
}

export const useDeleteConfirmation = () => {
  const [deleteState, setDeleteState] = useState<DeleteConfirmationState>({
    open: false,
  });

  const openDeleteConfirmation = (
    itemName: string,
    itemType: string = 'item',
    onConfirm: () => void
  ) => {
    setDeleteState({
      open: true,
      itemName,
      itemType,
      onConfirm,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteState({
      open: false,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteState.onConfirm) {
      deleteState.onConfirm();
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
