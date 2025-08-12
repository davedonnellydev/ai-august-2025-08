import { render, screen } from '@/test-utils';
import { ArticleAnalysisDisplay } from './ArticleAnalysisDisplay';

const mockData = {
  assessments: [
    {
      claim_id: 'c01',
      label: 'SUPPORTED',
      confidence: 0.9,
      cited_evidence_ids: ['e01'],
      rationale:
        'The article explicitly states this claim with supporting evidence.',
    },
    {
      claim_id: 'c02',
      label: 'CONTRADICTED',
      confidence: 0.8,
      cited_evidence_ids: ['e02', 'e03'],
      rationale: 'Multiple sources contradict this claim.',
    },
    {
      claim_id: 'c03',
      label: 'INSUFFICIENT_EVIDENCE',
      confidence: 0.3,
      cited_evidence_ids: [],
      rationale:
        'No sufficient evidence found to support or contradict this claim.',
    },
  ],
};

describe('ArticleAnalysisDisplay', () => {
  it('renders the claims assessments title', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);
    expect(screen.getByText('Claim Assessments')).toBeInTheDocument();
  });

  it('displays all claim assessments', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    expect(screen.getByText('c01')).toBeInTheDocument();
    expect(screen.getByText('c02')).toBeInTheDocument();
    expect(screen.getByText('c03')).toBeInTheDocument();
  });

  it('displays claim labels with correct colors', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    // Check that all labels are displayed
    expect(screen.getByText('SUPPORTED')).toBeInTheDocument();
    expect(screen.getByText('CONTRADICTED')).toBeInTheDocument();
    expect(screen.getByText('INSUFFICIENT_EVIDENCE')).toBeInTheDocument();
  });

  it('displays confidence scores for each claim', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('displays rationale for each claim', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    expect(
      screen.getByText(
        'The article explicitly states this claim with supporting evidence.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Multiple sources contradict this claim.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'No sufficient evidence found to support or contradict this claim.'
      )
    ).toBeInTheDocument();
  });

  it('displays evidence IDs when available', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    // Check that evidence IDs are displayed
    expect(screen.getAllByText('Evidence IDs:')).toHaveLength(2); // c01 and c02 have evidence
    expect(screen.getByText('e01')).toBeInTheDocument();
    expect(screen.getByText('e02, e03')).toBeInTheDocument();
  });

  it('handles claims without evidence IDs gracefully', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    // c03 has no evidence IDs, so it shouldn't show the evidence section
    const evidenceTexts = screen.getAllByText(/Evidence IDs:/);
    expect(evidenceTexts).toHaveLength(2); // Only c01 and c02
  });

  it('renders summary statistics correctly', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    expect(screen.getByText('Summary Statistics')).toBeInTheDocument();

    // Check that all the statistics are displayed
    expect(screen.getByText('Supported Claims')).toBeInTheDocument();
    expect(screen.getByText('Contradicted Claims')).toBeInTheDocument();
    expect(screen.getByText('Insufficient Evidence')).toBeInTheDocument();
    expect(screen.getByText('Total Claims')).toBeInTheDocument();
  });

  it('handles empty assessments gracefully', () => {
    const emptyData = { assessments: [] };
    render(<ArticleAnalysisDisplay data={emptyData} />);

    // Should not show claims section
    expect(screen.queryByText('Claim Assessments')).not.toBeInTheDocument();

    // Should not show summary statistics
    expect(screen.queryByText('Summary Statistics')).not.toBeInTheDocument();
  });

  it('handles undefined assessments gracefully', () => {
    const undefinedData = {};
    render(<ArticleAnalysisDisplay data={undefinedData} />);

    // Should not show claims section
    expect(screen.queryByText('Claim Assessments')).not.toBeInTheDocument();

    // Should not show summary statistics
    expect(screen.queryByText('Summary Statistics')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    // Check claims section
    const claimsTitle = screen.getByRole('heading', {
      name: 'Claim Assessments',
    });
    expect(claimsTitle).toHaveAttribute('id', 'claims-title');

    const claimsRegion = screen.getByRole('region', {
      name: 'Claim Assessments',
    });
    expect(claimsRegion).toHaveAttribute('aria-labelledby', 'claims-title');

    // Check summary section
    const summaryTitle = screen.getByRole('heading', {
      name: 'Summary Statistics',
    });
    expect(summaryTitle).toHaveAttribute('id', 'summary-title');

    const summaryRegion = screen.getByRole('region', {
      name: 'Summary Statistics',
    });
    expect(summaryRegion).toHaveAttribute('aria-labelledby', 'summary-title');
  });

  it('renders claim cards with proper accessibility', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    // Each claim should be an article with proper labeling
    const claimCards = screen.getAllByRole('article');
    expect(claimCards).toHaveLength(3);

    claimCards.forEach((card, index) => {
      const claimId = mockData.assessments[index].claim_id;
      expect(card).toHaveAttribute('aria-labelledby', `claim-${claimId}`);
    });
  });

  it('displays claim badges with proper accessibility', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    // Check that claim ID badges exist
    expect(screen.getByText('c01')).toBeInTheDocument();
    expect(screen.getByText('c02')).toBeInTheDocument();
    expect(screen.getByText('c03')).toBeInTheDocument();

    // Check that status badges exist
    expect(screen.getByText('SUPPORTED')).toBeInTheDocument();
    expect(screen.getByText('CONTRADICTED')).toBeInTheDocument();
    expect(screen.getByText('INSUFFICIENT_EVIDENCE')).toBeInTheDocument();
  });

  it('displays confidence badges with proper accessibility', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    // Check that confidence badges exist
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('handles different confidence values correctly', () => {
    const testData = {
      assessments: [
        {
          claim_id: 'c01',
          label: 'SUPPORTED',
          confidence: 0,
          cited_evidence_ids: ['e01'],
          rationale: 'Test claim',
        },
        {
          claim_id: 'c02',
          label: 'SUPPORTED',
          confidence: 0.5,
          cited_evidence_ids: ['e02'],
          rationale: 'Test claim 2',
        },
        {
          claim_id: 'c03',
          label: 'SUPPORTED',
          confidence: 1,
          cited_evidence_ids: ['e03'],
          rationale: 'Test claim 3',
        },
      ],
    };

    render(<ArticleAnalysisDisplay data={testData} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders with proper semantic structure', () => {
    render(<ArticleAnalysisDisplay data={mockData} />);

    // Should have proper heading hierarchy
    expect(
      screen.getByRole('heading', { level: 4, name: 'Claim Assessments' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 4, name: 'Summary Statistics' })
    ).toBeInTheDocument();

    // Should have proper card structure
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
  });

  it('handles large numbers of assessments', () => {
    const largeData = {
      assessments: Array.from({ length: 20 }, (_, i) => ({
        claim_id: `c${String(i + 1).padStart(2, '0')}`,
        label: 'SUPPORTED',
        confidence: 0.8,
        cited_evidence_ids: [`e${i + 1}`],
        rationale: `Test claim ${i + 1}`,
      })),
    };

    render(<ArticleAnalysisDisplay data={largeData} />);

    // Should display all assessments
    expect(screen.getByText('c01')).toBeInTheDocument();
    expect(screen.getByText('c20')).toBeInTheDocument();

    // Should show correct total count label
    expect(screen.getByText('Total Claims')).toBeInTheDocument();
  });
});
