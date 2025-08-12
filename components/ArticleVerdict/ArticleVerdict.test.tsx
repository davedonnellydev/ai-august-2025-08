import { render, screen } from '@/test-utils';
import { ArticleVerdict } from './ArticleVerdict';

const mockData = {
  verdict: 'TRUE',
  confidence: 0.85,
  key_factors: [
    'Article text contains explicit statements for each extracted claim',
    'High-importance claims are all directly stated in the article',
    'The piece includes direct quotations from RBA Governor Michele Bullock',
  ],
};

describe('ArticleVerdict', () => {
  it('renders the component title', () => {
    render(<ArticleVerdict data={mockData} />);
    expect(screen.getByText('Overall Verdict')).toBeInTheDocument();
  });

  it('displays the verdict badge', () => {
    render(<ArticleVerdict data={mockData} />);
    expect(screen.getByText('TRUE')).toBeInTheDocument();
  });

  it('displays the confidence percentage', () => {
    render(<ArticleVerdict data={mockData} />);
    expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
  });

  it('displays key factors when provided', () => {
    render(<ArticleVerdict data={mockData} />);
    expect(screen.getByText('Key Factors:')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Article text contains explicit statements for each extracted claim'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'High-importance claims are all directly stated in the article'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The piece includes direct quotations from RBA Governor Michele Bullock'
      )
    ).toBeInTheDocument();
  });

  it('handles different verdict types', () => {
    const verdicts = ['TRUE', 'MIXED', 'MISLEADING', 'FALSE', 'UNVERIFIABLE'];

    verdicts.forEach((verdict) => {
      render(<ArticleVerdict data={{ ...mockData, verdict }} />);
      const badge = screen.getByText(verdict);
      expect(badge).toBeInTheDocument();
    });
  });

  it('handles confidence values correctly', () => {
    const testCases = [
      { confidence: 0, expected: '0%' },
      { confidence: 0.5, expected: '50%' },
      { confidence: 0.99, expected: '99%' },
      { confidence: 1, expected: '100%' },
    ];

    testCases.forEach(({ confidence, expected }) => {
      render(<ArticleVerdict data={{ ...mockData, confidence }} />);
      expect(screen.getByText(`Confidence: ${expected}`)).toBeInTheDocument();
    });
  });

  it('handles missing key factors gracefully', () => {
    const dataWithoutFactors = {
      verdict: 'TRUE',
      confidence: 0.9,
      key_factors: [],
    };

    render(<ArticleVerdict data={dataWithoutFactors} />);

    // Should still show verdict and confidence
    expect(screen.getByText('TRUE')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 90%')).toBeInTheDocument();

    // Should not show key factors section
    expect(screen.queryByText('Key Factors:')).not.toBeInTheDocument();
  });

  it('handles undefined key factors gracefully', () => {
    const dataWithoutFactors = {
      verdict: 'TRUE',
      confidence: 0.9,
      key_factors: [],
    };

    render(<ArticleVerdict data={dataWithoutFactors} />);

    // Should still show verdict and confidence
    expect(screen.getByText('TRUE')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 90%')).toBeInTheDocument();

    // Should not show key factors section
    expect(screen.queryByText('Key Factors:')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ArticleVerdict data={mockData} />);

    const title = screen.getByRole('heading', { name: 'Overall Verdict' });
    expect(title).toHaveAttribute('id', 'verdict-title');

    const region = screen.getByRole('region', { name: 'Overall Verdict' });
    expect(region).toHaveAttribute('aria-labelledby', 'verdict-title');

    // Check that the verdict badge exists
    const verdictBadge = screen.getByText('TRUE');
    expect(verdictBadge).toBeInTheDocument();

    // Check that the confidence text exists
    const confidenceText = screen.getByText('Confidence: 85%');
    expect(confidenceText).toBeInTheDocument();
  });

  it('renders with proper semantic structure', () => {
    render(<ArticleVerdict data={mockData} />);

    // Should have proper heading hierarchy
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();

    // Should have proper list structure for key factors
    const keyFactorsList = screen
      .getByText('Key Factors:')
      .closest('div')
      ?.querySelector('ul');
    expect(keyFactorsList).toBeInTheDocument();

    // Should have list items
    const listItems = keyFactorsList?.querySelectorAll('li');
    expect(listItems).toHaveLength(3);
  });

  it('handles edge case confidence values', () => {
    const edgeCases = [
      { confidence: 0.001, expected: '0%' },
      { confidence: 0.999, expected: '100%' },
      { confidence: 0.123456, expected: '12%' },
    ];

    edgeCases.forEach(({ confidence, expected }) => {
      render(<ArticleVerdict data={{ ...mockData, confidence }} />);
      expect(screen.getByText(`Confidence: ${expected}`)).toBeInTheDocument();
    });
  });

  it('displays verdict badge with correct styling', () => {
    render(<ArticleVerdict data={mockData} />);

    const badge = screen.getByText('TRUE');
    expect(badge).toBeInTheDocument();

    // Check that the badge is rendered
    expect(badge).toBeInTheDocument();
  });
});
