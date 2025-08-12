'use client';

import { Text, Title, Badge, Card, Group, Stack } from '@mantine/core';
import classes from './ArticleAnalysisDisplay.module.css';

export function ArticleAnalysisDisplay({ data }: { data: any }) {
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

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'SUPPORTED':
        return 'green';
      case 'CONTRADICTED':
        return 'red';
      case 'INSUFFICIENT_EVIDENCE':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Stack gap="lg">
      {/* Overall Article Verdict */}
      <Card withBorder p="md">
        <Group justify="space-between" align="center" mb="sm">
          <Title order={4}>Overall Verdict</Title>
          <Badge
            size="lg"
            color={getVerdictColor(data.article?.verdict)}
            variant="filled"
          >
            {data.article?.verdict || 'UNKNOWN'}
          </Badge>
        </Group>

        <Group gap="md" mb="sm">
          <Text size="sm">
            <strong>Confidence:</strong>{' '}
            {formatConfidence(data.article?.confidence || 0)}
          </Text>
        </Group>

        {data.article?.key_factors && data.article.key_factors.length > 0 && (
          <div>
            <Text size="sm" fw={500} mb="xs">
              Key Factors:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {data.article.key_factors.map((factor: string, index: number) => (
                <li key={index}>
                  <Text size="sm" c="dimmed">
                    {factor}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Individual Claim Assessments */}
      {data.assessments && data.assessments.length > 0 && (
        <Card withBorder p="md">
          <Title order={4} mb="md">
            Claim Assessments
          </Title>
          <Stack gap="md">
            {data.assessments.map((assessment: any, index: number) => (
              <Card
                key={assessment.claim_id}
                withBorder
                p="sm"
                style={{ backgroundColor: '#fafafa' }}
              >
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Group gap="xs">
                    <Badge size="sm" variant="outline">
                      {assessment.claim_id}
                    </Badge>
                    <Badge
                      color={getLabelColor(assessment.label)}
                      variant="filled"
                    >
                      {assessment.label}
                    </Badge>
                  </Group>
                  <Badge size="sm" variant="light">
                    {formatConfidence(assessment.confidence)}
                  </Badge>
                </Group>

                <Text size="sm" mb="xs">
                  <strong>Rationale:</strong> {assessment.rationale}
                </Text>

                {assessment.cited_evidence_ids &&
                  assessment.cited_evidence_ids.length > 0 && (
                    <Text size="xs" c="dimmed">
                      <strong>Evidence IDs:</strong>{' '}
                      {assessment.cited_evidence_ids.join(', ')}
                    </Text>
                  )}
              </Card>
            ))}
          </Stack>
        </Card>
      )}

      {/* Summary Statistics */}
      {data.assessments && data.assessments.length > 0 && (
        <Card withBorder p="md">
          <Title order={4} mb="md">
            Summary Statistics
          </Title>
          <Group gap="xl">
            <div>
              <Text size="lg" fw={700} c="green">
                {
                  data.assessments.filter((a: any) => a.label === 'SUPPORTED')
                    .length
                }
              </Text>
              <Text size="sm" c="dimmed">
                Supported Claims
              </Text>
            </div>
            <div>
              <Text size="lg" fw={700} c="red">
                {
                  data.assessments.filter(
                    (a: any) => a.label === 'CONTRADICTED'
                  ).length
                }
              </Text>
              <Text size="sm" c="dimmed">
                Contradicted Claims
              </Text>
            </div>
            <div>
              <Text size="lg" fw={700} c="yellow">
                {
                  data.assessments.filter(
                    (a: any) => a.label === 'INSUFFICIENT_EVIDENCE'
                  ).length
                }
              </Text>
              <Text size="sm" c="dimmed">
                Insufficient Evidence
              </Text>
            </div>
            <div>
              <Text size="lg" fw={700} c="blue">
                {data.assessments.length}
              </Text>
              <Text size="sm" c="dimmed">
                Total Claims
              </Text>
            </div>
          </Group>
        </Card>
      )}
    </Stack>
  );
}
