// Student home: the two practice modes, then the topic catalogue.
//
// The catalogue serves two starts. Tapping a topic runs that one topic in
// full; ticking several and using the picker bar draws a mixed set of up to
// forty questions from them — fewer when the chosen topics hold fewer.

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "@/api/client";
import { contentApi } from "@/api/content";
import { quizApi, type QuizMode, type StartOptions } from "@/api/quiz";
import { StartTestCard } from "@/features/catalog/StartTestCard";
import { TopicPickerBar } from "@/features/catalog/TopicPickerBar";
import { TopicRow } from "@/features/catalog/TopicRow";
import { useTopicSelection } from "@/features/catalog/useTopicSelection";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Session, TopicBrief } from "@/types/api";

export function HomePage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicBrief[] | null>(null);
  const [active, setActive] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const selection = useTopicSelection();

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

  async function start(
    mode: QuizMode,
    options: StartOptions = {},
  ): Promise<void> {
    setIsStarting(true);
    setError(null);
    try {
      await quizApi.start(mode, language, options);
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
      <p className="muted">{t.pickTopicsHint}</p>

      <div className="topics">
        {topics.map((topic) => (
          <TopicRow
            key={topic.id}
            topic={topic}
            isSelected={selection.isSelected(topic.id)}
            isDisabled={isStarting}
            questionsLabel={t.questions}
            onToggle={selection.toggle}
            onStart={(topicId) => void start("topic", { topicId })}
          />
        ))}
      </div>

      {selection.hasSelection && (
        <TopicPickerBar
          count={selection.count}
          isStarting={isStarting}
          onStart={() =>
            void start("custom", { topicIds: selection.topicIds })
          }
          onClear={selection.clear}
        />
      )}
    </div>
  );
}
