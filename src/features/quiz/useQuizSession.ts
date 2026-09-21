// Session state for the quiz screen.
//
// The server is the source of truth: it holds the question order and every
// answer, so this hook only mirrors it. That is what makes a reload lossless —
// `restore` asks the backend what the student was doing and picks up there.

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { quizApi, type QuizMode, type StartOptions } from "@/api/quiz";
import { useLanguage } from "@/i18n/LanguageContext";
import type {
  AnswerResult,
  ItemState,
  Language,
  Question,
  Session,
} from "@/types/api";

interface QuizState {
  session: Session | null;
  position: number;
  isLoading: boolean;
  error: string | null;
  wasResumed: boolean;
  feedback: AnswerResult | null;
  isSubmitting: boolean;
  goTo: (position: number) => void;
  goNext: () => void;
  choose: (answerId: number) => Promise<void>;
  startSession: (
    mode: QuizMode,
    language: Language,
    options?: StartOptions,
  ) => Promise<void>;
  restore: () => Promise<void>;
  reset: () => void;
}

/** Mirror a just-recorded answer into the local item list. */
function applyAnswer(
  items: ItemState[],
  questionId: number,
  answerId: number,
  isCorrect: boolean | null,
): ItemState[] {
  return items.map((item) =>
    item.question_id === questionId
      ? { ...item, is_answered: true, is_correct: isCorrect, answer_id: answerId }
      : item,
  );
}

/**
 * Reveal the correct option on the question that was just answered.
 *
 * Until a question is answered the backend withholds which option is right,
 * so every `is_correct` arrives as null. Without folding the verdict back in,
 * the answer list has no way to tell a correct pick from a wrong one and
 * would mark even a right answer as wrong.
 */
function revealAnswers(
  questions: Question[],
  questionId: number,
  result: AnswerResult,
): Question[] {
  // The exam withholds the verdict, so there is nothing to fold in and the
  // options must stay uncoloured.
  if (!result.reveals_answer || result.correct_answer_id === null) {
    return questions;
  }
  return questions.map((question) =>
    question.id === questionId
      ? {
          ...question,
          explanation: result.explanation ?? question.explanation,
          answers: question.answers.map((answer) => ({
            ...answer,
            is_correct: answer.id === result.correct_answer_id,
          })),
        }
      : question,
  );
}



export function useQuizSession(): QuizState {
  const { language, t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wasResumed, setWasResumed] = useState(false);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messageOf = useCallback(
    (cause: unknown) => (cause instanceof ApiError ? cause.message : t.error),
    [t],
  );

  const adopt = useCallback((next: Session, resumed: boolean) => {
    setSession(next);
    setPosition(next.current_position);
    setWasResumed(resumed);
    setFeedback(null);
  }, []);

  const restore = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const active = await quizApi.getActive(language);
      if (active) adopt(active, active.answered_count > 0);
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setIsLoading(false);
    }
  }, [adopt, language, messageOf]);

  // Restore on mount, and again whenever the language changes: the session
  // itself does not change, only the language it is rendered in.
  useEffect(() => {
    void restore();
  }, [restore]);

  const startSession = useCallback(
    async (
      mode: QuizMode,
      startLanguage: Language,
      options: StartOptions = {},
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        adopt(await quizApi.start(mode, startLanguage, options), false);
      } catch (cause) {
        setError(messageOf(cause));
      } finally {
        setIsLoading(false);
      }
    },
    [adopt, messageOf],
  );

  const choose = useCallback(
    async (answerId: number) => {
      if (!session) return;
      const question = session.questions[position];
      if (!question) return;

      setIsSubmitting(true);
      setError(null);
      try {
        const result = await quizApi.answer(
          session.id,
          question.id,
          answerId,
          language,
        );
        setFeedback(result);
        setSession((current) =>
          current === null
            ? current
            : {
                ...current,
                answered_count: result.answered_count,
                can_finish: result.can_finish,
                correct_count:
                  current.correct_count + (result.is_correct === true ? 1 : 0),
                items: applyAnswer(
                  current.items,
                  question.id,
                  answerId,
                  result.reveals_answer ? result.is_correct : null,
                ),
                questions: revealAnswers(current.questions, question.id, result),
              },
        );
      } catch (cause) {
        setError(messageOf(cause));
      } finally {
        setIsSubmitting(false);
      }
    },
    [session, position, language, messageOf],
  );

  const goTo = useCallback(
    (next: number) => {
      setPosition(next);
      setFeedback(null);
      setWasResumed(false);
    },
    [],
  );

  // The updater must be pure: React invokes it twice in development to catch
  // exactly this, and an earlier version called setPosition from inside the
  // setSession updater, which advanced two slots and skipped a question.
  const totalQuestions = session?.total_questions ?? 0;

  const goNext = useCallback(() => {
    setPosition((current) => Math.min(current + 1, Math.max(0, totalQuestions - 1)));
    setFeedback(null);
    setWasResumed(false);
  }, [totalQuestions]);

  const reset = useCallback(() => {
    setSession(null);
    setPosition(0);
    setFeedback(null);
    setWasResumed(false);
  }, []);

  return {
    session,
    position,
    isLoading,
    error,
    wasResumed,
    feedback,
    isSubmitting,
    goTo,
    goNext,
    choose,
    startSession,
    restore,
    reset,
  };
}
