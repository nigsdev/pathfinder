import { matchBestCourse } from "@/lib/college-match";
import type {
  AdviceResponse,
  College,
  RecommendedCollege,
  StudentProfile,
} from "@/lib/types";

function toRecommendedCollege(
  college: College,
  profile: StudentProfile,
): RecommendedCollege {
  const course = matchBestCourse(college.courses, profile.stream);

  return {
    name: college.name,
    location: college.location,
    course,
    fees: college.approxFees,
    why: `Strong ${course} programme in ${college.location}; admission on ${college.admissionBasis.toLowerCase()}.`,
  };
}

function getDirection(profile: StudentProfile): AdviceResponse["direction"] {
  const streamDirections: Record<StudentProfile["stream"], AdviceResponse["direction"]> = {
    PCM: {
      title: "BCA / BSc Computer Science",
      why: `With your PCM background, a BCA or BSc CS degree is a strong fit — it opens doors to software development, data analysis, and product roles without requiring a JEE engineering seat. Colleges in Delhi/NCR and near ${profile.city} offer solid programmes at a range of fee points.`,
      skills: [
        "Python basics",
        "Web development fundamentals",
        "Problem-solving & logic",
        "Database basics (SQL)",
        "Communication & teamwork",
        "Version control (Git)",
      ],
    },
    PCB: {
      title: "BSc Life Sciences / Biotechnology",
      why: `With your PCB background, BSc programmes in life sciences or biotechnology are a practical path — they lead to research, healthcare-adjacent roles, and further study without NEET. Colleges in Delhi/NCR and near ${profile.city} offer recognised options.`,
      skills: [
        "Lab techniques & safety",
        "Research methodology",
        "Data analysis basics",
        "Scientific writing",
        "Critical thinking",
        "Team collaboration",
      ],
    },
    Commerce: {
      title: "BCom / BBA",
      why: `With your Commerce background, BCom or BBA programmes build directly on what you've studied — accounting, business, and management skills that employers recognise. Delhi/NCR has strong options accessible from ${profile.city}.`,
      skills: [
        "Accounting fundamentals",
        "Business communication",
        "Data literacy (Excel)",
        "Marketing basics",
        "Financial reasoning",
        "Presentation skills",
      ],
    },
    Arts: {
      title: "BA / Humanities & Social Sciences",
      why: `With your Arts background, a BA in humanities, economics, or social sciences keeps your options open — law, civil services, media, and further study are all on the table. Colleges in Delhi/NCR and near ${profile.city} offer well-regarded programmes.`,
      skills: [
        "Critical reading & writing",
        "Research & argumentation",
        "Communication",
        "Digital literacy",
        "Analytical thinking",
        "Teamwork",
      ],
    },
    Other: {
      title: "Flexible UG programmes (BCA, BCom, BA)",
      why: `Based on your profile, flexible undergraduate programmes — BCA, BCom, or BA — are worth exploring. Delhi/NCR colleges near ${profile.city} offer recognised courses without JEE or NEET.`,
      skills: [
        "Communication",
        "Digital literacy",
        "Problem-solving",
        "Research basics",
        "Teamwork",
        "Adaptability",
      ],
    },
  };

  return streamDirections[profile.stream];
}

const CHECKLIST: AdviceResponse["checklist"] = [
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
      "Set reminders for each college's application window and entrance test dates (CUET, GGSIPU CET, college-specific tests).",
    deadline: "June–July",
  },
];

export function buildSeededAdvice(
  profile: StudentProfile,
  colleges: College[],
): AdviceResponse {
  return {
    direction: getDirection(profile),
    colleges: colleges.map((college) => toRecommendedCollege(college, profile)),
    checklist: CHECKLIST,
    meta: {
      dataSource: "seeded",
      usedFallback: false,
    },
  };
}
