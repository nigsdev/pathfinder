import collegesData from "@/data/colleges.json";
import { scoreCollegeForStream } from "@/lib/college-match";
import { searchColleges } from "@/lib/exa";
import type { College, StudentProfile } from "@/lib/types";

const MAX_COLLEGES = 5;

export type RetrieveResult = {
  colleges: College[];
  dataSource: "live" | "seeded";
  usedFallback: boolean;
  liveCollegeNames: string[];
};

function normalizeCollegeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function rankSeededColleges(profile: StudentProfile): College[] {
  const colleges = collegesData as College[];

  return colleges
    .map((college) => ({
      college,
      score: scoreCollegeForStream(college.courses, profile.stream),
    }))
    .sort((a, b) => a.score - b.score)
    .map(({ college }) => college);
}

function mergeColleges(live: College[], seeded: College[]): {
  colleges: College[];
  liveCollegeNames: string[];
} {
  const seen = new Set<string>();
  const merged: College[] = [];
  const liveCollegeNames: string[] = [];

  for (const college of live) {
    const key = normalizeCollegeName(college.name);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(college);
    liveCollegeNames.push(college.name);
  }

  for (const college of seeded) {
    const key = normalizeCollegeName(college.name);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(college);
  }

  return {
    colleges: merged.slice(0, MAX_COLLEGES),
    liveCollegeNames: liveCollegeNames.filter((name) =>
      merged.slice(0, MAX_COLLEGES).some((college) => college.name === name),
    ),
  };
}

export async function getColleges(
  profile: StudentProfile,
  direction?: string,
): Promise<RetrieveResult> {
  const seededColleges = rankSeededColleges(profile);
  let liveColleges: College[] = [];
  let exaFailed = true;

  try {
    liveColleges = await searchColleges(profile, direction);
    exaFailed = false;
  } catch (error) {
    console.error("[retrieve] live search failed", error);
  }

  if (exaFailed || liveColleges.length === 0) {
    return {
      colleges: seededColleges.slice(0, MAX_COLLEGES),
      dataSource: "seeded",
      usedFallback: true,
      liveCollegeNames: [],
    };
  }

  const { colleges, liveCollegeNames } = mergeColleges(
    liveColleges,
    seededColleges,
  );

  return {
    colleges,
    dataSource: liveCollegeNames.length > 0 ? "live" : "seeded",
    usedFallback: false,
    liveCollegeNames,
  };
}
