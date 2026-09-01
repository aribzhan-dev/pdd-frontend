// Single HTTP entry point. It attaches the bearer token, retries once through
// the refresh endpoint when the access token has expired, and turns the
// backend's error envelope into a thrown ApiError carrying the Russian message.

import { tokenStorage } from "@/lib/storage";

const API_BASE = "/api/v1";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Called when refreshing fails, so the app can drop back to the login screen. */
type SessionExpiredHandler = () => void;

let onSessionExpired: SessionExpiredHandler = () => {};

export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Internal: prevents a refresh loop when the retry also fails. */
  skipRefresh?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.pathname + url.search;
}

// FastAPI 422 issues name the field and the rule that failed. These are the
// ones a person can actually act on; anything else falls back to the generic.
function describeValidationIssue(issue: unknown): string | null {
  if (typeof issue !== "object" || issue === null) return null;
  const { loc, type } = issue as { loc?: unknown[]; type?: string };
  const field = Array.isArray(loc) ? loc[loc.length - 1] : undefined;

  if (field === "password") {
    if (type === "string_too_short") {
      return "Пароль должен содержать минимум 6 символов";
    }
    return "Проверьте пароль";
  }
  if (field === "iin") return "ИИН должен состоять из 12 цифр";
  if (field === "phone_number") return "Проверьте номер телефона";
  return null;
}

async function readError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (typeof payload?.error === "string") return payload.error;
    if (typeof payload?.detail === "string") return payload.detail;
    // FastAPI validation errors arrive as a list of issues — surface the first
    // one we can phrase for a person, else a generic prompt.
    if (Array.isArray(payload?.detail)) {
      for (const issue of payload.detail) {
        const described = describeValidationIssue(issue);
        if (described) return described;
      }
      return "Проверьте правильность полей";
    }
  } catch {
    // Body was not JSON — fall through to the generic message.
  }
  return "Что-то пошло не так";
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) return false;

  const tokens = await response.json();
  tokenStorage.save(tokens.access_token, tokens.refresh_token);
  return true;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, skipRefresh = false } = options;

  const headers: Record<string, string> = {};
  const token = tokenStorage.getAccess();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && !skipRefresh) {
    if (await refreshAccessToken()) {
      return request<T>(path, { ...options, skipRefresh: true });
    }
    tokenStorage.clear();
    onSessionExpired();
    throw new ApiError(401, "Сессия истекла, войдите заново");
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }

  // 204 carries no body — used when there is no session to resume.
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}
