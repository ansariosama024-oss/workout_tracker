import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "../../utils/cn";

const SIZE_STYLES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

/**
 * Accessible modal dialog rendered via a portal.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} [title]
 * @param {"sm"|"md"|"lg"|"xl"} [size]
 */
export function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  footer,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative w-full rounded-2xl border border-border bg-surface shadow-popover animate-fade-in focus:outline-none",
          SIZE_STYLES[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-text-primary">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-paper hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
