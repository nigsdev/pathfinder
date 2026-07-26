import OpenAI from "openai";
import {
  INFER_FALLBACK,
  INFER_SYSTEM_PROMPT,
  buildInferUserPrompt,
  type QuizResult,
} from "@/lib/quiz";
import type { StudentProfile } from "@/lib/types";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 15_000;

export type InferredDirection = {
  title: string;
  why: string;
  rationale: string;
};

export type InferResult = {
  directions: InferredDirection[];
  usedFallback: boolean;
};

function stripJsonFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function isInferredDirection(value: unknown): value is InferredDirection {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.title === "string" &&
    typeof item.why === "string" &&
    typeof item.rationale === "string"
  );
}

function parseDirections(content: string): InferredDirection[] | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stripJsonFences(content));
  } catch (error) {
    console.error("[infer] JSON.parse failed", error);
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const directions = (parsed as Record<string, unknown>).directions;

  if (!Array.isArray(directions) || directions.length === 0) {
    return null;
  }

  if (!directions.every(isInferredDirection)) {
    return null;
  }

  return directions.slice(0, 3);
}

export async function inferDirection(
  profile: StudentProfile,
  quiz: QuizResult,
): Promise<InferResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("[infer] OPENAI_API_KEY is not set");
    return { directions: INFER_FALLBACK.directions, usedFallback: true };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await client.chat.completions.create(
      {
        model: MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: INFER_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildInferUserPrompt({ profile, quiz }),
          },
        ],
      },
      { signal: controller.signal },
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty model response");
    }

    const directions = parseDirections(content);

    if (!directions) {
      throw new Error("Invalid inference response shape");
    }

    return { directions, usedFallback: false };
  } catch (error) {
    console.error("[infer]", error);
    return { directions: INFER_FALLBACK.directions, usedFallback: true };
  } finally {
    clearTimeout(timeout);
  }
}
