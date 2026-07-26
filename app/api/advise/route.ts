import { enrichColleges } from "@/lib/enrich";
import { inferDirection } from "@/lib/infer";
import { getColleges } from "@/lib/retrieve";
import type { QuizResult } from "@/lib/quiz";
import { synthesize } from "@/lib/synthesize";
import type { AdviceResponse } from "@/lib/types";
import { validateProfile } from "@/lib/validate-profile";

function normalizeCollegeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function logStageDuration(stage: string, startedAt: number): void {
  console.log(`[pipeline] ${stage} ${Math.round(performance.now() - startedAt)}ms`);
}

function isQuizResult(value: unknown): value is QuizResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const quiz = value as Record<string, unknown>;

  if (!quiz.scores || typeof quiz.scores !== "object") {
    return false;
  }

  if (!Array.isArray(quiz.topTraits)) {
    return false;
  }

  return quiz.topTraits.every((trait) => typeof trait === "string");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profilePayload =
      body && typeof body === "object" && "profile" in body
        ? body.profile
        : body;
    const { profile, error } = validateProfile(profilePayload);

    if (error || !profile) {
      return Response.json({ error: error ?? "Invalid profile." }, { status: 400 });
    }

    const quiz =
      body && typeof body === "object" && "quiz" in body && isQuizResult(body.quiz)
        ? body.quiz
        : undefined;

    let direction: { title: string; rationale?: string } | undefined =
      profile.decided && profile.career
        ? { title: profile.career }
        : undefined;
    let counsellingWhy: string | undefined;
    let alternateDirections: string[] | undefined;
    let inferUsedFallback = false;

    if (quiz) {
      const inferStartedAt = performance.now();
      const inference = await inferDirection(profile, quiz);
      logStageDuration("infer", inferStartedAt);

      const chosen = inference.directions[0];
      direction = { title: chosen.title, rationale: chosen.rationale };
      counsellingWhy = chosen.why;
      alternateDirections = inference.directions.slice(1).map((item) => item.title);
      inferUsedFallback = inference.usedFallback;
    }

    const retrieveStartedAt = performance.now();
    const retrieval = await getColleges(
      profile,
      direction?.title,
    );
    logStageDuration("retrieve", retrieveStartedAt);

    const enrichStartedAt = performance.now();
    const enrichedColleges = await enrichColleges(retrieval.colleges);
    logStageDuration("enrich", enrichStartedAt);

    const synthesizeStartedAt = performance.now();
    const synthesis = await synthesize(profile, enrichedColleges, direction);
    logStageDuration("synthesize", synthesizeStartedAt);

    const liveNames = new Set(
      retrieval.liveCollegeNames.map((name) => normalizeCollegeName(name)),
    );

    const enrichedNames = new Set(
      enrichedColleges
        .filter((college) => college.enriched)
        .map((college) => normalizeCollegeName(college.name)),
    );

    const colleges = synthesis.colleges!.map((college) => ({
      ...college,
      source: liveNames.has(normalizeCollegeName(college.name))
        ? ("live" as const)
        : ("seeded" as const),
      enriched: enrichedNames.has(normalizeCollegeName(college.name)),
    }));

    const advice: AdviceResponse = {
      direction: synthesis.direction!,
      colleges,
      checklist: synthesis.checklist!,
      meta: {
        dataSource: retrieval.dataSource,
        usedFallback:
          retrieval.usedFallback ||
          synthesis.usedFallback ||
          inferUsedFallback,
        ...(quiz
          ? {
              fromQuiz: true,
              counsellingWhy,
              alternateDirections,
            }
          : {}),
      },
    };

    return Response.json(advice);
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
