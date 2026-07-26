"use client";

import { useRef, useState } from "react";
import type { QuizResult } from "@/lib/quiz";
import type { AdviceResponse, StudentProfile } from "@/lib/types";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ProfileForm } from "@/components/ProfileForm";
import { Quiz } from "@/components/Quiz";
import { ResultsView } from "@/components/ResultsView";

type View = "form" | "quiz" | "loading" | "results" | "error";

const introCopy = (
  <p className="mb-8 text-base leading-[26px] text-body">
    Tell us a bit about you — we&apos;ll suggest directions, colleges, and next
    steps that fit.
  </p>
);

async function fetchAdvice(
  profile: StudentProfile,
  quiz?: QuizResult,
): Promise<AdviceResponse> {
  const response = await fetch("/api/advise", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quiz ? { profile, quiz } : profile),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Something went wrong. Please try again.",
    );
  }

  return data as AdviceResponse;
}

export function AdviseFlow() {
  const [view, setView] = useState<View>("form");
  const [lastProfile, setLastProfile] = useState<StudentProfile | undefined>();
  const [lastQuiz, setLastQuiz] = useState<QuizResult | undefined>();
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);

  async function submitAdvice(profile: StudentProfile, quiz?: QuizResult) {
    if (submitInFlightRef.current) {
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);
    setLastProfile(profile);
    setLastQuiz(quiz);
    setView("loading");

    try {
      const result = await fetchAdvice(profile, quiz);
      setAdvice(result);
      setView("results");
    } catch {
      setView("error");
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleProfileSubmit(profile: StudentProfile) {
    if (isSubmitting) {
      return;
    }

    if (profile.decided) {
      void submitAdvice(profile);
      return;
    }

    setLastProfile(profile);
    setView("quiz");
  }

  function handleQuizComplete(quiz: QuizResult) {
    if (!lastProfile || isSubmitting) {
      return;
    }

    void submitAdvice(lastProfile, quiz);
  }

  function handleQuizExit() {
    setView("form");
  }

  function handleRetry() {
    if (lastProfile && !isSubmitting) {
      void submitAdvice(lastProfile, lastQuiz);
    }
  }

  function handleStartOver() {
    setLastQuiz(undefined);
    setView("form");
  }

  if (view === "loading") {
    return (
      <>
        {introCopy}
        <LoadingState />
      </>
    );
  }

  if (view === "error") {
    return (
      <>
        {introCopy}
        <ErrorState onRetry={handleRetry} />
      </>
    );
  }

  if (view === "results" && advice) {
    return <ResultsView advice={advice} onStartOver={handleStartOver} />;
  }

  if (view === "quiz") {
    return (
      <>
        {introCopy}
        <Quiz
          onComplete={handleQuizComplete}
          onExit={handleQuizExit}
          disabled={isSubmitting}
        />
      </>
    );
  }

  return (
    <>
      {introCopy}
      <ProfileForm
        initialProfile={lastProfile}
        onSubmit={handleProfileSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
