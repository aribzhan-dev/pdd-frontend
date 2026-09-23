// The test screen: language switcher and "Завершить" on top, the numbered
// strip below it, then the question with its media on the left and the answer
// options on the right.

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { quizApi } from "@/api/quiz";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { AnswerList } from "@/features/quiz/AnswerList";
import { CountdownTimer } from "@/features/quiz/CountdownTimer";
import { MediaPanel } from "@/features/quiz/MediaPanel";
import { QuestionNav } from "@/features/quiz/QuestionNav";
import { useEnterToAdvance } from "@/features/quiz/useEnterToAdvance";
import { useQuizSession } from "@/features/quiz/useQuizSession";
import { useLanguage } from "@/i18n/LanguageContext";

export function QuizPage() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const quiz = useQuizSession();
  const [isFinishing, setIsFinishing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Derived above the early returns so the keyboard hook below can run on
  // every render, which is what the rules of hooks require.
  const { session, position } = quiz;
  const item = session?.items[position];
  const isAnswered = item?.is_answered ?? false;
  const isLast = session ? position === session.total_questions - 1 : false;

  // Once there is nothing left to answer, finishing becomes the main action
  // and moves next to the question — the link in the bar would just repeat it.
  const isComplete = session
    ? session.answered_count === session.total_questions ||
      (isAnswered && isLast)
    : false;

  // Enter advances exactly when the "Далее" button is on screen, and never
  // while the finish dialog is holding the student's attention.
  useEnterToAdvance(isAnswered && !isComplete && !isConfirmOpen, quiz.goNext);

  if (quiz.isLoading) return <div className="state">{t.loading}</div>;

  if (!session) {
    return (
      <div className="state">
        <p>{quiz.error ?? "Нет активного теста"}</p>
        <button className="btn btn--ghost" onClick={() => navigate("/")}>
          {t.toTopics}
        </button>
      </div>
    );
  }

  const question = session.questions[position];
  if (!question || !item) return <div className="state">{t.error}</div>;

  // Captured rather than read through `session`: the closure outlives the
  // narrowing the guard above gives us.
  const sessionId = session.id;

  async function submit(): Promise<void> {
    setIsFinishing(true);
    try {
      await quizApi.finish(sessionId, language);
      navigate(`/result/${sessionId}`);
    } finally {
      setIsFinishing(false);
    }
  }

  // Nothing to warn about once every question has an answer — the warning is
  // only ever about what would be counted wrong.
  function handleFinish(): void {
    if (isComplete) {
      void submit();
      return;
    }
    setIsConfirmOpen(true);
  }

  const unanswered = session.total_questions - session.answered_count;

  return (
    <div className="quiz">
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={t.confirmFinishTitle}
        description={t.confirmFinishText(unanswered)}
        confirmLabel={t.finish}
        isBusy={isFinishing}
        onConfirm={() => {
          setIsConfirmOpen(false);
          void submit();
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <header className="quiz__bar">
        <div className="quiz__tools">
          <LanguageSwitch value={language} onChange={setLanguage} />
          <ThemeSwitch />
        </div>
        {!isComplete && (
          <button
            type="button"
            className="btn btn--link"
            onClick={handleFinish}
            disabled={!session.can_finish || isFinishing}
            title={session.can_finish ? t.finishHint : undefined}
          >
            {isFinishing ? t.finishing : t.finish}
          </button>
        )}
      </header>

      <QuestionNav
        items={session.items}
        currentPosition={position}
        answeredCount={session.answered_count}
        revealsAnswers={session.reveals_answers}
        onSelect={quiz.goTo}
        trailing={
          session.seconds_left !== null ? (
            <CountdownTimer
              secondsLeft={session.seconds_left}
              onExpire={() => void submit()}
            />
          ) : null
        }
      />

      {quiz.wasResumed && (
        <p className="notice notice--info quiz__resumed">{t.resumeNotice}</p>
      )}

      <p className="quiz__counter">
        {t.question} {position + 1}/{session.total_questions}
      </p>

      <h1 className="quiz__question">{question.text}</h1>

      <div className="quiz__body">
        <MediaPanel
          image={question.image}
          situationVideo={question.situation_video}
          explanationVideoUrl={
            quiz.feedback?.explanation_video_url ??
            question.explanation_video?.url ??
            null
          }
        />

        <div className="quiz__answers">
          <AnswerList
            answers={question.answers}
            chosenAnswerId={item.answer_id}
            isAnswered={isAnswered}
            onChoose={quiz.choose}
            isSubmitting={quiz.isSubmitting}
          />

          {/* The exam says nothing until it is handed in — only that the
              answer was recorded. */}
          {isAnswered && !session.reveals_answers && (
            <div className="verdict verdict--noted">{t.answerRecorded}</div>
          )}

          {isAnswered && session.reveals_answers && (
            <div
              className={`verdict ${item.is_correct ? "verdict--ok" : "verdict--no"}`}
            >
              {item.is_correct ? t.correct : t.wrong}
            </div>
          )}

          {isAnswered &&
            session.reveals_answers &&
            (quiz.feedback?.explanation ?? question.explanation) && (
              <div className="explanation">
                <p className="explanation__label">{t.explanation}</p>
                <p className="explanation__text">
                  {quiz.feedback?.explanation ?? question.explanation}
                </p>
              </div>
            )}

          {quiz.error && <div className="notice notice--error">{quiz.error}</div>}

          <div className="quiz__actions">
            <span className="muted">
              {t.answeredOf(session.answered_count, session.total_questions)}
            </span>
            {isComplete ? (
              <button
                className="btn btn--finish"
                onClick={handleFinish}
                disabled={isFinishing}
              >
                {isFinishing ? t.finishing : t.finish}
              </button>
            ) : (
              isAnswered && (
                <button className="btn btn--primary" onClick={quiz.goNext}>
                  {t.next}
                </button>
              )
            )}
          </div>

          {!isComplete && <p className="muted">{t.finishHint}</p>}
        </div>
      </div>
    </div>
  );
}
