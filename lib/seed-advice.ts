import type { AdviceResponse } from "@/lib/types";

export function getSeededAdvice(city: string): AdviceResponse {
  return {
    direction: {
      title: "BCA / BSc Computer Science",
      why: `With your PCM background and interest in technology, a BCA or BSc CS degree is a strong fit — it opens doors to software development, data analysis, and product roles without requiring a four-year engineering seat. Colleges near ${city} and across India offer solid programmes at a range of fee points.`,
      skills: [
        "Python basics",
        "Web development fundamentals",
        "Problem-solving & logic",
        "Database basics (SQL)",
        "Communication & teamwork",
        "Version control (Git)",
      ],
    },
    colleges: [
      {
        name: "Christ University",
        location: "Bangalore, Karnataka",
        course: "BCA (Honours)",
        fees: "₹1.8L/yr",
        why: `Well-regarded programme with strong campus placements; accessible from ${city} and widely recognised by employers.`,
      },
      {
        name: "Symbiosis Institute of Technology",
        location: "Pune, Maharashtra",
        course: "BSc Computer Science",
        fees: "₹2.1L/yr",
        why: "Industry-aligned curriculum with internship support — a good option if you're open to Pune.",
      },
      {
        name: "Amity University",
        location: "Noida, Uttar Pradesh",
        course: "BCA",
        fees: "₹1.5L/yr",
        why: "Flexible admission criteria and a large alumni network in tech — worth considering for a practical, career-focused path.",
      },
    ],
    checklist: [
      {
        task: "Check eligibility and cutoffs",
        detail:
          "Confirm minimum marks and stream requirements for each shortlisted college on their official admission pages.",
        deadline: "Before applications open (typically May–June)",
      },
      {
        task: "Shortlist and visit campuses",
        detail:
          "Pick your top 2–3 colleges and attend an open day or virtual tour if you can't travel.",
        deadline: "June",
      },
      {
        task: "Prepare your documents",
        detail:
          "Keep Class 10 and 12 marksheets, transfer certificate, ID proof, and passport-size photos ready in scanned copies.",
        deadline: "Before you apply",
      },
      {
        task: "Track application deadlines",
        detail:
          "Set reminders for each college's application window and entrance test dates (CUET, college-specific tests).",
        deadline: "June–July",
      },
    ],
    meta: {
      dataSource: "seeded",
      usedFallback: false,
    },
  };
}
