'use client';

import { Text, Title, Card, Group, Stack, Badge } from '@mantine/core';

interface ArticleVerdictProps {
  data: {
    verdict: string;
    confidence: number;
    key_factors: string[];
  };
}

export function ArticleVerdict({ data }: ArticleVerdictProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'TRUE':
        return 'green';
      case 'MIXED':
        return 'yellow';
      case 'MISLEADING':
        return 'orange';
      case 'FALSE':
        return 'red';
      case 'UNVERIFIABLE':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Card withBorder p="md" style={{ height: 'fit-content' }}>
      <Title order={3} mb="md" id="verdict-title">
        Overall Verdict
      </Title>

      <Stack gap="md" role="region" aria-labelledby="verdict-title">
        <Group justify="center">
          <Badge
            size="xl"
            color={getVerdictColor(data.verdict)}
            variant="filled"
            style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}
            aria-label={`Article verdict: ${data.verdict}`}
          >
            {data.verdict}
          </Badge>
        </Group>

        <div style={{ textAlign: 'center' }}>
          <Text
            size="lg"
            fw={500}
            aria-label={`Confidence level: ${formatConfidence(data.confidence)}`}
          >
            Confidence: {formatConfidence(data.confidence)}
          </Text>
        </div>

        {data.key_factors && data.key_factors.length > 0 && (
          <div>
            <Text size="sm" fw={500} mb="xs">
              Key Factors:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {data.key_factors.map((factor: string, index: number) => (
                <li key={index}>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.4 }}>
                    {factor}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Stack>
    </Card>
  );
}
