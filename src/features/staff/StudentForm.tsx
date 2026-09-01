// Form for issuing a new student account or editing an existing one.
//
// Create mode: staff choose the login and password and hand them over, so the
// password comes back once on success as confirmation of what to pass on.
// Edit mode: the IIN is the account's identity and stays read-only; the
// password is optional and left blank means "keep the current one". Access
// extension lives in its own dialog, so it is not repeated here.

import { useState, type FormEvent } from "react";

import { staffApi, type StudentPatch, type StudentPayload } from "@/api/staff";
import { ApiError } from "@/api/client";
import { PasswordField } from "@/components/PasswordField";
import { TextField } from "@/components/TextField";
import { UI } from "@/i18n/strings";
import type {
  CredentialsIssued,
  LabeledValue,
  Student,
} from "@/types/api";

const IIN_LENGTH = 12;
const DEFAULT_ACCESS_DAYS = 60;
const MIN_PASSWORD_LENGTH = 6;

interface StudentFormProps {
  categories: LabeledValue[];
  /** Statuses for the dropdown; only needed in edit mode. */
  statuses?: LabeledValue[];
  /** When present the form edits this student; otherwise it creates one. */
  student?: Student | null;
  onCreated?: (credentials: CredentialsIssued) => void;
  onUpdated?: (student: Student) => void;
  onCancel: () => void;
}

export function StudentForm({
  categories,
  statuses = [],
  student = null,
  onCreated,
  onUpdated,
  onCancel,
}: StudentFormProps) {
  const isEdit = student !== null;

  const [form, setForm] = useState({
    surname: student?.surname ?? "",
    name: student?.name ?? "",
    iin: student?.iin ?? "",
    phone_number: student?.phone_number ?? "",
    password: "",
    category: student?.category.value ?? categories[0]?.value ?? "B",
    status: student?.status.value ?? "active",
    access_days: String(DEFAULT_ACCESS_DAYS),
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update(field: keyof typeof form, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      if (isEdit && student) {
        await saveEdit(student);
      } else {
        await saveCreate();
      }
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : UI.error);
    } finally {
      setIsSaving(false);
    }
  }

  async function saveCreate(): Promise<void> {
    const payload: StudentPayload = {
      iin: form.iin,
      password: form.password,
      name: form.name.trim(),
      surname: form.surname.trim(),
      phone_number: form.phone_number.trim() || null,
      category: form.category,
      access_days: Number(form.access_days),
    };
    onCreated?.(await staffApi.createStudent(payload));
  }

  async function saveEdit(target: Student): Promise<void> {
    const patch: StudentPatch = {
      name: form.name.trim(),
      surname: form.surname.trim(),
      phone_number: form.phone_number.trim() || null,
      category: form.category,
      status: form.status,
    };
    // A blank password field means "leave it unchanged".
    if (form.password) patch.password = form.password;
    onUpdated?.(await staffApi.updateStudent(target.id, patch));
  }

  const passwordOk = isEdit
    ? form.password === "" || form.password.length >= MIN_PASSWORD_LENGTH
    : form.password.length >= MIN_PASSWORD_LENGTH;

  const isComplete =
    form.surname.trim() !== "" &&
    form.name.trim() !== "" &&
    (isEdit || form.iin.length === IIN_LENGTH) &&
    passwordOk &&
    (isEdit || Number(form.access_days) > 0);

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2 className="section-title">
        {isEdit ? UI.editStudent : UI.createStudent}
      </h2>

      <div className="form-grid">
        <TextField
          label={UI.surname}
          value={form.surname}
          onChange={(value) => update("surname", value)}
          required
        />
        <TextField
          label={UI.name}
          value={form.name}
          onChange={(value) => update("name", value)}
          required
        />
        <TextField
          label={UI.iin}
          value={form.iin}
          onChange={(value) =>
            update("iin", value.replace(/\D/g, "").slice(0, IIN_LENGTH))
          }
          placeholder={UI.iinPlaceholder}
          inputMode="numeric"
          maxLength={IIN_LENGTH}
          required={!isEdit}
          readOnly={isEdit}
        />
        <TextField
          label={UI.phone}
          value={form.phone_number}
          onChange={(value) => update("phone_number", value)}
          type="tel"
          placeholder="+7 700 000 00 00"
        />

        <label className="field">
          <span className="field__label">{UI.category}</span>
          <select
            className="field__input"
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        {isEdit ? (
          <label className="field">
            <span className="field__label">{UI.status}</span>
            <select
              className="field__input"
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <TextField
            label={UI.accessDays}
            value={form.access_days}
            onChange={(value) =>
              update("access_days", value.replace(/\D/g, "").slice(0, 3))
            }
            inputMode="numeric"
            required
          />
        )}

        <PasswordField
          value={form.password}
          onChange={(value) => update("password", value)}
          autoComplete="new-password"
          required={!isEdit}
          placeholder={isEdit ? UI.passwordUnchanged : "минимум 6 символов"}
        />
      </div>

      {error && <div className="notice notice--error">{error}</div>}

      <div className="row">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!isComplete || isSaving}
        >
          {isSaving ? UI.saving : UI.save}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {UI.cancel}
        </button>
      </div>
    </form>
  );
}
