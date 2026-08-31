// Extending a student's access.
//
// This replaces a button labelled "+30 дн." that sat in the actions column.
// Staff read it as data — "this student has 30 days" — because it looked like
// a value rather than an action, and it said 30 no matter what had actually
// been granted. Now the action states the current expiry, asks how many days
// to add, and shows the resulting date before anything changes.

import { useEffect, useRef, useState } from "react";

import { UI } from "@/i18n/strings";
import { formatDate, pluralDays } from "@/lib/format";
import type { Student } from "@/types/api";

//: The lengths staff pick most often; anything else goes in the field.
const PRESETS = [30, 60, 90, 180] as const;

const MAX_DAYS = 730;

interface ExtendAccessDialogProps {
  student: Student | null;
  isBusy?: boolean;
  onConfirm: (days: number) => void;
  onCancel: () => void;
}

/** The expiry a given number of extra days produces. */
function projectedExpiry(student: Student, days: number): string {
  // Extending a lapsed account starts from today, matching the backend.
  const from = new Date(student.access_expires_at);
  const base = from.getTime() > Date.now() ? from : new Date();
  return formatDate(
    new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
  );
}

export function ExtendAccessDialog({
  student,
  isBusy = false,
  onConfirm,
  onCancel,
}: ExtendAccessDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [days, setDays] = useState<number>(PRESETS[0]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (student && !dialog.open) {
      setDays(PRESETS[0]);
      dialog.showModal();
    } else if (!student && dialog.open) {
      dialog.close();
    }
  }, [student]);

  const isValid = days >= 1 && days <= MAX_DAYS;

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
    >
      {student && (
        <div className="dialog__body">
          <h2 className="dialog__title">{UI.extendAccess}</h2>
          <p className="dialog__text">
            {student.full_name} — {UI.accessUntil.toLowerCase()}{" "}
            {formatDate(student.access_expires_at)}
            {student.days_left > 0
              ? `, ${UI.daysLeft.toLowerCase()} ${pluralDays(student.days_left)}`
              : `, ${UI.accessLapsed}`}
          </p>

          <div className="presets">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset ${preset === days ? "is-active" : ""}`}
                onClick={() => setDays(preset)}
              >
                +{preset}
              </button>
            ))}
          </div>

          <label className="field">
            <span className="field__label">{UI.extendDays}</span>
            <span className="field__control">
              <input
                type="number"
                className="field__input"
                min={1}
                max={MAX_DAYS}
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
              />
            </span>
          </label>

          {isValid && (
            <p className="dialog__text">
              {UI.newExpiry}: <strong>{projectedExpiry(student, days)}</strong>
            </p>
          )}

          <div className="dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              {UI.cancel}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!isValid || isBusy}
              onClick={() => onConfirm(days)}
            >
              {isBusy ? UI.saving : UI.extend}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
