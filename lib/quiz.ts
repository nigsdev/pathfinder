/**
 * PathFinder — interest finder
 *
 * IMPORTANT — honesty constraint:
 * This is a short, UNVALIDATED interest questionnaire. It is loosely inspired by
 * interest-inventory structure (six broad interest areas) but it is NOT a
 * validated psychometric instrument and must never be presented as one.
 * Always label it "interest finder" or "direction quiz" in the UI.
 * Never use the words "psychometric", "assessment", "test", or "aptitude".
 *
 * Purpose: give an undecided student structured signal instead of a blank
 * "tell us your interests" box, and feed that signal into direction inference.
 */

export type Trait =
  | "building"    // hands-on, practical, making things work
  | "analysing"   // problems, patterns, figuring out why
  | "creating"    // design, expression, originality
  | "helping"     // people, teaching, care
  | "leading"     // persuading, organising people, enterprise
  | "organising"; // structure, accuracy, systems

export const TRAIT_LABELS: Record<Trait, string> = {
  building: "Building things",
  analysing: "Figuring things out",
  creating: "Creating and designing",
  helping: "Working with people",
  leading: "Leading and persuading",
  organising: "Organising and precision",
};

export interface QuizOption {
  label: string;
  traits: Trait[]; // 1-2 traits scored by this option
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

/**
 * 8 questions, concrete situations rather than abstract self-description —
 * students answer situations honestly but answer trait questions aspirationally.
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "It's a free Saturday. What actually sounds good?",
    options: [
      { label: "Fixing or assembling something at home", traits: ["building"] },
      { label: "Falling down an internet rabbit hole about something", traits: ["analysing"] },
      { label: "Editing videos, drawing, or making something", traits: ["creating"] },
      { label: "Being out with people", traits: ["helping", "leading"] },
    ],
  },
  {
    id: "q2",
    question: "Group project. Which part do you end up doing?",
    options: [
      { label: "The actual work — building the thing", traits: ["building"] },
      { label: "The research and the numbers", traits: ["analysing", "organising"] },
      { label: "The slides and how it looks", traits: ["creating"] },
      { label: "Dividing the work and keeping everyone moving", traits: ["leading"] },
    ],
  },
  {
    id: "q3",
    question: "Which would you learn even if no exam ever tested you on it?",
    options: [
      { label: "How machines and devices actually work", traits: ["building"] },
      { label: "How money and markets work", traits: ["analysing", "leading"] },
      { label: "Design, film, writing, or music", traits: ["creating"] },
      { label: "How people think and behave", traits: ["helping"] },
    ],
  },
  {
    id: "q4",
    question: "A friend is stuck on a problem. What's your instinct?",
    options: [
      { label: "Take a look and try to fix it yourself", traits: ["building"] },
      { label: "Ask questions until the real problem is clear", traits: ["analysing"] },
      { label: "Sit with them and hear them out first", traits: ["helping"] },
      { label: "Find someone who can sort it and connect them", traits: ["leading"] },
    ],
  },
  {
    id: "q5",
    question: "Which compliment would mean the most to you?",
    options: [
      { label: "\"You actually got it working.\"", traits: ["building"] },
      { label: "\"You spotted what everyone else missed.\"", traits: ["analysing"] },
      { label: "\"Nobody would have thought of that.\"", traits: ["creating"] },
      { label: "\"Nothing falls through the cracks with you.\"", traits: ["organising"] },
    ],
  },
  {
    id: "q6",
    question: "Which school subject did you mind the least?",
    options: [
      { label: "Practicals and lab work", traits: ["building"] },
      { label: "Maths or science theory", traits: ["analysing"] },
      { label: "Languages, arts, or humanities", traits: ["creating", "helping"] },
      { label: "Accounts, business, or economics", traits: ["organising", "leading"] },
    ],
  },
  {
    id: "q7",
    question: "On your phone or laptop, where does the time actually go?",
    options: [
      { label: "Trying out apps, tools, or games and tinkering", traits: ["building"] },
      { label: "Reading, watching explainers, learning things", traits: ["analysing"] },
      { label: "Making or editing content", traits: ["creating"] },
      { label: "Talking to people, group chats, communities", traits: ["helping", "leading"] },
    ],
  },
  {
    id: "q8",
    question: "Five years from now, what would a good workday look like?",
    options: [
      { label: "Building something and seeing it work", traits: ["building", "creating"] },
      { label: "Solving a hard problem nobody has cracked", traits: ["analysing"] },
      { label: "Helping someone directly and seeing it land", traits: ["helping"] },
      { label: "Running things — a team, a shop, your own setup", traits: ["leading", "organising"] },
    ],
  },
];

export type TraitScores = Record<Trait, number>;

export interface QuizResult {
  scores: TraitScores;
  topTraits: Trait[]; // up to 3, highest first
}

/** answers: { [questionId]: optionIndex } */
export function scoreQuiz(answers: Record<string, number>): QuizResult {
  const scores: TraitScores = {
    building: 0,
    analysing: 0,
    creating: 0,
    helping: 0,
    leading: 0,
    organising: 0,
  };

  for (const q of QUIZ_QUESTIONS) {
    const idx = answers[q.id];
    if (idx === undefined) continue;
    const option = q.options[idx];
    if (!option) continue;
    for (const t of option.traits) scores[t] += 1;
  }

  const topTraits = (Object.keys(scores) as Trait[])
    .sort((a, b) => scores[b] - scores[a])
    .filter((t) => scores[t] > 0)
    .slice(0, 3);

  return { scores, topTraits };
}

/* ------------------------------------------------------------------ *
 * Direction inference prompt
 * Move to lib/prompts/infer.ts if you prefer prompts kept together.
 * ------------------------------------------------------------------ */

export const INFER_SYSTEM_PROMPT = `
You are PathFinder, a careers counsellor for Indian students who have just
finished Class 12 and did not take NEET, JEE, CUET or CLAT.

This student has NOT decided what to do. They answered a short interest
questionnaire. Your job is to suggest 2-3 realistic career directions.

WHAT THE QUESTIONNAIRE IS
A short, informal interest questionnaire — not a validated instrument. Treat the
trait scores as soft signal, not as fact about the student. Weigh them alongside
their stream and marks. Never tell the student the quiz "determined" or "measured"
anything about them. Never mention scores or trait names back to them.

RULES
- Suggest directions with real entry routes for someone without an entrance-exam
  rank. No IIT/AIIMS-dependent paths.
- Be realistic about their marks, but never discouraging. Modest marks close some
  doors, not most.
- Prefer fields where demonstrable skill matters more than pedigree — that is
  something this student can control.
- Suggest genuinely different directions, not three versions of the same job.
- No guarantees about salary, placement, or admission.
- Plain language. A direction title a parent would understand.

VOICE
Warm, plain, direct, second person. Short sentences. Encouraging without hype.
No exclamation marks.

OUTPUT
Return ONE valid JSON object and nothing else — no markdown, no code fences:

{
  "directions": [
    {
      "title": "short direction, e.g. 'Software development'",
      "why": "2-3 sentences to the student on why this suits them, referring to
              what they enjoy in plain terms — never to trait names or scores",
      "rationale": "one internal sentence for the next stage on what to prioritise"
    }
  ]
}

Best fit first. Two or three directions, never more.
`.trim();

export function buildInferUserPrompt(input: {
  profile: { marks: number; stream: string; city: string; interests?: string };
  quiz: QuizResult;
}): string {
  const { profile, quiz } = input;
  const readable = quiz.topTraits.map((t) => TRAIT_LABELS[t]).join(", ");

  return `
STUDENT PROFILE
- Class 12 marks: ${profile.marks}%
- Stream: ${profile.stream}
- City: ${profile.city}
${profile.interests ? `- Stated interests: ${profile.interests}` : "- Stated interests: none given"}

INTEREST SIGNAL (soft — do not quote back to the student)
- Leaning towards: ${readable || "no clear leaning"}
- Raw scores: ${JSON.stringify(quiz.scores)}

Suggest 2-3 realistic directions. Return the JSON object only.
`.trim();
}

/** Used when inference fails — keeps the undecided path working. */
export const INFER_FALLBACK = {
  directions: [
    {
      title: "Start broad, then specialise",
      why: "We couldn't finish your full suggestion just now. A general degree in your stream keeps your options open while you build one practical skill alongside it.",
      rationale: "Recommend broad-base courses with wide exit options.",
    },
  ],
};
