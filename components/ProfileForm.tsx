"use client";

import { useState } from "react";
import { STREAMS, type Stream, type StudentProfile } from "@/lib/types";

const inputClassName =
  "w-full min-h-11 rounded-sm border border-border-strong bg-surface px-3.5 py-3 text-base text-body placeholder:text-faint outline-none focus:ring-2 focus:ring-primary-300";

const chipClassName =
  "min-h-11 rounded-sm border border-border-strong bg-surface px-4 text-base font-medium text-body";

const chipSelectedClassName =
  "min-h-11 rounded-sm border border-primary-600 bg-primary-050 px-4 text-base font-medium text-ink";

type FormErrors = {
  marks?: string;
  stream?: string;
  city?: string;
  decided?: string;
  career?: string;
};

function validateForm(
  marks: string,
  stream: Stream | null,
  city: string,
  decided: boolean | null,
  career: string,
): FormErrors {
  const errors: FormErrors = {};

  if (!marks.trim()) {
    errors.marks = "Enter your marks percentage.";
  } else {
    const parsed = Number(marks);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      errors.marks = "Enter a number between 0 and 100.";
    }
  }

  if (!stream) {
    errors.stream = "Select your stream.";
  }

  if (!city.trim()) {
    errors.city = "Enter your city.";
  }

  if (decided === null) {
    errors.decided = "Select yes or no.";
  } else if (decided && !career.trim()) {
    errors.career = "Enter the career path you've decided on.";
  }

  return errors;
}

type ProfileFormProps = {
  initialProfile?: StudentProfile;
  onSubmit: (profile: StudentProfile) => void;
  isSubmitting?: boolean;
};

function profileToFormState(profile: StudentProfile) {
  return {
    marks: String(profile.marks),
    stream: profile.stream,
    city: profile.city,
    decided: profile.decided,
    career: profile.career ?? "",
    interests: profile.interests ?? "",
  };
}

export function ProfileForm({
  initialProfile,
  onSubmit,
  isSubmitting = false,
}: ProfileFormProps) {
  const initial = initialProfile ? profileToFormState(initialProfile) : null;

  const [marks, setMarks] = useState(initial?.marks ?? "");
  const [stream, setStream] = useState<Stream | null>(initial?.stream ?? null);
  const [city, setCity] = useState(initial?.city ?? "");
  const [decided, setDecided] = useState<boolean | null>(
    initial ? initial.decided : null,
  );
  const [career, setCareer] = useState(initial?.career ?? "");
  const [interests, setInterests] = useState(initial?.interests ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleDecidedChange(value: boolean) {
    setDecided(value);
    if (!value) {
      setCareer("");
      setErrors((prev) => ({ ...prev, career: undefined }));
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(marks, stream, city, decided, career);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const profile: StudentProfile = {
      marks: Number(marks),
      stream: stream!,
      city: city.trim(),
      decided: decided!,
      ...(decided && career.trim() ? { career: career.trim() } : {}),
      ...(interests.trim() ? { interests: interests.trim() } : {}),
    };

    onSubmit(profile);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="marks" className="mb-2 block text-base font-medium text-ink">
          Marks (percentage)
        </label>
        <div className="relative">
          <input
            id="marks"
            type="text"
            inputMode="decimal"
            value={marks}
            onChange={(event) => setMarks(event.target.value)}
            className={`${inputClassName} pr-10`}
            aria-describedby={errors.marks ? "marks-error" : undefined}
            aria-invalid={errors.marks ? true : undefined}
          />
          <span
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-base text-muted"
            aria-hidden="true"
          >
            %
          </span>
        </div>
        {errors.marks ? (
          <p id="marks-error" className="mt-1.5 text-sm text-error">
            {errors.marks}
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className="mb-2 block text-base font-medium text-ink">Stream</legend>
        <div className="flex flex-wrap gap-2">
          {STREAMS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStream(option)}
              className={stream === option ? chipSelectedClassName : chipClassName}
              aria-pressed={stream === option}
            >
              {option}
            </button>
          ))}
        </div>
        {errors.stream ? (
          <p id="stream-error" className="mt-1.5 text-sm text-error">
            {errors.stream}
          </p>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor="city" className="mb-2 block text-base font-medium text-ink">
          City
        </label>
        <input
          id="city"
          type="text"
          autoComplete="address-level2"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className={inputClassName}
          aria-describedby={errors.city ? "city-error" : undefined}
          aria-invalid={errors.city ? true : undefined}
        />
        {errors.city ? (
          <p id="city-error" className="mt-1.5 text-sm text-error">
            {errors.city}
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className="mb-2 block text-base font-medium text-ink">
          Have you decided on a career path?
        </legend>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleDecidedChange(true)}
            className={`flex-1 ${decided === true ? chipSelectedClassName : chipClassName}`}
            aria-pressed={decided === true}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleDecidedChange(false)}
            className={`flex-1 ${decided === false ? chipSelectedClassName : chipClassName}`}
            aria-pressed={decided === false}
          >
            No
          </button>
        </div>
        {errors.decided ? (
          <p id="decided-error" className="mt-1.5 text-sm text-error">
            {errors.decided}
          </p>
        ) : null}
      </fieldset>

      {decided === true ? (
        <div>
          <label htmlFor="career" className="mb-2 block text-base font-medium text-ink">
            Career path
          </label>
          <input
            id="career"
            type="text"
            value={career}
            onChange={(event) => setCareer(event.target.value)}
            className={inputClassName}
            aria-describedby={errors.career ? "career-error" : undefined}
            aria-invalid={errors.career ? true : undefined}
          />
          {errors.career ? (
            <p id="career-error" className="mt-1.5 text-sm text-error">
              {errors.career}
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="interests"
          className="mb-2 block text-base font-medium text-ink"
        >
          Interests{" "}
          <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="interests"
          rows={3}
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
          placeholder="e.g. computers, design, biology, business"
          className={inputClassName}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-11 rounded-sm bg-primary-600 px-5 py-3 text-base font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {isSubmitting ? "Continuing..." : "Continue"}
      </button>
    </form>
  );
}
