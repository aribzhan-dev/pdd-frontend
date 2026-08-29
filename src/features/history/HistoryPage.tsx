// The student's past attempts: what they scored and when.

import { useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { quizApi } from "@/api/quiz";
import { UI } from "@/i18n/strings";
import { formatDate, formatDuration } from "@/lib/format";
import type { ResultBrief } from "@/types/api";

export function HistoryPage() {
  const [results, setResults] = useState<ResultBrief[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const page = await quizApi.history();
        if (!cancelled) setResults(page.items);
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
  }, []);

  if (error) return <div className="state">{error}</div>;
  if (!results) return <div className="state">{UI.loading}</div>;
  if (results.length === 0) {
    return <div className="state">{UI.emptyHistory}</div>;
  }

  return (
    <div className="page stack">
      <h1 className="section-title">{UI.history}</h1>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Тест</th>
              <th>Результат</th>
              <th>{UI.time}</th>
              <th>Дата</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td>{result.mode.label}</td>
                <td>
                  {result.correct_count} / {result.total_questions} ·{" "}
                  {result.score_percent}%
                </td>
                <td>{formatDuration(result.time_seconds)}</td>
                <td>{formatDate(result.finished_at)}</td>
                <td>
                  <span
                    className={`pill ${result.is_passed ? "pill--success" : "pill--danger"}`}
                  >
                    {result.is_passed ? UI.passed : UI.failed}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
