'use client';

import { Text, Title, Badge, Card, Group, Stack } from '@mantine/core';

export function ArticleAnalysisDisplay({ data }: { data: any }) {
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
      {/* Individual Claim Assessments */}
      {data.assessments && data.assessments.length > 0 && (
        <Card withBorder p="md">
          <Title order={4} mb="md" id="claims-title">
            Claim Assessments
          </Title>
          <Stack gap="md" role="region" aria-labelledby="claims-title">
            {data.assessments.map((assessment: any) => (
              <Card
                key={assessment.claim_id}
                withBorder
                p="sm"
                style={{ backgroundColor: '#fafafa' }}
                role="article"
                aria-labelledby={`claim-${assessment.claim_id}`}
              >
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Group gap="xs">
                    <Badge
                      size="sm"
                      variant="outline"
                      id={`claim-${assessment.claim_id}`}
                    >
                      {assessment.claim_id}
                    </Badge>
                    <Badge
                      color={getLabelColor(assessment.label)}
                      variant="filled"
                      aria-label={`Claim status: ${assessment.label}`}
                    >
                      {assessment.label}
                    </Badge>
                  </Group>
                  <Badge
                    size="sm"
                    variant="light"
                    aria-label={`Confidence: ${formatConfidence(assessment.confidence)}`}
                  >
                    {formatConfidence(assessment.confidence)}
                  </Badge>
                </Group>

                <Text size="sm" mb="xs">
                  <strong>Rationale:</strong>{' '}
                  <span
                    aria-label={`Rationale for claim ${assessment.claim_id}: ${assessment.rationale}`}
                  >
                    {assessment.rationale}
                  </span>
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
          <Title order={4} mb="md" id="summary-title">
            Summary Statistics
          </Title>
          <Group
            gap="xl"
            wrap="wrap"
            role="region"
            aria-labelledby="summary-title"
          >
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
