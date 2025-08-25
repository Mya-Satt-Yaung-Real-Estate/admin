import { useState } from 'react';

export interface DeleteConfirmationState {
  open: boolean;
  itemName?: string;
  itemType?: string;
  onConfirm?: (reason?: string) => void;
}

export const useDeleteConfirmation = () => {
  const [deleteState, setDeleteState] = useState<DeleteConfirmationState>({
    open: false,
  });

  const openDeleteConfirmation = (
    itemName: string,
    itemType: string = 'item',
    onConfirm: (reason?: string) => void
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
