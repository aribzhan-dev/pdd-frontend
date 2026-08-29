// Account management calls, used by the admin and manager screens.

import { request } from "@/api/client";
import type {
  CredentialsIssued,
  LabeledValue,
  Page,
  Student,
  UserBrief,
} from "@/types/api";

export interface StudentPayload {
  iin: string;
  password: string;
  name: string;
  surname: string;
  phone_number?: string | null;
  category: string;
  access_days: number;
  note?: string | null;
}

export interface StudentPatch {
  name?: string;
  surname?: string;
  phone_number?: string | null;
  password?: string;
  category?: string;
  status?: string;
  extend_days?: number;
  note?: string | null;
}

export const staffApi = {
  listStudents: (search: string, page = 1, limit = 20) =>
    request<Page<Student>>("/students", {
      query: { search: search || undefined, page, limit },
    }),

  createStudent: (payload: StudentPayload) =>
    request<CredentialsIssued>("/students", { method: "POST", body: payload }),

  updateStudent: (studentId: number, patch: StudentPatch) =>
    request<Student>(`/students/${studentId}`, { method: "PATCH", body: patch }),

  deleteStudent: (studentId: number) =>
    request<{ detail: string }>(`/students/${studentId}`, { method: "DELETE" }),

  studentOptions: () =>
    request<{ categories: LabeledValue[]; statuses: LabeledValue[] }>(
      "/students/options",
    ),

  listManagers: (search: string, page = 1, limit = 20) =>
    request<Page<UserBrief>>("/managers", {
      query: { search: search || undefined, page, limit },
    }),

  createManager: (payload: {
    iin: string;
    password: string;
    name: string;
    surname: string;
    phone_number?: string | null;
  }) => request<UserBrief>("/managers", { method: "POST", body: payload }),

  deleteManager: (managerId: number) =>
    request<{ detail: string }>(`/managers/${managerId}`, { method: "DELETE" }),
};
