import type { Stream } from "@/lib/types";

const STREAM_COURSE_PRIORITIES: Record<Stream, string[]> = {
  PCM: ["BCA", "BSc Computer", "BSc (Computer Science)", "BSc IT", "BSc (CS)", "BSc Mathematical"],
  PCB: ["BSc Life", "BSc Biotech", "BSc Biology", "BSc (Hons) Physics", "BSc (Hons) Biotechnology"],
  Commerce: ["BCom", "BBA", "BMS"],
  Arts: ["BA", "BJMC"],
  Other: [],
};

function courseMatchesKeyword(course: string, keyword: string): boolean {
  return course.toLowerCase().includes(keyword.toLowerCase());
}

export function scoreCollegeForStream(
  courses: string[],
  stream: Stream,
): number {
  const priorities = STREAM_COURSE_PRIORITIES[stream];

  if (stream === "Other" || priorities.length === 0) {
    return 0;
  }

  let bestScore = 999;

  for (const course of courses) {
    for (let index = 0; index < priorities.length; index++) {
      if (courseMatchesKeyword(course, priorities[index]!)) {
        bestScore = Math.min(bestScore, index);
      }
    }
  }

  return bestScore;
}

export function matchBestCourse(courses: string[], stream: Stream): string {
  const priorities = STREAM_COURSE_PRIORITIES[stream];

  if (stream === "Other" || priorities.length === 0) {
    return courses[0] ?? "";
  }

  for (const keyword of priorities) {
    const match = courses.find((course) => courseMatchesKeyword(course, keyword));
    if (match) {
      return match;
    }
  }

  return courses[0] ?? "";
}
