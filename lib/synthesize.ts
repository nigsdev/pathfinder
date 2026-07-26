import OpenAI from "openai";
import { matchBestCourse } from "@/lib/college-match";
import {
  SYNTHESIS_FALLBACK,
  SYNTHESIS_SYSTEM_PROMPT,
  buildSynthesisUserPrompt,
} from "@/lib/prompts/synthesize";
import type {
  AdviceResponse,
  College,
  RecommendedCollege,
  StudentProfile,
} from "@/lib/types";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 20_000;

type SynthesisDirection = { title: string; rationale?: string };

type ParsedSynthesis = {
  direction: AdviceResponse["direction"];
  colleges: RecommendedCollege[];
  checklist: AdviceResponse["checklist"];
};

export type SynthesizeResult = Partial<AdviceResponse> & {
  usedFallback: boolean;
};

function collegesToRecommended(
  profile: StudentProfile,
  colleges: College[],
): RecommendedCollege[] {
  return colleges.map((college) => ({
    name: college.name,
    location: college.location,
    course: matchBestCourse(college.courses, profile.stream),
    fees: college.approxFees,
    why: `Matches your ${profile.stream} stream and is accessible from ${profile.city}.`,
  }));
}

function buildFallback(
  profile: StudentProfile,
  colleges: College[],
): ParsedSynthesis {
  return {
    direction: SYNTHESIS_FALLBACK.direction,
    checklist: SYNTHESIS_FALLBACK.checklist,
    colleges: collegesToRecommended(profile, colleges),
  };
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function isRecommendedCollege(value: unknown): value is RecommendedCollege {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.name === "string" &&
    typeof item.location === "string" &&
    typeof item.course === "string" &&
    typeof item.fees === "string" &&
    typeof item.why === "string"
  );
}

function isChecklistItem(
  value: unknown,
): value is AdviceResponse["checklist"][number] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.task === "string" &&
    typeof item.detail === "string" &&
    typeof item.deadline === "string"
  );
}

function isValidSynthesisShape(data: unknown): data is ParsedSynthesis {
  if (!data || typeof data !== "object") {
    return false;
  }

  const parsed = data as Record<string, unknown>;

  if (!parsed.direction || typeof parsed.direction !== "object") {
    return false;
  }

  const direction = parsed.direction as Record<string, unknown>;

  if (
    typeof direction.title !== "string" ||
    typeof direction.why !== "string" ||
    !Array.isArray(direction.skills) ||
    !direction.skills.every((skill) => typeof skill === "string")
  ) {
    return false;
  }

  if (!Array.isArray(parsed.colleges) || !Array.isArray(parsed.checklist)) {
    return false;
  }

  return (
    parsed.colleges.every(isRecommendedCollege) &&
    parsed.checklist.every(isChecklistItem)
  );
}

function filterCollegesBySupplied(
  colleges: RecommendedCollege[],
  supplied: College[],
): RecommendedCollege[] {
  const suppliedNames = new Set(supplied.map((college) => college.name));

  return colleges.filter((college) => suppliedNames.has(college.name));
}

export async function synthesize(
  profile: StudentProfile,
  colleges: College[],
  direction?: SynthesisDirection | null,
): Promise<SynthesizeResult> {
  const fallback = buildFallback(profile, colleges);

  if (!process.env.OPENAI_API_KEY) {
    console.error("[synthesize] OPENAI_API_KEY is not set");
    return { ...fallback, usedFallback: true };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await client.chat.completions.create(
      {
        model: MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildSynthesisUserPrompt({
              profile,
              direction: direction ?? null,
              colleges,
            }),
          },
        ],
      },
      { signal: controller.signal },
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty model response");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripJsonFences(content));
    } catch (parseError) {
      console.error("[synthesize] JSON.parse failed", parseError);
      throw new Error("Failed to parse synthesis JSON");
    }

    if (!isValidSynthesisShape(parsed)) {
      throw new Error("Invalid synthesis response shape");
    }

    const filteredColleges = filterCollegesBySupplied(parsed.colleges, colleges);

    if (filteredColleges.length === 0) {
      throw new Error("No valid colleges remained after hallucination filter");
    }

    return {
      direction: parsed.direction,
      colleges: filteredColleges,
      checklist: parsed.checklist,
      usedFallback: false,
    };
  } catch (error) {
    console.error("[synthesize]", error);
    return { ...fallback, usedFallback: true };
  } finally {
    clearTimeout(timeout);
  }
}
