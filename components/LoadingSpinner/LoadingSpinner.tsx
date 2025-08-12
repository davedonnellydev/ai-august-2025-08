'use client';

import { Text, Card, Stack, Loader } from '@mantine/core';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <Card withBorder p="xl" style={{ textAlign: 'center' }}>
      <Stack
        gap="md"
        align="center"
        role="status"
        aria-live="polite"
        data-testid="loading-spinner"
      >
        <Loader size="lg" aria-label="Loading indicator" />
        <Text size="md" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Card>
  );
}
