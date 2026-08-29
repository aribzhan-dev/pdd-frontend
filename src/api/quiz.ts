// Quiz session calls. `getActive` is what makes a page reload lossless.

import { request } from "@/api/client";
import type {
  AnswerResult,
  Language,
  Page,
  ResultBrief,
  Session,
  SessionResult,
} from "@/types/api";

export type QuizMode = "topic" | "exam" | "training" | "mistakes";

export const quizApi = {
  /** Returns null (HTTP 204) when there is no unfinished session. */
  getActive: () => request<Session | null>("/quiz/active"),

  get: (sessionId: number) => request<Session>(`/quiz/sessions/${sessionId}`),

  start: (mode: QuizMode, language: Language, topicId?: number) =>
    request<Session>("/quiz/sessions", {
      method: "POST",
      body: { mode, language, topic_id: topicId ?? null },
    }),

  answer: (sessionId: number, questionId: number, answerId: number) =>
    request<AnswerResult>(`/quiz/sessions/${sessionId}/answers`, {
      method: "POST",
      body: { question_id: questionId, answer_id: answerId },
    }),

  finish: (sessionId: number) =>
    request<SessionResult>(`/quiz/sessions/${sessionId}/finish`, {
      method: "POST",
    }),

  result: (sessionId: number) =>
    request<SessionResult>(`/quiz/sessions/${sessionId}/result`),

  history: (page = 1, limit = 20) =>
    request<Page<ResultBrief>>("/quiz/history", { query: { page, limit } }),
};
