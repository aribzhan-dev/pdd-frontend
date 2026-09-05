// Confirmation dialog.
//
// Built on the native <dialog> element rather than a plain overlay: it brings
// the backdrop, focus trapping and Escape-to-close with it, which a hand-rolled
// div would have to reimplement and usually gets wrong.

import { useEffect, useRef } from "react";

import { useStrings } from "@/i18n/LanguageContext";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Marks the action as destructive, so the button reads as a warning. */
  isDestructive?: boolean;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useStrings();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      // Escape and backdrop dismissal both route through the same handler as
      // the Cancel button, so the parent only tracks one way of backing out.
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
    >
      <div className="dialog__body">
        <h2 className="dialog__title">{title}</h2>
        {description && <p className="dialog__text">{description}</p>}
        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {cancelLabel ?? t.cancel}
          </button>
          <button
            type="button"
            className={`btn ${isDestructive ? "btn--danger" : "btn--primary"}`}
            onClick={onConfirm}
            disabled={isBusy}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
