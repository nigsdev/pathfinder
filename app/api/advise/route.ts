import { getColleges } from "@/lib/retrieve";
import { synthesize } from "@/lib/synthesize";
import type { AdviceResponse } from "@/lib/types";
import { validateProfile } from "@/lib/validate-profile";

function normalizeCollegeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
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

    const retrieval = await getColleges(
      profile,
      direction?.title,
    );
    const synthesis = await synthesize(profile, retrieval.colleges, direction);

    const liveNames = new Set(
      retrieval.liveCollegeNames.map((name) => normalizeCollegeName(name)),
    );

    const colleges = synthesis.colleges!.map((college) => ({
      ...college,
      source: liveNames.has(normalizeCollegeName(college.name))
        ? ("live" as const)
        : ("seeded" as const),
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
