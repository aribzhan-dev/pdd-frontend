// Student directory for admins and managers.
//
// Deleting is admin-only, so the button is hidden for managers; the backend
// enforces the same rule regardless of what the interface shows.

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { staffApi } from "@/api/staff";
import { useAuth } from "@/features/auth/AuthContext";
import { StudentForm } from "@/features/staff/StudentForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UI } from "@/i18n/strings";
import { formatDate, pluralDays } from "@/lib/format";
import type { CredentialsIssued, LabeledValue, Student } from "@/types/api";

const EXTEND_DAYS = 30;

export function StudentsPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [students, setStudents] = useState<Student[] | null>(null);
  const [categories, setCategories] = useState<LabeledValue[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [issued, setIssued] = useState<CredentialsIssued | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Student | null>(
    null,
  );

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
      .then((options) => setCategories(options.categories))
      .catch(() => setCategories([]));
  }, []);

  async function extend(student: Student): Promise<void> {
    try {
      await staffApi.updateStudent(student.id, { extend_days: EXTEND_DAYS });
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : UI.error);
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

      <div className="spread">
        <h1 className="section-title">{UI.students}</h1>
        <button
          className="btn btn--primary"
          onClick={() => {
            setIssued(null);
            setIsFormOpen((open) => !open);
          }}
        >
          {isFormOpen ? UI.cancel : UI.createStudent}
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

      {isFormOpen && (
        <StudentForm
          categories={categories}
          onCancel={() => setIsFormOpen(false)}
          onCreated={(credentials) => {
            setIssued(credentials);
            setIsFormOpen(false);
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
                  <td>{student.full_name}</td>
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
                        onClick={() => void extend(student)}
                      >
                        +{EXTEND_DAYS} дн.
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
