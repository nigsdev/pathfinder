import { enrichColleges } from "@/lib/enrich";
import { getColleges } from "@/lib/retrieve";
import { synthesize } from "@/lib/synthesize";
import type { AdviceResponse } from "@/lib/types";
import { validateProfile } from "@/lib/validate-profile";

function normalizeCollegeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function logStageDuration(stage: string, startedAt: number): void {
  console.log(`[pipeline] ${stage} ${Math.round(performance.now() - startedAt)}ms`);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, error } = validateProfile(body);

    if (error || !profile) {
      return Response.json({ error: error ?? "Invalid profile." }, { status: 400 });
    }

    const direction =
      profile.decided && profile.career
        ? { title: profile.career }
        : undefined;

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
        usedFallback: retrieval.usedFallback || synthesis.usedFallback,
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
