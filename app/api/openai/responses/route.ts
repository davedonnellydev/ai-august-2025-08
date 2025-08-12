import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { MODEL, EXTRACTION_INSTRUCTIONS } from '@/app/config/constants';
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
        { error: 'Translation service temporarily unavailable' },
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

    const response = await client.responses.parse({
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

    console.log(response.output_parsed);

    if (response.status !== 'completed') {
      throw new Error(`Responses API error: ${response.status}`);
    }

    return NextResponse.json({
      response: response.output_parsed,
      originalInput: input,
      remainingRequests: ServerRateLimiter.getRemaining(ip),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'OpenAI failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
