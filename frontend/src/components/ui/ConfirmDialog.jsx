import { AlertTriangle } from "lucide-react";

import { Button } from "./Button";
import { Modal } from "./Modal";

/**
 * Confirmation dialog for destructive or important actions
 * (e.g. deleting a workout).
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-danger-subtle text-danger">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-text-primary">
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-sm text-text-secondary">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
