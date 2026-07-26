export type Stream = "PCM" | "PCB" | "Commerce" | "Arts" | "Other";

export const STREAMS: Stream[] = [
  "PCM",
  "PCB",
  "Commerce",
  "Arts",
  "Other",
];

export type StudentProfile = {
  marks: number;
  stream: Stream;
  city: string;
  decided: boolean;
  career?: string;
  interests?: string;
};

export type College = {
  name: string;
  location: string;
  courses: string[];
  approxFees: string;
  admissionBasis: string;
  notes: string;
};

export type RecommendedCollege = Pick<College, "name" | "location"> & {
  course: string;
  fees: string;
  why: string;
};

export type AdviceResponse = {
  direction: { title: string; why: string; skills: string[] };
  colleges: RecommendedCollege[];
  checklist: { task: string; detail: string; deadline: string }[];
  meta: { dataSource: "seeded" | "live"; usedFallback: boolean };
};
