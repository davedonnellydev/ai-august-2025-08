import { render, screen } from '@/test-utils';
import { ArticleExtractSummary } from './ArticleExtractSummary';

const mockData = {
  title: "Australia's Inflation Falls to 4.9%",
  content:
    'The Australian Bureau of Statistics reported Friday that inflation fell to 4.9% in July...',
  length: 1224,
  excerpt:
    'The Australian Bureau of Statistics reported Friday that inflation fell to 4.9% in July...',
  siteName: 'News Website',
  author: 'John Smith',
  publishDate: '2025-08-11T10:00:00Z',
};

describe('ArticleExtractSummary', () => {
  it('renders the component title', () => {
    render(<ArticleExtractSummary data={mockData} />);
    expect(screen.getByText('Extracted Article')).toBeInTheDocument();
  });

  it('displays the article title', () => {
    render(<ArticleExtractSummary data={mockData} />);
    expect(
      screen.getByText("Australia's Inflation Falls to 4.9%")
    ).toBeInTheDocument();
  });

  it('displays the author when provided', () => {
    render(<ArticleExtractSummary data={mockData} />);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Author:')).toBeInTheDocument();
  });

  it('displays the publish date when provided', () => {
    render(<ArticleExtractSummary data={mockData} />);
    expect(screen.getByText('August 11, 2025')).toBeInTheDocument();
    expect(screen.getByText('Published:')).toBeInTheDocument();
  });

  it('displays the content length', () => {
    render(<ArticleExtractSummary data={mockData} />);
    expect(screen.getByText('1,224 characters')).toBeInTheDocument();
    expect(screen.getByText('Length:')).toBeInTheDocument();
  });

  it('displays the excerpt', () => {
    render(<ArticleExtractSummary data={mockData} />);
    expect(
      screen.getByText(
        'The Australian Bureau of Statistics reported Friday that inflation fell to 4.9% in July...'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Excerpt:')).toBeInTheDocument();
  });

  it('displays the site name when provided', () => {
    render(<ArticleExtractSummary data={mockData} />);
    expect(screen.getByText('News Website')).toBeInTheDocument();
    expect(screen.getByText('Source:')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalData = {
      title: 'Test Article',
      content: 'Test content',
      length: 100,
      excerpt: 'Test excerpt',
    };

    render(<ArticleExtractSummary data={minimalData} />);

    // Should still show required fields
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('100 characters')).toBeInTheDocument();
    expect(screen.getByText('Test excerpt')).toBeInTheDocument();

    // Should not show optional fields
    expect(screen.queryByText('Author:')).not.toBeInTheDocument();
    expect(screen.queryByText('Published:')).not.toBeInTheDocument();
    expect(screen.queryByText('Source:')).not.toBeInTheDocument();
  });

  it('handles invalid date format gracefully', () => {
    const dataWithInvalidDate = {
      ...mockData,
      publishDate: 'invalid-date-string',
    };

    render(<ArticleExtractSummary data={dataWithInvalidDate} />);

    // Should fall back to displaying "Invalid Date" when date parsing fails
    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const dataWithLargeLength = {
      ...mockData,
      length: 1234567,
    };

    render(<ArticleExtractSummary data={dataWithLargeLength} />);
    expect(screen.getByText('1,234,567 characters')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ArticleExtractSummary data={mockData} />);

    const title = screen.getByRole('heading', { name: 'Extracted Article' });
    expect(title).toHaveAttribute('id', 'extracted-article-title');

    const region = screen.getByRole('region', { name: 'Extracted Article' });
    expect(region).toHaveAttribute(
      'aria-labelledby',
      'extracted-article-title'
    );
  });

  it('renders with proper semantic structure', () => {
    render(<ArticleExtractSummary data={mockData} />);

    // Should have proper heading hierarchy
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();

    // Should have proper text structure
    expect(screen.getByText('Title:')).toBeInTheDocument();
    expect(screen.getByText('Length:')).toBeInTheDocument();
    expect(screen.getByText('Excerpt:')).toBeInTheDocument();
  });
});
