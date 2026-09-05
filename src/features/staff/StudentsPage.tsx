// Student directory for admins and managers.
//
// A row opens the student's detail view; from there staff edit the record,
// extend access or (admins only) delete it. Deleting is admin-only, so the
// control is hidden for managers; the backend enforces the same rule
// regardless of what the interface shows.

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { staffApi } from "@/api/staff";
import { useAuth } from "@/features/auth/AuthContext";
import { StudentForm } from "@/features/staff/StudentForm";
import { StudentDetailDialog } from "@/features/staff/StudentDetailDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditIcon, ExtendIcon, TrashIcon, ViewIcon } from "@/components/Icons";
import { ExtendAccessDialog } from "@/features/staff/ExtendAccessDialog";
import { useStrings } from "@/i18n/LanguageContext";
import { formatDate, pluralDays } from "@/lib/format";
import type { CredentialsIssued, LabeledValue, Student } from "@/types/api";

export function StudentsPage() {
  const t = useStrings();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [students, setStudents] = useState<Student[] | null>(null);
  const [categories, setCategories] = useState<LabeledValue[]>([]);
  const [statuses, setStatuses] = useState<LabeledValue[]>([]);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [issued, setIssued] = useState<CredentialsIssued | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Student | null>(null);
  const [pendingExtension, setPendingExtension] = useState<Student | null>(null);
  const [isExtending, setIsExtending] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const page = await staffApi.listStudents(search);
      setStudents(page.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    staffApi
      .studentOptions()
      .then((options) => {
        setCategories(options.categories);
        setStatuses(options.statuses);
      })
      .catch(() => {
        setCategories([]);
        setStatuses([]);
      });
  }, []);

  function openCreate(): void {
    setIssued(null);
    setEditing(null);
    setIsCreating((open) => !open);
  }

  function openEdit(student: Student): void {
    setViewing(null);
    setIsCreating(false);
    setEditing(student);
  }

  async function extend(student: Student, days: number): Promise<void> {
    setIsExtending(true);
    try {
      await staffApi.updateStudent(student.id, { extend_days: days });
      setPendingExtension(null);
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    } finally {
      setIsExtending(false);
    }
  }

  async function remove(student: Student): Promise<void> {
    setPendingRemoval(null);
    try {
      await staffApi.deleteStudent(student.id);
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    }
  }

  return (
    <div className="page stack">
      <ConfirmDialog
        isOpen={pendingRemoval !== null}
        title={t.confirmRemove}
        description={pendingRemoval?.full_name}
        confirmLabel={t.remove}
        isDestructive
        onConfirm={() => {
          if (pendingRemoval) void remove(pendingRemoval);
        }}
        onCancel={() => setPendingRemoval(null)}
      />

      <ExtendAccessDialog
        student={pendingExtension}
        isBusy={isExtending}
        onConfirm={(days) => {
          if (pendingExtension) void extend(pendingExtension, days);
        }}
        onCancel={() => setPendingExtension(null)}
      />

      <StudentDetailDialog
        student={viewing}
        canDelete={isAdmin}
        onEdit={openEdit}
        onExtend={(student) => {
          setViewing(null);
          setPendingExtension(student);
        }}
        onDelete={(student) => {
          setViewing(null);
          setPendingRemoval(student);
        }}
        onClose={() => setViewing(null)}
      />

      <div className="spread">
        <h1 className="section-title">{t.students}</h1>
        <button className="btn btn--primary" onClick={openCreate}>
          {isCreating ? t.cancel : t.createStudent}
        </button>
      </div>

      {issued && (
        <div className="notice notice--info">
          <strong>{t.credentialsIssued}</strong>
          <div className="credentials">
            <span>{issued.full_name}</span>
            <span>
              {t.iin}: <code>{issued.iin}</code>
            </span>
            <span>
              {t.password}: <code>{issued.password}</code>
            </span>
          </div>
        </div>
      )}

      {isCreating && (
        <StudentForm
          categories={categories}
          onCancel={() => setIsCreating(false)}
          onCreated={(credentials) => {
            setIssued(credentials);
            setIsCreating(false);
            void load();
          }}
        />
      )}

      {editing && (
        <StudentForm
          student={editing}
          categories={categories}
          statuses={statuses}
          onCancel={() => setEditing(null)}
          onUpdated={() => {
            setEditing(null);
            void load();
          }}
        />
      )}

      <input
        className="field__input"
        placeholder={t.search}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error && <div className="notice notice--error">{error}</div>}
      {!students && <div className="state">{t.loading}</div>}
      {students?.length === 0 && <p className="muted">{t.nothingFound}</p>}

      {students && students.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>{t.iin}</th>
                <th>{t.phone}</th>
                <th>{t.category}</th>
                <th>{t.status}</th>
                <th>{t.accessUntil}</th>
                <th>{t.lastLogin}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <button
                      type="button"
                      className="row-link"
                      onClick={() => setViewing(student)}
                    >
                      {student.full_name}
                    </button>
                  </td>
                  <td>
                    <code>{student.iin}</code>
                  </td>
                  <td>{student.phone_number ?? "—"}</td>
                  <td>{student.category.label}</td>
                  <td>
                    <span
                      className={`pill ${
                        student.status.value === "active"
                          ? "pill--success"
                          : "pill--danger"
                      }`}
                    >
                      {student.status.label}
                    </span>
                  </td>
                  <td>
                    {formatDate(student.access_expires_at)}
                    <br />
                    <span className="muted">
                      {t.daysLeft} {pluralDays(student.days_left)}
                    </span>
                  </td>
                  <td>
                    {student.last_login_at
                      ? formatDate(student.last_login_at)
                      : t.never}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title={t.open}
                        aria-label={t.open}
                        onClick={() => setViewing(student)}
                      >
                        <ViewIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title={t.edit}
                        aria-label={t.edit}
                        onClick={() => openEdit(student)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title={t.extend}
                        aria-label={t.extend}
                        onClick={() => setPendingExtension(student)}
                      >
                        <ExtendIcon />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          title={t.remove}
                          aria-label={t.remove}
                          onClick={() => setPendingRemoval(student)}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
