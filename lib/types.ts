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
