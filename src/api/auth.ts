// Authentication calls.

import { request } from "@/api/client";
import type { CurrentUser, LoginResponse, TokenPair } from "@/types/api";

export const authApi = {
  login: (iin: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: { iin, password },
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
