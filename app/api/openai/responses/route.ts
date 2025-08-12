import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import {
  MODEL,
  EXTRACTION_INSTRUCTIONS,
  EVIDENCE_INSTRUCTIONS,
  VERIFICATION_INSTRUCTIONS,
} from '@/app/config/constants';
import { InputValidator, ServerRateLimiter } from '@/app/lib/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Server-side rate limiting
    if (!ServerRateLimiter.checkLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { input } = await request.json();

    // Enhanced validation
    const textValidation = InputValidator.validateText(input, 100000);
    if (!textValidation.isValid) {
      return NextResponse.json(
        { error: textValidation.error },
        { status: 400 }
      );
    }

    // Environment validation
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI analysis service temporarily unavailable' },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
    });

    // Enhanced content moderation
    const moderatedText = await client.moderations.create({
      input,
    });

    const { flagged, categories } = moderatedText.results[0];

    if (flagged) {
      const keys: string[] = Object.keys(categories);
      const flaggedCategories = keys.filter(
        (key: string) => categories[key as keyof typeof categories]
      );
      return NextResponse.json(
        {
          error: `Content flagged as inappropriate: ${flaggedCategories.join(', ')}`,
        },
        { status: 400 }
      );
    }
    const Entity = z.object({
      name: z.string(),
      type: z.enum(['PERSON', 'ORG', 'GPE', 'EVENT', 'PRODUCT', 'OTHER']),
    });

    const Claim = z.object({
      id: z.string(),
      text: z.string(),
      importance: z.enum(['high', 'medium', 'low']),
      subject: z.string(),
      predicate: z.string(),
      object: z.string(),
      time: z.string(),
      location: z.string(),
      entities: z.array(Entity),
      retrieval_query: z.string(),
      source_sentence: z.string(),
    });

    const ClaimList = z.object({
      article_title: z.string().nullable(),
      claims: z.array(Claim).min(1),
    });

    const EvidenceDoc = z.object({
      id: z.string(), // stable id
      url: z.string(),
      title: z.string(),
      published_at: z.string(), // ISO
      passage: z.string(), // ~1–3 sentences
      source_type: z.enum(['primary', 'secondary', 'unknown']),
    });

    const EvidenceBundle = z.object({ results: z.array(EvidenceDoc) });

    const ClaimAssessment = z.object({
      claim_id: z.string(),
      label: z.enum(['SUPPORTED', 'CONTRADICTED', 'INSUFFICIENT_EVIDENCE']),
      confidence: z.number().min(0).max(1),
      cited_evidence_ids: z.array(z.string()).min(0),
      rationale: z.string(), // 1–3 sentences
    });

    const ArticleVerdict = z.object({
      verdict: z.enum(['TRUE', 'MIXED', 'MISLEADING', 'FALSE', 'UNVERIFIABLE']),
      confidence: z.number().min(0).max(1),
      key_factors: z.array(z.string()),
    });

    const VerificationReport = z.object({
      assessments: z.array(ClaimAssessment),
      article: ArticleVerdict,
    });

    const claimsList = await client.responses.parse({
      model: MODEL,
      instructions: EXTRACTION_INSTRUCTIONS,
      input: [
        {
          role: 'user',
          content: input,
        },
      ],
      text: {
        format: zodTextFormat(ClaimList, 'claims_list'),
      },
    });

    const evidenceBundle = await client.responses.parse({
      model: MODEL,
      instructions: EVIDENCE_INSTRUCTIONS,
      input: [
        {
          role: 'user',
          content: JSON.stringify({
            claimsList,
            policy: { time_window_days: 365 },
          }),
        },
      ],
      tools: [
        {
          type: 'function',
          name: 'web_evidence_search',
          description: 'Search reputable sources; return dated passages.',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for finding relevant evidence.',
              },
              time_window_days: {
                type: 'integer',
                minimum: 1,
                maximum: 365,
                description: 'Maximum age of sources in days.',
              },
              max_results: {
                type: 'integer',
                minimum: 3,
                maximum: 10,
                description: 'Maximum number of search results to return.',
              },
            },
            required: ['query', 'time_window_days', 'max_results'],
            additionalProperties: false,
          },
          strict: true,
        },
      ],
      tool_choice: 'auto',
      text: {
        format: zodTextFormat(EvidenceBundle, 'evidence_bundle'),
      },
    });

    const claimsPackage = {
      claimsList,
      evidenceBundle,
    };

    const response = await client.responses.parse({
      model: MODEL,
      instructions: VERIFICATION_INSTRUCTIONS,
      input: [
        {
          role: 'user',
          content: JSON.stringify({ claimsPackage }),
        },
      ],
      text: {
        format: zodTextFormat(VerificationReport, 'verification_report'),
      },
    });

    if (response.status !== 'completed') {
      throw new Error(`Responses API error: ${response.status}`);
    }

    console.log('API response output_parsed:', response.output_parsed);

    return NextResponse.json({
      response: response.output_parsed,
      originalInput: input,
      remainingRequests: ServerRateLimiter.getRemaining(ip),
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'OpenAI failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
