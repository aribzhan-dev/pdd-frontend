// Student home: the two practice modes, then the topic catalogue.

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { contentApi } from "@/api/content";
import { quizApi, type QuizMode } from "@/api/quiz";
import { StartTestCard } from "@/features/catalog/StartTestCard";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Session, TopicBrief } from "@/types/api";

export function HomePage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicBrief[] | null>(null);
  const [active, setActive] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [loadedTopics, activeSession] = await Promise.all([
        contentApi.listTopics(language),
        quizApi.getActive(language),
      ]);
      setTopics(loadedTopics);
      setActive(activeSession);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    }
  }, [language]);

  useEffect(() => {
    void load();
  }, [load]);

  async function start(mode: QuizMode, topicId?: number): Promise<void> {
    setIsStarting(true);
    setError(null);
    try {
      await quizApi.start(mode, language, topicId);
      navigate("/quiz");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t.error);
    } finally {
      setIsStarting(false);
    }
  }

  if (error && !topics) {
    return (
      <div className="state">
        <p>{error}</p>
        <button className="btn btn--ghost" onClick={() => void load()}>
          {t.retryAction}
        </button>
      </div>
    );
  }

  if (!topics) return <div className="state">{t.loading}</div>;

  return (
    <div className="page stack">
      {active && (
        <div className="resume">
          <div>
            <p className="resume__title">{t.resumeNotice}</p>
            <p className="muted">
              {active.title} · {t.answeredOf(active.answered_count, active.total_questions)}
            </p>
          </div>
          <button className="btn btn--primary" onClick={() => navigate("/quiz")}>
            Продолжить
          </button>
        </div>
      )}

      {error && <div className="notice notice--error">{error}</div>}

      <StartTestCard onStart={(mode) => void start(mode)} isStarting={isStarting} />

      <button
        className="mode mode--wide"
        disabled={isStarting}
        onClick={() => void start("mistakes")}
      >
        <span className="mode__title">{t.mistakes}</span>
        <span className="mode__hint">{t.mistakesHint}</span>
      </button>

      <h2 className="section-title">{t.topicsSection}</h2>
      <div className="topics">
        {topics.map((topic) => (
          <button
            key={topic.id}
            className="topic"
            disabled={isStarting}
            onClick={() => void start("topic", topic.id)}
          >
            <span className="topic__number">{topic.number}</span>
            <span className="topic__body">
              <span className="topic__title">{topic.title}</span>
              <span className="topic__meta">
                {topic.question_count} {t.questions}
              </span>
            </span>
            {topic.best_percent !== null && (
              <span className="pill pill--success">{topic.best_percent}%</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
