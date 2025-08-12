'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Button,
  Text,
  TextInput,
  Title,
  Group,
  Grid,
  Container,
} from '@mantine/core';
import { ClientRateLimiter } from '@/app/lib/utils/api-helpers';
import { ArticleAnalysisDisplay } from '../ArticleAnalysisDisplay/ArticleAnalysisDisplay';
import { ArticleExtractSummary } from '../ArticleExtractSummary/ArticleExtractSummary';
import { ArticleVerdict } from '../ArticleVerdict/ArticleVerdict';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import classes from './ArticleInput.module.css';

export function ArticleInput() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [extractedArticle, setExtractedArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingRequests, setRemainingRequests] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Update remaining requests on component mount and after translations
  useEffect(() => {
    setRemainingRequests(ClientRateLimiter.getRemainingRequests());
  }, []);

  const handleRequest = async () => {
    if (!input.trim()) {
      setError('Please enter an article url to check');
      inputRef.current?.focus();
      return;
    }

    // Check rate limit before proceeding
    if (!ClientRateLimiter.checkLimit()) {
      setError('Rate limit exceeded. Please try again later.');
      setRemainingRequests(ClientRateLimiter.getRemainingRequests());
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, extract article content from the URL
      const extractResponse = await fetch('/api/extract-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: input,
        }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract article content');
      }

      const extractResult = await extractResponse.json();
      setExtractedArticle(extractResult.data);

      // Now send the extracted content to OpenAI for analysis
      const analysisResponse = await fetch('/api/openai/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: extractResult.data.content,
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        console.log(errorData);
        throw new Error(errorData.error || 'AI analysis failed');
      }

      const analysisResult = await analysisResponse.json();
      console.log('Analysis result:', analysisResult);

      if (!analysisResult.response) {
        throw new Error('No response data received from analysis API');
      }

      setResponse(JSON.stringify(analysisResult.response, null, 2));
      console.log('Parsed response:', analysisResult.response);
      // Update remaining requests after successful analysis
      setRemainingRequests(ClientRateLimiter.getRemainingRequests());

      // Focus on results for screen readers
      setTimeout(() => {
        resultsRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('API error:', err);
      setError(err instanceof Error ? err.message : 'API failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInput('');
    setResponse('');
    setExtractedArticle(null);
    setError('');
  };

  return (
    <>
      <Title className={classes.title} ta="center" mt={{ base: 60, md: 100 }}>
        Fake News Detector
      </Title>

      <Container size="xl" mt="xl" px={{ base: 'md', md: 'xl' }}>
        {/* Input Section */}
        <div className={classes.inputSection}>
          <TextInput
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            size="md"
            radius="md"
            label="Article URL:"
            placeholder="https://www.fakenews.com/article/123"
            mb="md"
            aria-label="Enter the URL of the article you want to analyze"
            aria-describedby="url-help"
            aria-required="true"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !isLoading) {
                handleRequest();
              }
            }}
          />
          <Text id="url-help" size="xs" c="dimmed" mb="md">
            Paste the full URL of a news article to analyze its credibility
          </Text>

          <Group gap="md" wrap="wrap">
            <Button
              variant="filled"
              color="cyan"
              onClick={() => handleRequest()}
              loading={isLoading}
              aria-label="Analyze the article for fake news detection"
              disabled={!input.trim()}
            >
              Check Article
            </Button>
            <Button
              variant="light"
              color="cyan"
              onClick={() => handleReset()}
              aria-label="Clear the form and reset all results"
            >
              Reset
            </Button>
          </Group>

          {error && (
            <Text c="red" ta="center" size="lg" mt="xl">
              Error: {error}
            </Text>
          )}
        </div>

        {/* Loading State - Show during extraction */}
        {isLoading && !extractedArticle && (
          <LoadingSpinner message="Extracting article content..." />
        )}

        {/* Loading State - Show during analysis */}
        {isLoading && extractedArticle && (
          <LoadingSpinner message="Analyzing article..." />
        )}

        {/* Results Section */}
        {extractedArticle && (
          <div ref={resultsRef} tabIndex={-1} aria-label="Analysis results">
            {/* Top Row: Article Summary and Verdict */}
            <Grid gutter={{ base: 'md', md: 'lg' }} mb="xl">
              <Grid.Col span={{ base: 12, lg: 6 }}>
                <ArticleExtractSummary data={extractedArticle} />
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 6 }}>
                {response
                  ? (() => {
                      try {
                        const parsedData = JSON.parse(response);
                        if (!parsedData.article) {
                          return (
                            <Text c="red">
                              Error: No article data in analysis results
                            </Text>
                          );
                        }
                        return <ArticleVerdict data={parsedData.article} />;
                      } catch (error) {
                        console.error(
                          'JSON parse error:',
                          error,
                          'Response:',
                          response
                        );
                        return (
                          <Text c="red">
                            Error parsing analysis results:{' '}
                            {error instanceof Error
                              ? error.message
                              : 'Unknown error'}
                          </Text>
                        );
                      }
                    })()
                  : null}
              </Grid.Col>
            </Grid>

            {/* Bottom Section: Detailed Claims Analysis */}
            {response && (
              <div role="region" aria-label="Detailed claims analysis results">
                <Title order={3} mb="lg" ta="center">
                  Detailed Claims Analysis
                </Title>
                {(() => {
                  try {
                    const parsedData = JSON.parse(response);
                    if (!parsedData.assessments) {
                      return (
                        <Text c="red" ta="center">
                          Error: No assessments data in analysis results
                        </Text>
                      );
                    }
                    return <ArticleAnalysisDisplay data={parsedData} />;
                  } catch (error) {
                    console.error(
                      'JSON parse error in analysis display:',
                      error,
                      'Response:',
                      response
                    );
                    return (
                      <div>
                        <Text c="red" mb="md" ta="center">
                          Error parsing analysis results:{' '}
                          {error instanceof Error
                            ? error.message
                            : 'Unknown error'}
                        </Text>
                        <pre
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '12px',
                            backgroundColor: '#f5f5f5',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxHeight: '400px',
                          }}
                        >
                          {response}
                        </pre>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        )}
      </Container>

      <Text
        c="dimmed"
        ta="center"
        size="sm"
        maw={580}
        mx="auto"
        mt="xl"
        px="md"
      >
        You have {remainingRequests} article checks remaining.
      </Text>
    </>
  );
}
