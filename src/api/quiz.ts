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

export type QuizMode =
  | "topic"
  | "exam"
  | "training"
  | "mistakes"
  | "custom";

/** Which slice of the catalogue a run is built from. */
export interface StartOptions {
  /** A single topic, taken in full — the "topic" mode. */
  topicId?: number;
  /** Several topics to draw from — the "custom" mode. */
  topicIds?: readonly number[];
}

export const quizApi = {
  /** Returns null (HTTP 204) when there is no unfinished session. */
  getActive: (lang: Language) =>
    request<Session | null>("/quiz/active", { query: { lang } }),

  get: (sessionId: number, lang: Language) =>
    request<Session>(`/quiz/sessions/${sessionId}`, { query: { lang } }),

  /**
   * `topicId` belongs to a single-topic run, `topicIds` to a custom one; the
   * other modes need neither.
   */
  start: (mode: QuizMode, language: Language, options: StartOptions = {}) =>
    request<Session>("/quiz/sessions", {
      method: "POST",
      body: {
        mode,
        language,
        topic_id: options.topicId ?? null,
        topic_ids: options.topicIds ?? [],
      },
    }),

  answer: (
    sessionId: number,
    questionId: number,
    answerId: number,
    lang: Language,
  ) =>
    request<AnswerResult>(`/quiz/sessions/${sessionId}/answers`, {
      method: "POST",
      body: { question_id: questionId, answer_id: answerId },
      query: { lang },
    }),

  finish: (sessionId: number, lang: Language) =>
    request<SessionResult>(`/quiz/sessions/${sessionId}/finish`, {
      method: "POST",
      query: { lang },
    }),

  result: (sessionId: number, lang: Language) =>
    request<SessionResult>(`/quiz/sessions/${sessionId}/result`, {
      query: { lang },
    }),

  history: (page = 1, limit = 20) =>
    request<Page<ResultBrief>>("/quiz/history", { query: { page, limit } }),
};
