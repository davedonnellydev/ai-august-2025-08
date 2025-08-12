import '@mantine/core/styles.css';

import React from 'react';
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core';
import { theme } from '../theme';

export const metadata = {
  title: 'Fake News Detector',
  description:
    'An AI powered Fake News Detector app built for AIAugust App a Day Challenge',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta
          name="description"
          content="AI-powered fake news detector that analyzes articles for credibility and provides detailed fact-checking results"
        />
        <meta
          name="keywords"
          content="fake news, fact checking, AI, news analysis, credibility"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <main role="main">{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}
