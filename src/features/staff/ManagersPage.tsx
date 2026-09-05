// Manager directory — administrators only. Managers cannot reach this screen,
// and the backend refuses the calls behind it in any case.

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/api/client";
import { staffApi } from "@/api/staff";
import { PasswordField } from "@/components/PasswordField";
import { TextField } from "@/components/TextField";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStrings } from "@/i18n/LanguageContext";
import { formatDate } from "@/lib/format";
import type { UserBrief } from "@/types/api";

const IIN_LENGTH = 12;

const EMPTY_FORM = {
  surname: "",
  name: "",
  iin: "",
  phone_number: "",
  password: "",
};

export function ManagersPage() {
  const t = useStrings();
  const [managers, setManagers] = useState<UserBrief[] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<UserBrief | null>(
    null,
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const page = await staffApi.listManagers("");
      setManagers(page.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function update(field: keyof typeof form, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await staffApi.createManager({
        iin: form.iin,
        password: form.password,
        name: form.name.trim(),
        surname: form.surname.trim(),
        phone_number: form.phone_number.trim() || null,
      });
      setForm(EMPTY_FORM);
      setIsFormOpen(false);
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(manager: UserBrief): Promise<void> {
    setPendingRemoval(null);
    try {
      await staffApi.deleteManager(manager.id);
      await load();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    }
  }

  const isComplete =
    form.surname.trim() !== "" &&
    form.name.trim() !== "" &&
    form.iin.length === IIN_LENGTH &&
    form.password.length >= 6;

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

      <div className="spread">
        <h1 className="section-title">{t.managers}</h1>
        <button
          className="btn btn--primary"
          onClick={() => setIsFormOpen((open) => !open)}
        >
          {isFormOpen ? t.cancel : t.createManager}
        </button>
      </div>

      {isFormOpen && (
        <form className="card stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <TextField
              label={t.surname}
              value={form.surname}
              onChange={(value) => update("surname", value)}
              required
            />
            <TextField
              label={t.name}
              value={form.name}
              onChange={(value) => update("name", value)}
              required
            />
            <TextField
              label={t.iin}
              value={form.iin}
              onChange={(value) =>
                update("iin", value.replace(/\D/g, "").slice(0, IIN_LENGTH))
              }
              placeholder={t.iinPlaceholder}
              inputMode="numeric"
              maxLength={IIN_LENGTH}
              required
            />
            <TextField
              label={t.phone}
              value={form.phone_number}
              onChange={(value) => update("phone_number", value)}
              type="tel"
            />
            <PasswordField
              value={form.password}
              onChange={(value) => update("password", value)}
              autoComplete="new-password"
            />
          </div>
          <div className="row">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!isComplete || isSaving}
            >
              {isSaving ? t.saving : t.save}
            </button>
          </div>
        </form>
      )}

      {error && <div className="notice notice--error">{error}</div>}
      {!managers && <div className="state">{t.loading}</div>}
      {managers?.length === 0 && <p className="muted">{t.nothingFound}</p>}

      {managers && managers.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Менеджер</th>
                <th>{t.iin}</th>
                <th>{t.phone}</th>
                <th>Создан</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager.id}>
                  <td>{manager.full_name}</td>
                  <td>
                    <code>{manager.iin}</code>
                  </td>
                  <td>{manager.phone_number ?? "—"}</td>
                  <td>{formatDate(manager.created_at)}</td>
                  <td>
                    <button
                      className="btn btn--link"
                      onClick={() => setPendingRemoval(manager)}
                    >
                      {t.remove}
                    </button>
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
