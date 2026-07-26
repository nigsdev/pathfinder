import { buildSeededAdvice } from "@/lib/seed-advice";
import { getColleges } from "@/lib/retrieve";
import { validateProfile } from "@/lib/validate-profile";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, error } = validateProfile(body);

    if (error || !profile) {
      return Response.json({ error: error ?? "Invalid profile." }, { status: 400 });
    }

    const colleges = await getColleges(profile);
    const advice = buildSeededAdvice(profile, colleges);

    return Response.json(advice);
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
