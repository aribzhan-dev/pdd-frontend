// Form for issuing a student account.
//
// Staff choose the login and password themselves and hand them to the student,
// so both are plain inputs here; the password comes back once on success as a
// confirmation of what to pass on.

import { useState, type FormEvent } from "react";

import { staffApi, type StudentPayload } from "@/api/staff";
import { ApiError } from "@/api/client";
import { PasswordField } from "@/components/PasswordField";
import { TextField } from "@/components/TextField";
import { UI } from "@/i18n/strings";
import type { CredentialsIssued, LabeledValue } from "@/types/api";

const IIN_LENGTH = 12;
const DEFAULT_ACCESS_DAYS = 60;

interface StudentFormProps {
  categories: LabeledValue[];
  onCreated: (credentials: CredentialsIssued) => void;
  onCancel: () => void;
}

export function StudentForm({
  categories,
  onCreated,
  onCancel,
}: StudentFormProps) {
  const [form, setForm] = useState({
    surname: "",
    name: "",
    iin: "",
    phone_number: "",
    password: "",
    category: categories[0]?.value ?? "B",
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
    const payload: StudentPayload = {
      iin: form.iin,
      password: form.password,
      name: form.name.trim(),
      surname: form.surname.trim(),
      phone_number: form.phone_number.trim() || null,
      category: form.category,
      access_days: Number(form.access_days),
    };
    try {
      onCreated(await staffApi.createStudent(payload));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : UI.error);
    } finally {
      setIsSaving(false);
    }
  }

  const isComplete =
    form.surname.trim() !== "" &&
    form.name.trim() !== "" &&
    form.iin.length === IIN_LENGTH &&
    form.password.length >= 6 &&
    Number(form.access_days) > 0;

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2 className="section-title">{UI.createStudent}</h2>

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
          required
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

        <TextField
          label={UI.accessDays}
          value={form.access_days}
          onChange={(value) =>
            update("access_days", value.replace(/\D/g, "").slice(0, 3))
          }
          inputMode="numeric"
          required
        />

        <PasswordField
          value={form.password}
          onChange={(value) => update("password", value)}
          autoComplete="new-password"
          placeholder="минимум 6 символов"
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
