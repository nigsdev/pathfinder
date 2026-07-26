import Exa from "exa-js";
import OpenAI from "openai";
import {
  EXTRACT_SYSTEM_PROMPT,
  buildExtractUserPrompt,
} from "@/lib/prompts/extract";
import type { College, StudentProfile } from "@/lib/types";

const EXA_NUM_RESULTS = 8;
const EXA_SEARCH_TIMEOUT_MS = 8_000;
const EXTRACT_MODEL = "gpt-4o-mini";
const EXTRACT_TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 5 * 60 * 1000;

const STREAM_QUERY_TERMS: Record<StudentProfile["stream"], string> = {
  PCM: "BCA and BSc Computer Science",
  PCB: "BSc Life Sciences and Biotechnology",
  Commerce: "BCom and BBA",
  Arts: "BA and humanities",
  Other: "BCA BCom BA undergraduate",
};

type CacheEntry = {
  colleges: College[];
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

export function buildCollegeSearchQuery(
  profile: StudentProfile,
  direction?: string,
): string {
  const courseTerms = direction ?? STREAM_QUERY_TERMS[profile.stream];

  return `${courseTerms} colleges in ${profile.city} admission through Class 12 merit without JEE NEET CUET rank fees`;
}

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function isCollege(value: unknown): value is College {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.name === "string" &&
    typeof item.location === "string" &&
    Array.isArray(item.courses) &&
    item.courses.every((course) => typeof course === "string") &&
    typeof item.approxFees === "string" &&
    typeof item.admissionBasis === "string" &&
    typeof item.notes === "string" &&
    (item.url === undefined || typeof item.url === "string")
  );
}

function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function attachSourceUrls(
  colleges: College[],
  searchResults: Array<{ title: string | null; url: string }>,
): College[] {
  const usedUrls = new Set<string>();

  return colleges.map((college) => {
    if (college.url) {
      usedUrls.add(college.url);
      return college;
    }

    const collegeKey = normalizeForMatch(college.name);
    let bestMatch: { url: string; score: number } | null = null;

    for (const result of searchResults) {
      if (!result.url || usedUrls.has(result.url)) {
        continue;
      }

      const titleKey = normalizeForMatch(result.title ?? "");
      const score =
        titleKey.includes(collegeKey) || collegeKey.includes(titleKey)
          ? Math.min(collegeKey.length, titleKey.length)
          : 0;

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { url: result.url, score };
      }
    }

    if (bestMatch) {
      usedUrls.add(bestMatch.url);
      return { ...college, url: bestMatch.url };
    }

    return college;
  });
}

function parseExtractedColleges(content: string): College[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stripJsonFences(content));
  } catch (error) {
    console.error("[exa] JSON.parse failed during extraction", error);
    return [];
  }

  if (!parsed || typeof parsed !== "object") {
    return [];
  }

  const colleges = (parsed as Record<string, unknown>).colleges;

  if (!Array.isArray(colleges)) {
    return [];
  }

  return colleges.filter(isCollege);
}

async function extractCollegesFromResults(
  profile: StudentProfile,
  searchResults: Array<{
    title: string | null;
    url: string;
    text?: string;
    highlights?: string[];
  }>,
): Promise<College[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("[exa] OPENAI_API_KEY is not set for extraction");
    return [];
  }

  const payload = searchResults.map((result) => ({
    title: result.title,
    url: result.url,
    text: result.text?.slice(0, 4000),
    highlights: result.highlights?.slice(0, 8),
  }));

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXTRACT_TIMEOUT_MS);

  try {
    const response = await client.chat.completions.create(
      {
        model: EXTRACT_MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EXTRACT_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildExtractUserPrompt({
              profile: { stream: profile.stream, city: profile.city },
              searchResults: payload,
            }),
          },
        ],
      },
      { signal: controller.signal },
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return [];
    }

    const extracted = parseExtractedColleges(content);
    const withUrls = attachSourceUrls(extracted, searchResults);
    console.log(
      `[exa] extracted ${withUrls.length} colleges, ${withUrls.filter((c) => c.url).length} with URL`,
    );
    return withUrls;
  } catch (error) {
    console.error("[exa] extraction failed", error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchColleges(
  profile: StudentProfile,
  direction?: string,
): Promise<College[]> {
  const query = buildCollegeSearchQuery(profile, direction);
  const cached = cache.get(query);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.colleges;
  }

  if (!process.env.EXA_API_KEY) {
    console.error("[exa] EXA_API_KEY is not set");
    return [];
  }

  const exa = new Exa(process.env.EXA_API_KEY);

  try {
    const response = await Promise.race([
      exa.search(query, {
        numResults: EXA_NUM_RESULTS,
        contents: {
          text: true,
        },
      }),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Exa search timed out")),
          EXA_SEARCH_TIMEOUT_MS,
        );
      }),
    ]);

    const colleges = await extractCollegesFromResults(profile, response.results);

    cache.set(query, {
      colleges,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return colleges;
  } catch (error) {
    console.error("[exa] search failed", error);
    return [];
  }
}
