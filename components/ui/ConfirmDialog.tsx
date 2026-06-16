'use client';

import * as React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * ConfirmDialog — wraps Modal with a simple confirm / cancel pattern.
 * Used for destructive actions: delete listing, suspend user, reject vetting, etc.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Delete Listing"
 *     description="This cannot be undone."
 *     confirmLabel="Delete"
 *     confirmVariant="destructive"
 *     onConfirm={handleDelete}
 *     loading={isDeleting}
 *   />
 */

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth="max-w-sm"
    >
      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
