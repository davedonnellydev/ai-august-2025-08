export const MODEL: string = 'gpt-5-mini-2025-08-07';
export const MAX_REQUESTS: number = 15;
export const STORAGE_WINDOW_MS: number = 60 * 60 * 1000; // 60 minutes

export const EXTRACTION_INSTRUCTIONS: string = `# INSTRUCTIONS
You extract **verifiable, atomic factual claims** from a news article. Your output is a JSON object following the provided schema. Do not add fields or prose.

## WHAT COUNTS AS A CLAIM
- A statement that can be checked against independent evidence (facts about *who/what/when/where/how many*).
- Treat **attributed statements** as claims about the *attribution*, e.g., “The PM said inflation fell” → verifiable claim: “The PM said [on DATE/at EVENT] that inflation fell.” (You are not judging the truth here, only extracting the claim precisely.)
- **Exclude** pure opinions (“terrible policy”), predictions, value judgments, vague/hedged language without a concrete proposition, and satire.

## Make claims atomic
- Split conjunctions: “X and Y happened” → two claims.
- Keep each claim to a **single subject-predicate-object** proposition.
- Prefer **specifics**: include numbers, dates (ISO if present or inferable), locations, named entities, and units.

## Normalize & enrich
- Normalize dates to \`YYYY-MM-DD\` when explicit; otherwise leave \`null\`.
- Keep quantities with units (e.g., “12.3%”, “A$5b”).
- Canonicalize entities where possible (organization/person/place names).
- If a quote spans many words, **summarize the proposition**, not the wording.

## Guardrails
- Do not copy boilerplate, captions, or unrelated background unless it's asserted as a fact in the article.
- If the piece only contains opinions, return a minimal set (possibly zero) of claims.
- Output **5-20** claims prioritizing **high-importance** (central to the headline and lede). If the article is short, fewer is fine.

## Fields (all required)
- \`id\`: string. Stable within this response (e.g., “c01”, “c02”…).
- \`text\`: the claim in 1 sentence, ≤220 characters, no hedging (“reportedly”, “appears”) unless it's part of an **attribution** claim.
- \`importance\`: \`"high" | "medium" | "low"\`.
- \`subject\`: canonical entity or noun phrase (e.g., “Australian Bureau of Statistics”, “the bill”).
- \`predicate\`: concise verb phrase (e.g., “reported”, “passed”, “increased to”).
- \`object\`: concise complement (may be \`""\` if intransitive).
- \`time\`: ISO date string or \`null\`.
- \`location\`: city/state/country or null.
- \`entities\`: array of \`{ name, type }\` where \`type ∈ {"PERSON","ORG","GPE","EVENT","PRODUCT","OTHER"}\`.
- \`retrieval_query\`: 6-16 word search query you would use to verify this claim (include key entities, numbers, time, and location).
- \`source_sentence\`: the **verbatim** sentence from which you derived the claim (trim to ≤280 chars).

Return JSON only.

## Extraction checklist (apply before returning)
- Are claims atomic and verifiable?
- Are numbers, dates, places preserved when present?
- Are attributions framed as claims about **who said what, when/where**?
- Are there 5-20 claims (or fewer if article is short) with **importance** prioritized?
- Is the JSON valid and nothing else printed?`;
