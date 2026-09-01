// Read-only view of one student, opened by clicking a row.
//
// Staff needed a way to look "inside" an account — its category, status, access
// window, note and sign-in history — without leaving the list. The actions
// that change the record (edit, extend, delete) are launched from here but
// carried out by the page, so confirmation prompts are never nested inside
// this dialog.

import { useEffect, useRef } from "react";

import { UI } from "@/i18n/strings";
import { formatDate, pluralDays } from "@/lib/format";
import type { Student } from "@/types/api";

interface StudentDetailDialogProps {
  student: Student | null;
  canDelete: boolean;
  onEdit: (student: Student) => void;
  onExtend: (student: Student) => void;
  onDelete: (student: Student) => void;
  onClose: () => void;
}

export function StudentDetailDialog({
  student,
  canDelete,
  onEdit,
  onExtend,
  onDelete,
  onClose,
}: StudentDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (student && !dialog.open) {
      dialog.showModal();
    } else if (!student && dialog.open) {
      dialog.close();
    }
  }, [student]);

  const isActive = student?.status.value === "active";

  return (
    <dialog
      ref={dialogRef}
      className="dialog dialog--wide"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {student && (
        <div className="dialog__body">
          <h2 className="dialog__title">{student.full_name}</h2>

          <dl className="details">
            <dt>{UI.iin}</dt>
            <dd>
              <code>{student.iin}</code>
            </dd>

            <dt>{UI.phone}</dt>
            <dd>{student.phone_number ?? "—"}</dd>

            <dt>{UI.category}</dt>
            <dd>{student.category.label}</dd>

            <dt>{UI.status}</dt>
            <dd>
              <span
                className={`pill ${isActive ? "pill--success" : "pill--danger"}`}
              >
                {student.status.label}
              </span>
            </dd>

            <dt>{UI.accessFrom}</dt>
            <dd>{formatDate(student.access_starts_at)}</dd>

            <dt>{UI.accessUntil}</dt>
            <dd>
              {formatDate(student.access_expires_at)}
              {student.days_left > 0 && (
                <span className="muted">
                  {" "}
                  ({UI.daysLeft.toLowerCase()} {pluralDays(student.days_left)})
                </span>
              )}
            </dd>

            <dt>{UI.lastLogin}</dt>
            <dd>
              {student.last_login_at
                ? formatDate(student.last_login_at)
                : UI.never}
            </dd>

            <dt>{UI.createdAt}</dt>
            <dd>{formatDate(student.created_at)}</dd>

            {student.note && (
              <>
                <dt>{UI.note}</dt>
                <dd>{student.note}</dd>
              </>
            )}
          </dl>

          <div className="dialog__actions">
            {canDelete && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => onDelete(student)}
              >
                {UI.remove}
              </button>
            )}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => onExtend(student)}
            >
              {UI.extend}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onEdit(student)}
            >
              {UI.edit}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
