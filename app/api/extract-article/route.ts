import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Fetch the HTML content with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = `Failed to fetch URL: ${response.status} ${response.statusText}`;

            if (response.status === 403) {
                errorMessage = 'Access denied - this website blocks automated requests';
            } else if (response.status === 404) {
                errorMessage = 'Article not found - the URL may be invalid or the article has been removed';
            } else if (response.status >= 500) {
                errorMessage = 'Website server error - please try again later';
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const html = await response.text();

        // Parse HTML with JSDOM
        const dom = new JSDOM(html, { url });
        const document = dom.window.document;

        // Use Readability to extract article content
        const reader = new Readability(document);
        const article = reader.parse();

        if (!article) {
            return NextResponse.json(
                { error: 'Could not extract article content from this URL' },
                { status: 400 }
            );
        }

        // Validate that we got meaningful content
        if (!article.textContent || article.textContent.trim().length < 100) {
            return NextResponse.json(
                { error: 'Extracted content is too short - this may not be a valid article' },
                { status: 400 }
            );
        }

        // Extract metadata
        const metadata = {
            title: article.title || document.querySelector('title')?.textContent || '',
            content: article.textContent || '',
            length: article.length || 0,
            excerpt: article.excerpt || '',
            siteName: article.siteName || '',
            byline: article.byline || '',
            publishedTime: article.publishedTime || '',
            // Try to extract publish date from meta tags if not found by Readability
            publishDate: article.publishedTime ||
                document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                document.querySelector('meta[name="publish_date"]')?.getAttribute('content') ||
                document.querySelector('meta[name="date"]')?.getAttribute('content') ||
                null,
            author: article.byline ||
                document.querySelector('meta[name="author"]')?.getAttribute('content') ||
                document.querySelector('meta[property="article:author"]')?.getAttribute('content') ||
                null
        };

        return NextResponse.json({
            success: true,
            data: metadata,
            originalUrl: url
        });

    } catch (error) {
        console.error('Article extraction error:', error);

        let errorMessage = 'Failed to extract article';
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                errorMessage = 'Request timeout - the article took too long to load';
                statusCode = 408;
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
