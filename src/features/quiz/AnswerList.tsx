// Answer options.
//
// Before answering they are plain choices. Once answered, the correct option
// turns green and a wrong pick turns red — and the list locks, because the
// backend refuses a second answer for the same question.

import { optionLetter } from "@/lib/format";
import type { Answer } from "@/types/api";

interface AnswerListProps {
  answers: Answer[];
  chosenAnswerId: number | null;
  isAnswered: boolean;
  onChoose: (answerId: number) => void;
  isSubmitting: boolean;
}

function answerModifier(
  answer: Answer,
  chosenAnswerId: number | null,
  isAnswered: boolean,
  isVerdictKnown: boolean,
): string {
  if (!isAnswered) return "";
  // Without a verdict nothing is known to be wrong, so the pick is only
  // highlighted — never marked red on a guess.
  if (!isVerdictKnown) {
    return answer.id === chosenAnswerId ? "answer--chosen" : "answer--dim";
  }
  if (answer.is_correct) return "answer--correct";
  if (answer.id === chosenAnswerId) return "answer--wrong";
  return "answer--dim";
}

export function AnswerList({
  answers,
  chosenAnswerId,
  isAnswered,
  onChoose,
  isSubmitting,
}: AnswerListProps) {
  // The exam never sends a correct flag while it runs, so nothing is coloured
  // and the pick is only highlighted.
  const isVerdictKnown = answers.some((answer) => answer.is_correct === true);

  return (
    <ul className="answers">
      {answers.map((answer, index) => (
        <li key={answer.id}>
          <button
            type="button"
            className={`answer ${answerModifier(
              answer,
              chosenAnswerId,
              isAnswered,
              isVerdictKnown,
            )}`}
            disabled={isAnswered || isSubmitting}
            onClick={() => onChoose(answer.id)}
          >
            <span className="answer__letter">{optionLetter(index)}</span>
            <span className="answer__text">{answer.text}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
