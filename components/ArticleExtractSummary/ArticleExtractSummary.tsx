'use client';

import { Text, Title, Card, Stack } from '@mantine/core';

interface ArticleExtractSummaryProps {
  data: {
    title: string;
    content: string;
    length: number;
    excerpt: string;
    siteName?: string;
    author?: string;
    publishDate?: string;
  };
}

export function ArticleExtractSummary({ data }: ArticleExtractSummaryProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card withBorder p="md" style={{ height: 'fit-content' }}>
      <Title order={3} mb="md" id="extracted-article-title">
        Extracted Article
      </Title>

      <Stack gap="md" role="region" aria-labelledby="extracted-article-title">
        <div>
          <Text size="sm" c="dimmed" mb="xs">
            <strong>Title:</strong>
          </Text>
          <Text size="md" fw={500}>
            {data.title}
          </Text>
        </div>

        {data.author && (
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              <strong>Author:</strong>
            </Text>
            <Text size="sm">{data.author}</Text>
          </div>
        )}

        {data.publishDate && (
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              <strong>Published:</strong>
            </Text>
            <Text size="sm">{formatDate(data.publishDate)}</Text>
          </div>
        )}

        <div>
          <Text size="sm" c="dimmed" mb="xs">
            <strong>Length:</strong>
          </Text>
          <Text size="sm">{data.length.toLocaleString()} characters</Text>
        </div>

        <div>
          <Text size="sm" c="dimmed" mb="xs">
            <strong>Excerpt:</strong>
          </Text>
          <Text size="sm" style={{ lineHeight: 1.5 }}>
            {data.excerpt}
          </Text>
        </div>

        {data.siteName && (
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              <strong>Source:</strong>
            </Text>
            <Text size="sm">{data.siteName}</Text>
          </div>
        )}
      </Stack>
    </Card>
  );
}
