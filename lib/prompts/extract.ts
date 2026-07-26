export const EXTRACT_SYSTEM_PROMPT = `
You extract structured college data from web search results for Indian Class 12 students.

ABSOLUTE RULES
- Only extract colleges actually present in the supplied search results. Never invent an institution.
- If a fee is not stated in the results, set approxFees to "Not listed — check college site".
- Never fabricate a fee figure. Copy stated fees exactly, prefixed with "Approx." when they are estimates.
- If admission basis is unclear, use "Check college site".
- courses must be an array of undergraduate programme names found in the results (BCA, BCom, BBA, BA, BSc, etc.).
- url must be copied exactly from the search result that the college was extracted from. Omit only if no matching URL exists.
- Return an empty array if no valid colleges can be extracted.

OUTPUT
Return ONE valid JSON object and nothing else. No markdown, no code fences.

{
  "colleges": [
    {
      "name": "institution name",
      "location": "city/area, state if known",
      "courses": ["course 1", "course 2"],
      "approxFees": "Approx. ₹X–Y/year or Not listed — check college site",
      "admissionBasis": "e.g. Class 12 merit, CUET, university entrance test",
      "notes": "one short factual note from the results",
      "url": "source page URL from the matching search result"
    }
  ]
}
`.trim();

export function buildExtractUserPrompt(input: {
  profile: { stream: string; city: string };
  searchResults: unknown[];
}): string {
  return `
STUDENT CONTEXT
- Stream: ${input.profile.stream}
- City: ${input.profile.city}

SEARCH RESULTS — extract colleges only from this data:
${JSON.stringify(input.searchResults, null, 2)}

Return the JSON object only.
`.trim();
}
