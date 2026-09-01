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
import { ExtendAccessDialog } from "@/features/staff/ExtendAccessDialog";
import { UI } from "@/i18n/strings";
import { formatDate, pluralDays } from "@/lib/format";
import type { CredentialsIssued, LabeledValue, Student } from "@/types/api";

export function StudentsPage() {
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
      setError(cause instanceof ApiError ? cause.message : UI.error);
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
      setError(cause instanceof ApiError ? cause.message : UI.error);
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
      setError(cause instanceof ApiError ? cause.message : UI.error);
    }
  }

  return (
    <div className="page stack">
      <ConfirmDialog
        isOpen={pendingRemoval !== null}
        title={UI.confirmRemove}
        description={pendingRemoval?.full_name}
        confirmLabel={UI.remove}
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
        <h1 className="section-title">{UI.students}</h1>
        <button className="btn btn--primary" onClick={openCreate}>
          {isCreating ? UI.cancel : UI.createStudent}
        </button>
      </div>

      {issued && (
        <div className="notice notice--info">
          <strong>{UI.credentialsIssued}</strong>
          <div className="credentials">
            <span>{issued.full_name}</span>
            <span>
              {UI.iin}: <code>{issued.iin}</code>
            </span>
            <span>
              {UI.password}: <code>{issued.password}</code>
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
        placeholder={UI.search}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error && <div className="notice notice--error">{error}</div>}
      {!students && <div className="state">{UI.loading}</div>}
      {students?.length === 0 && <p className="muted">{UI.nothingFound}</p>}

      {students && students.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>{UI.iin}</th>
                <th>{UI.phone}</th>
                <th>{UI.category}</th>
                <th>{UI.status}</th>
                <th>{UI.accessUntil}</th>
                <th>{UI.lastLogin}</th>
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
                      {UI.daysLeft} {pluralDays(student.days_left)}
                    </span>
                  </td>
                  <td>
                    {student.last_login_at
                      ? formatDate(student.last_login_at)
                      : UI.never}
                  </td>
                  <td>
                    <div className="row">
                      <button
                        className="btn btn--link"
                        onClick={() => openEdit(student)}
                      >
                        {UI.edit}
                      </button>
                      <button
                        className="btn btn--link"
                        onClick={() => setPendingExtension(student)}
                      >
                        {UI.extend}
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn--link"
                          onClick={() => setPendingRemoval(student)}
                        >
                          {UI.remove}
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
