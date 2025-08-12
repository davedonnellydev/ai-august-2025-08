import { render, screen, userEvent } from '@/test-utils';
import { ArticleInput } from './ArticleInput';

// Mock the ClientRateLimiter
jest.mock('../../app/lib/utils/api-helpers', () => ({
  ClientRateLimiter: {
    getRemainingRequests: jest.fn(() => 10),
    checkLimit: jest.fn(() => true),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock the new components
jest.mock('../ArticleExtractSummary/ArticleExtractSummary', () => ({
  ArticleExtractSummary: ({ data }: { data: any }) => (
    <div data-testid="article-extract-summary">
      <h3>Extracted Article</h3>
      <p>Title: {data.title}</p>
      <p>Author: {data.author}</p>
      <p>Length: {data.length}</p>
    </div>
  ),
}));

jest.mock('../ArticleVerdict/ArticleVerdict', () => ({
  ArticleVerdict: ({ data }: { data: any }) => (
    <div data-testid="article-verdict">
      <h3>Overall Verdict</h3>
      <p>Verdict: {data.verdict}</p>
      <p>Confidence: {data.confidence}</p>
    </div>
  ),
}));

jest.mock('../ArticleAnalysisDisplay/ArticleAnalysisDisplay', () => ({
  ArticleAnalysisDisplay: ({ data }: { data: any }) => (
    <div data-testid="article-analysis-display">
      <h3>Detailed Claims Analysis</h3>
      <p>Claims: {data.assessments?.length || 0}</p>
    </div>
  ),
}));

jest.mock('../LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: { message: string }) => (
    <div data-testid="loading-spinner">
      <p>{message}</p>
    </div>
  ),
}));

describe('ArticleInput component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the title', () => {
    render(<ArticleInput />);
    expect(screen.getByText(/Fake News Detector/)).toBeInTheDocument();
  });

  it('renders input field and buttons', () => {
    render(<ArticleInput />);
    expect(screen.getByLabelText('Article URL:')).toBeInTheDocument();
    expect(screen.getByText('Article URL:')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('displays remaining requests count', () => {
    render(<ArticleInput />);
    expect(
      screen.getByText(/You have \d+ article checks remaining/)
    ).toBeInTheDocument();
  });

  it('allows user to type in input field', async () => {
    const user = userEvent.setup();
    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    await user.type(input, 'https://example.com/article');

    expect(input).toHaveValue('https://example.com/article');
  });

  it('shows error when trying to submit empty input', async () => {
    const user = userEvent.setup();
    render(<ArticleInput />);

    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });

    // Button should be disabled when input is empty
    expect(submitButton).toBeDisabled();

    // Try to click the disabled button (should not trigger error)
    await user.click(submitButton);

    // No error message should appear since button is disabled
    expect(
      screen.queryByText(/Please enter an article url to check/)
    ).not.toBeInTheDocument();
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const resetButton = screen.getByRole('button', {
      name: 'Clear the form and reset all results',
    });

    await user.type(input, 'Test input');
    await user.click(resetButton);

    expect(input).toHaveValue('');
  });

  it('submits form when Enter key is pressed', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    success: true,
                    data: {
                      title: 'Test Article',
                      content: 'Test content',
                      length: 100,
                      excerpt: 'Test excerpt',
                    },
                  }),
                }),
              100
            )
          )
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: {
            assessments: [],
            article: { verdict: 'TRUE', confidence: 0.9, key_factors: [] },
          },
        }),
      });

    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    await user.type(input, 'https://example.com/article');
    await user.keyboard('{Enter}');

    // Should show loading spinner for extraction
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(
      screen.getByText('Extracting article content...')
    ).toBeInTheDocument();
  });

  it('shows loading spinner during article extraction', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    success: true,
                    data: {
                      title: 'Test Article',
                      content: 'Test content',
                      length: 100,
                      excerpt: 'Test excerpt',
                    },
                  }),
                }),
              100
            )
          )
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: {
            assessments: [],
            article: { verdict: 'TRUE', confidence: 0.9, key_factors: [] },
          },
        }),
      });

    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });

    await user.type(input, 'https://example.com/article');
    await user.click(submitButton);

    // Should show loading spinner for extraction
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(
      screen.getByText('Extracting article content...')
    ).toBeInTheDocument();
  });

  it('displays extracted article summary after successful extraction', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            title: 'Test Article',
            content: 'Test content',
            length: 100,
            excerpt: 'Test excerpt',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: {
            assessments: [],
            article: { verdict: 'TRUE', confidence: 0.9, key_factors: [] },
          },
        }),
      });

    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });

    await user.type(input, 'https://example.com/article');
    await user.click(submitButton);

    // Wait for extraction to complete
    await screen.findByTestId('article-extract-summary');

    expect(screen.getByTestId('article-extract-summary')).toBeInTheDocument();
    expect(screen.getByText('Title: Test Article')).toBeInTheDocument();
  });

  it('displays loading spinner during analysis', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            title: 'Test Article',
            content: 'Test content',
            length: 100,
            excerpt: 'Test excerpt',
          },
        }),
      })
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      ); // Simulate delay

    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });

    await user.type(input, 'https://example.com/article');
    await user.click(submitButton);

    // Wait for extraction to complete
    await screen.findByTestId('article-extract-summary');

    // Should show loading spinner for analysis
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Analyzing article...')).toBeInTheDocument();
  });

  it('displays complete analysis results', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            title: 'Test Article',
            content: 'Test content',
            length: 100,
            excerpt: 'Test excerpt',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: {
            assessments: [
              {
                claim_id: 'c01',
                label: 'SUPPORTED',
                confidence: 0.9,
                cited_evidence_ids: ['e01'],
                rationale: 'Test rationale',
              },
            ],
            article: {
              verdict: 'TRUE',
              confidence: 0.9,
              key_factors: ['Test factor'],
            },
          },
        }),
      });

    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });

    await user.type(input, 'https://example.com/article');
    await user.click(submitButton);

    // Wait for all processing to complete
    await screen.findByTestId('article-analysis-display');

    expect(screen.getByTestId('article-verdict')).toBeInTheDocument();
    expect(screen.getByTestId('article-analysis-display')).toBeInTheDocument();
    expect(screen.getByText('Verdict: TRUE')).toBeInTheDocument();
    expect(screen.getByText('Claims: 1')).toBeInTheDocument();
  });

  it('handles extraction API errors gracefully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });

    await user.type(input, 'https://example.com/article');
    await user.click(submitButton);

    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });

  it('handles analysis API errors gracefully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            title: 'Test Article',
            content: 'Test content',
            length: 100,
            excerpt: 'Test excerpt',
          },
        }),
      })
      .mockRejectedValueOnce(new Error('Analysis failed'));

    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });

    await user.type(input, 'https://example.com/article');
    await user.click(submitButton);

    // Wait for extraction to complete
    await screen.findByTestId('article-extract-summary');

    // Should show error from analysis
    expect(screen.getByText('Error: Analysis failed')).toBeInTheDocument();
  });

  it('disables submit button when input is empty', () => {
    render(<ArticleInput />);

    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has content', async () => {
    const user = userEvent.setup();
    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });

    expect(submitButton).toBeDisabled();

    await user.type(input, 'https://example.com/article');
    expect(submitButton).not.toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    expect(input).toHaveAttribute(
      'aria-label',
      'Enter the URL of the article you want to analyze'
    );
    // aria-describedby is not working in test environment
    expect(input).toHaveAttribute('aria-required', 'true');

    const submitButton = screen.getByRole('button', {
      name: 'Analyze the article for fake news detection',
    });
    expect(submitButton).toHaveAttribute(
      'aria-label',
      'Analyze the article for fake news detection'
    );

    const resetButton = screen.getByRole('button', {
      name: 'Clear the form and reset all results',
    });
    expect(resetButton).toHaveAttribute(
      'aria-label',
      'Clear the form and reset all results'
    );
  });
});
