// Score card for a finished run, followed by a question-by-question review.
//
// The review lists every question, not only the failed ones, so the student
// can see where they were right as well as where they slipped. A toggle
// narrows it to the mistakes.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import { quizApi } from "@/api/quiz";
import { UI } from "@/i18n/strings";
import { formatDuration } from "@/lib/format";
import type { QuestionReview, SessionResult } from "@/types/api";

type Filter = "all" | "mistakes";

export function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const loaded = await quizApi.result(Number(sessionId));
        if (!cancelled) setResult(loaded);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof ApiError ? cause.message : UI.error);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (error) return <div className="state">{error}</div>;
  if (!result) return <div className="state">{UI.loading}</div>;

  const shown = filter === "all" ? result.review : result.mistakes;

  return (
    <div className="page stack">
      <section className={`score ${result.is_passed ? "score--pass" : "score--fail"}`}>
        <div className="score__ring">{result.score_percent}%</div>
        <div className="score__info">
          <p className="score__status">
            {result.is_passed ? UI.passed : UI.failed}
          </p>
          <p className="muted">
            {UI.correctAnswers}: {result.correct_count} / {result.total_questions}
            {result.answered_count < result.total_questions &&
              ` · ${UI.answeredOf(result.answered_count, result.total_questions)}`}
          </p>
          <p className="muted">
            {UI.time}: {formatDuration(result.time_seconds)}
          </p>
        </div>
      </section>

      <div className="row">
        <button className="btn btn--primary" onClick={() => navigate("/")}>
          {UI.toTopics}
        </button>
        <button className="btn btn--ghost" onClick={() => navigate("/history")}>
          {UI.history}
        </button>
      </div>

      <div className="spread">
        <h2 className="section-title">
          {UI.review} ({shown.length})
        </h2>
        <div className="segmented">
          <button
            className={filter === "all" ? "is-active" : ""}
            onClick={() => setFilter("all")}
          >
            {UI.showAll}
          </button>
          <button
            className={filter === "mistakes" ? "is-active" : ""}
            onClick={() => setFilter("mistakes")}
          >
            {UI.showMistakes} ({result.mistakes.length})
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="muted">{UI.noMistakes}</p>
      ) : (
        <ul className="review">
          {shown.map((entry) => (
            <ReviewRow key={entry.question_id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewRow({ entry }: { entry: QuestionReview }) {
  return (
    <li className={`review__item ${entry.is_correct ? "is-correct" : "is-wrong"}`}>
      <span className="review__badge">{entry.position + 1}</span>
      <div className="review__body">
        <p className="review__question">{entry.question_text}</p>
        <p className="review__line">
          <span className="muted">{UI.yourAnswer}:</span>{" "}
          <span className={entry.is_correct ? "mistake__correct" : "mistake__given"}>
            {entry.given_answer_text ?? UI.noAnswer}
          </span>
        </p>
        {!entry.is_correct && (
          <p className="review__line">
            <span className="muted">{UI.correctAnswer}:</span>{" "}
            <span className="mistake__correct">{entry.correct_answer_text}</span>
          </p>
        )}
      </div>
    </li>
  );
}
