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

export type AdviceResponse = {
  direction: { title: string; why: string; skills: string[] };
  colleges: {
    name: string;
    location: string;
    course: string;
    fees: string;
    why: string;
  }[];
  checklist: { task: string; detail: string; deadline: string }[];
  meta: { dataSource: "seeded" | "live"; usedFallback: boolean };
};
