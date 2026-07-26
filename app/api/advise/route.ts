import { getSeededAdvice } from "@/lib/seed-advice";
import { validateProfile } from "@/lib/validate-profile";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, error } = validateProfile(body);

    if (error || !profile) {
      return Response.json({ error: error ?? "Invalid profile." }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const advice = getSeededAdvice(profile.city);

    return Response.json(advice);
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
