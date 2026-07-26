"use client";

import { useState } from "react";
import type { AdviceResponse, StudentProfile } from "@/lib/types";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ProfileForm } from "@/components/ProfileForm";
import { ResultsView } from "@/components/ResultsView";

type View = "form" | "loading" | "results" | "error";

const introCopy = (
  <p className="mb-8 text-base leading-[26px] text-body">
    Tell us a bit about you — we&apos;ll suggest directions, colleges, and next
    steps that fit.
  </p>
);

async function fetchAdvice(profile: StudentProfile): Promise<AdviceResponse> {
  const response = await fetch("/api/advise", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
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
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);

  async function submitProfile(profile: StudentProfile) {
    setLastProfile(profile);
    setView("loading");

    try {
      const result = await fetchAdvice(profile);
      setAdvice(result);
      setView("results");
    } catch {
      setView("error");
    }
  }

  function handleRetry() {
    if (lastProfile) {
      void submitProfile(lastProfile);
    }
  }

  function handleStartOver() {
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

  return (
    <>
      {introCopy}
      <ProfileForm
        initialProfile={lastProfile}
        onSubmit={(profile) => void submitProfile(profile)}
      />
    </>
  );
}
