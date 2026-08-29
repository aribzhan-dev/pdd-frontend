// Tokens and the last language choice live in localStorage so a reload keeps
// the user signed in. Every access is guarded: private-mode browsers throw.

const ACCESS_TOKEN_KEY = "pdd.access_token";
const REFRESH_TOKEN_KEY = "pdd.refresh_token";
const LANGUAGE_KEY = "pdd.language";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Storage unavailable — the session simply will not survive a reload.
  }
}

export const tokenStorage = {
  getAccess: () => read(ACCESS_TOKEN_KEY),
  getRefresh: () => read(REFRESH_TOKEN_KEY),
  save(access: string, refresh: string): void {
    write(ACCESS_TOKEN_KEY, access);
    write(REFRESH_TOKEN_KEY, refresh);
  },
  saveAccess(access: string): void {
    write(ACCESS_TOKEN_KEY, access);
  },
  clear(): void {
    write(ACCESS_TOKEN_KEY, null);
    write(REFRESH_TOKEN_KEY, null);
  },
};

export const languageStorage = {
  get: () => read(LANGUAGE_KEY),
  set: (language: string) => write(LANGUAGE_KEY, language),
};
