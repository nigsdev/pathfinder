import collegesData from "@/data/colleges.json";
import { matchBestCourse, scoreCollegeForStream } from "@/lib/college-match";
import type { College, StudentProfile } from "@/lib/types";

const MAX_COLLEGES = 5;

export async function getColleges(profile: StudentProfile): Promise<College[]> {
  // City filtering will be added when Exa live search arrives (Step 6).
  // All seeded entries are Delhi/NCR for the demo.
  void profile.city;

  const colleges = collegesData as College[];

  const ranked = colleges
    .map((college) => ({
      college,
      score: scoreCollegeForStream(college.courses, profile.stream),
    }))
    .sort((a, b) => a.score - b.score);

  return ranked.slice(0, MAX_COLLEGES).map(({ college }) => college);
}
