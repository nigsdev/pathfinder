import { getColleges } from "@/lib/retrieve";
import { synthesize } from "@/lib/synthesize";
import type { AdviceResponse } from "@/lib/types";
import { validateProfile } from "@/lib/validate-profile";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, error } = validateProfile(body);

    if (error || !profile) {
      return Response.json({ error: error ?? "Invalid profile." }, { status: 400 });
    }

    const colleges = await getColleges(profile);
    const direction =
      profile.decided && profile.career
        ? { title: profile.career }
        : undefined;

    const synthesis = await synthesize(profile, colleges, direction);

    const advice: AdviceResponse = {
      direction: synthesis.direction!,
      colleges: synthesis.colleges!,
      checklist: synthesis.checklist!,
      meta: {
        dataSource: "seeded",
        usedFallback: synthesis.usedFallback,
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
