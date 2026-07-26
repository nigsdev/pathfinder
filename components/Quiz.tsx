"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  QUIZ_QUESTIONS,
  scoreQuiz,
  type QuizResult,
} from "@/lib/quiz";

type QuizProps = {
  onComplete: (quiz: QuizResult) => void;
  onExit: () => void;
  disabled?: boolean;
};

const optionClassName =
  "flex min-h-14 w-full min-w-0 items-center rounded-sm border border-border-strong bg-surface px-4 py-3 text-left text-base break-words text-body transition-colors disabled:opacity-60";

const optionSelectedClassName =
  "flex min-h-14 w-full min-w-0 items-center rounded-sm border border-primary-600 bg-primary-050 px-4 py-3 text-left text-base break-words font-medium text-ink transition-colors disabled:opacity-60";

export function Quiz({ onComplete, onExit, disabled = false }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [locked, setLocked] = useState(false);

  const question = QUIZ_QUESTIONS[currentIndex];
  const total = QUIZ_QUESTIONS.length;
  const progress = ((currentIndex + 1) / total) * 100;
  const selectedIndex = answers[question.id];

  useEffect(() => {
    window.history.pushState({ quizStep: currentIndex }, "");
  }, [currentIndex]);

  useEffect(() => {
    function handlePopState() {
      setLocked(false);

      if (currentIndex > 0) {
        setCurrentIndex((index) => index - 1);
        return;
      }

      onExit();
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentIndex, onExit]);

  function handleSelect(optionIndex: number) {
    if (locked || disabled) {
      return;
    }

    setLocked(true);
    const nextAnswers = { ...answers, [question.id]: optionIndex };
    setAnswers(nextAnswers);

    if (currentIndex < total - 1) {
      setCurrentIndex((index) => index + 1);
      setLocked(false);
      return;
    }

    onComplete(scoreQuiz(nextAnswers));
  }

  function handleBack() {
    if (currentIndex > 0) {
      window.history.back();
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <div
          className="h-1 w-full overflow-hidden rounded-pill bg-primary-100"
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Question ${currentIndex + 1} of ${total}`}
        >
          <div
            className="h-full rounded-pill bg-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted">
          Question {currentIndex + 1} of {total}
        </p>
      </div>

      <div>
        <h2 className="font-head text-xl font-semibold text-ink">
          A few quick questions
        </h2>
        <p className="mt-2 text-base leading-[26px] text-body">
          This short interest finder helps us suggest directions that fit how
          you like to work — nothing to prepare for.
        </p>
      </div>

      <div className="min-w-0">
        <p className="mb-4 break-words text-base font-medium text-ink">
          {question.question}
        </p>
        <div className="flex flex-col gap-2">
          {question.options.map((option, index) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleSelect(index)}
              disabled={locked || disabled}
              className={
                selectedIndex === index ? optionSelectedClassName : optionClassName
              }
              aria-pressed={selectedIndex === index}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {currentIndex > 0 ? (
        <button
          type="button"
          onClick={handleBack}
          disabled={disabled}
          className="inline-flex min-h-11 items-center gap-1 text-base font-medium text-muted hover:text-ink disabled:opacity-60"
        >
          <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
          Back
        </button>
      ) : null}
    </div>
  );
}
