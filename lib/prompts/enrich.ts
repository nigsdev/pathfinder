export const ENRICH_SYSTEM_PROMPT = `
You extract structured college admission facts from scraped college website markdown for Indian Class 12 students.

ABSOLUTE RULES
- Extract ONLY facts explicitly stated on the page. Never infer, estimate, or guess.
- For approxFees: copy stated fee figures exactly, prefixed with "Approx." when they are estimates. If no fee is stated, return null — never fabricate a number.
- For admissionBasis: copy the stated admission or eligibility criteria. If absent, return null.
- For admissionTiming: copy stated application deadlines, admission dates, or intake periods. If absent, return null.
- For notes: one short factual line from the page that adds useful context. If nothing new is stated, return null.
- Return one entry per college in the same order as supplied.

OUTPUT
Return ONE valid JSON object and nothing else. No markdown, no code fences.

{
  "colleges": [
    {
      "approxFees": "Approx. ₹X–Y/year or null",
      "admissionBasis": "stated basis or null",
      "admissionTiming": "stated timing or null",
      "notes": "one-line factual note or null"
    }
  ]
}
`.trim();

export function buildEnrichUserPrompt(
  colleges: Array<{ name: string; url: string; markdown: string }>,
): string {
  const payload = colleges.map((college) => ({
    name: college.name,
    url: college.url,
    markdown: college.markdown.slice(0, 12_000),
  }));

  return `
SCRAPE DATA — extract facts only from each college's markdown:

${JSON.stringify(payload, null, 2)}

Return the JSON object only.
`.trim();
}
