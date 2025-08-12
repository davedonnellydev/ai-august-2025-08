'use client';

import { useEffect, useState } from 'react';
import { Button, Text, TextInput, Title } from '@mantine/core';
import { ClientRateLimiter } from '@/app/lib/utils/api-helpers';
import { ArticleAnalysisDisplay } from '../ArticleAnalysisDisplay/ArticleAnalysisDisplay';
import classes from './ArticleInput.module.css';

export function ArticleInput() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [extractedArticle, setExtractedArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingRequests, setRemainingRequests] = useState(0);

  // Update remaining requests on component mount and after translations
  useEffect(() => {
    setRemainingRequests(ClientRateLimiter.getRemainingRequests());
  }, []);

  const handleRequest = async () => {
    if (!input.trim()) {
      setError('Please enter an article url to check');
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
      console.log('Extracted article:', extractResult.data);

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
      setResponse(JSON.stringify(analysisResult.response, null, 2));

      // Update remaining requests after successful analysis
      setRemainingRequests(ClientRateLimiter.getRemainingRequests());
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
      <Title className={classes.title} ta="center" mt={100}>
        Fake News Detector
      </Title>

      <div style={{ maxWidth: 600, margin: '20px auto', padding: '20px' }}>
        <TextInput
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          size="md"
          radius="md"
          label="Article URL:"
          placeholder="https://www.fakenews.com/article/123"
        />

        <Button
          variant="filled"
          color="cyan"
          onClick={() => handleRequest()}
          loading={isLoading}
        >
          Check Article
        </Button>
        <Button variant="light" color="cyan" onClick={() => handleReset()}>
          Reset
        </Button>

        {error && (
          <Text c="red" ta="center" size="lg" maw={580} mx="auto" mt="xl">
            Error: {error}
          </Text>
        )}

        {extractedArticle && (
          <div
            style={{
              margin: '20px 0',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          >
            <Title order={3} mb="md">
              Extracted Article
            </Title>
            <Text size="sm" c="dimmed" mb="xs">
              <strong>Title:</strong> {extractedArticle.title}
            </Text>
            {extractedArticle.author && (
              <Text size="sm" c="dimmed" mb="xs">
                <strong>Author:</strong> {extractedArticle.author}
              </Text>
            )}
            {extractedArticle.publishDate && (
              <Text size="sm" c="dimmed" mb="xs">
                <strong>Published:</strong> {extractedArticle.publishDate}
              </Text>
            )}
            <Text size="sm" c="dimmed" mb="xs">
              <strong>Length:</strong> {extractedArticle.length} characters
            </Text>
            <Text size="sm" c="dimmed" mb="xs">
              <strong>Excerpt:</strong> {extractedArticle.excerpt}
            </Text>
          </div>
        )}

        {response && (
          <div
            style={{
              margin: '20px 0',
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          >
            <Title order={3} mb="md">
              AI Analysis Results
            </Title>
            {(() => {
              try {
                const parsedData = JSON.parse(response);
                return <ArticleAnalysisDisplay data={parsedData} />;
              } catch (error) {
                return (
                  <div>
                    <Text c="red" mb="md">
                      Error parsing analysis results
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

      <Text c="dimmed" ta="center" size="sm" maw={580} mx="auto" mt="xl">
        You have {remainingRequests} article checks remaining.
      </Text>
    </>
  );
}
