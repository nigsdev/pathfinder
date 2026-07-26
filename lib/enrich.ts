import { Firecrawl } from "firecrawl";
import OpenAI from "openai";
import {
  ENRICH_SYSTEM_PROMPT,
  buildEnrichUserPrompt,
} from "@/lib/prompts/enrich";
import type { College } from "@/lib/types";

const ENRICH_TIMEOUT_MS = 6_000;
const ENRICH_MODEL = "gpt-4o-mini";
const EXTRACT_TIMEOUT_MS = 4_000;
const MAX_ENRICH = 2;
const SCRAPE_TIMEOUT_MS = 4_000;

type EnrichmentFields = {
  approxFees: string | null;
  admissionBasis: string | null;
  admissionTiming: string | null;
  notes: string | null;
};

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function isRealValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function mergeEnrichment(base: College, fields: EnrichmentFields): College {
  const merged: College = { ...base };

  if (isRealValue(fields.approxFees)) {
    merged.approxFees = fields.approxFees;
  }

  if (isRealValue(fields.admissionBasis)) {
    merged.admissionBasis = fields.admissionBasis;
  }

  if (isRealValue(fields.admissionTiming)) {
    merged.admissionTiming = fields.admissionTiming;
  }

  if (isRealValue(fields.notes)) {
    merged.notes = fields.notes;
  }

  return merged;
}

function hasEnrichmentDelta(before: College, after: College): boolean {
  return (
    before.approxFees !== after.approxFees ||
    before.admissionBasis !== after.admissionBasis ||
    before.admissionTiming !== after.admissionTiming ||
    before.notes !== after.notes
  );
}

async function scrapeCollegeUrl(
  firecrawl: Firecrawl,
  url: string,
): Promise<string | null> {
  const doc = await firecrawl.scrape(url, {
    formats: ["markdown"],
    onlyMainContent: true,
    timeout: SCRAPE_TIMEOUT_MS,
  });

  return doc.markdown?.trim() || null;
}

async function extractEnrichmentFields(
  colleges: Array<{ name: string; url: string; markdown: string }>,
): Promise<EnrichmentFields[] | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("[enrich] OPENAI_API_KEY is not set");
    return null;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXTRACT_TIMEOUT_MS);

  try {
    const response = await client.chat.completions.create(
      {
        model: ENRICH_MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ENRICH_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildEnrichUserPrompt(colleges),
          },
        ],
      },
      { signal: controller.signal },
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return null;
    }

    const parsed = JSON.parse(stripJsonFences(content)) as {
      colleges?: EnrichmentFields[];
    };

    if (!Array.isArray(parsed.colleges)) {
      return null;
    }

    return parsed.colleges;
  } catch (error) {
    console.error("[enrich] extraction failed", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function runEnrichment(colleges: College[]): Promise<College[]> {
  const targets = colleges
    .filter((college): college is College & { url: string } =>
      Boolean(college.url),
    )
    .slice(0, MAX_ENRICH);

  if (targets.length === 0 || !process.env.FIRECRAWL_API_KEY) {
    if (targets.length > 0) {
      console.error("[enrich] FIRECRAWL_API_KEY is not set");
    }
    return colleges;
  }

  const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

  const scrapeResults = await Promise.allSettled(
    targets.map(async (college) => ({
      college,
      markdown: await scrapeCollegeUrl(firecrawl, college.url),
    })),
  );

  const scraped = scrapeResults.flatMap((result) => {
    if (result.status !== "fulfilled" || !result.value.markdown) {
      return [];
    }

    return [
      {
        college: result.value.college,
        name: result.value.college.name,
        url: result.value.college.url,
        markdown: result.value.markdown,
      },
    ];
  });

  if (scraped.length === 0) {
    return colleges;
  }

  const extracted = await extractEnrichmentFields(scraped);

  if (!extracted || extracted.length !== scraped.length) {
    return colleges;
  }

  const enrichedByName = new Map<string, College>();

  for (let index = 0; index < scraped.length; index += 1) {
    const { college } = scraped[index];
    const merged = mergeEnrichment(college, extracted[index]);

    if (hasEnrichmentDelta(college, merged)) {
      enrichedByName.set(college.name, { ...merged, enriched: true });
    }
  }

  if (enrichedByName.size === 0) {
    return colleges;
  }

  return colleges.map((college) => enrichedByName.get(college.name) ?? college);
}

export async function enrichColleges(colleges: College[]): Promise<College[]> {
  try {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const result = await Promise.race([
      runEnrichment(colleges),
      new Promise<College[]>((resolve) => {
        timeoutId = setTimeout(() => {
          console.error("[enrich] enrichment timed out");
          resolve(colleges);
        }, ENRICH_TIMEOUT_MS);
      }),
    ]);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return result;
  } catch (error) {
    console.error("[enrich] enrichment failed", error);
    return colleges;
  }
}
