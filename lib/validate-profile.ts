import { STREAMS, type Stream, type StudentProfile } from "@/lib/types";

export function validateProfile(body: unknown): {
  profile: StudentProfile | null;
  error: string | null;
} {
  if (!body || typeof body !== "object") {
    return { profile: null, error: "Invalid request body." };
  }

  const data = body as Record<string, unknown>;

  if (typeof data.marks !== "number" || data.marks < 0 || data.marks > 100) {
    return { profile: null, error: "Marks must be a number between 0 and 100." };
  }

  if (!STREAMS.includes(data.stream as Stream)) {
    return { profile: null, error: "Invalid stream." };
  }

  if (typeof data.city !== "string" || !data.city.trim()) {
    return { profile: null, error: "City is required." };
  }

  if (typeof data.decided !== "boolean") {
    return { profile: null, error: "Decided field must be true or false." };
  }

  if (data.decided === true) {
    if (typeof data.career !== "string" || !data.career.trim()) {
      return {
        profile: null,
        error: "Career is required when you have decided on a path.",
      };
    }
  }

  const profile: StudentProfile = {
    marks: data.marks,
    stream: data.stream as Stream,
    city: data.city.trim(),
    decided: data.decided,
    ...(data.decided && typeof data.career === "string" && data.career.trim()
      ? { career: data.career.trim() }
      : {}),
    ...(typeof data.interests === "string" && data.interests.trim()
      ? { interests: data.interests.trim() }
      : {}),
  };

  return { profile, error: null };
}
