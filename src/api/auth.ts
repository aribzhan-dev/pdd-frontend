// Authentication calls.

import { request } from "@/api/client";
import type { CurrentUser, LoginResponse, TokenPair } from "@/types/api";

export const authApi = {
  // skipRefresh: a 401 here means wrong credentials, not an expired token, so
  // the client must surface "Неверный ИИН или пароль" rather than trying to
  // refresh (there is no session yet) and reporting a stale session.
  login: (iin: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: { iin, password },
      skipRefresh: true,
    }),

  me: () => request<CurrentUser>("/auth/me"),

  refresh: (refreshToken: string) =>
    request<TokenPair>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ detail: string }>("/auth/password", {
      method: "POST",
      body: { current_password: currentPassword, new_password: newPassword },
    }),
};
