import { render, screen } from '@/test-utils';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Please wait while we analyze the article...';
    render(<LoadingSpinner message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('displays the loading spinner', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading indicator');
    expect(spinner).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner message="Processing..." />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');

    const spinner = screen.getByLabelText('Loading indicator');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with proper styling', () => {
    render(<LoadingSpinner />);

    const card = screen.getByRole('status').closest('.mantine-Card-root');
    expect(card).toBeInTheDocument();

    // Check that the content is centered
    const cardElement = screen
      .getByRole('status')
      .closest('.mantine-Card-root');
    expect(cardElement).toHaveStyle({ textAlign: 'center' });
  });

  it('handles empty message gracefully', () => {
    render(<LoadingSpinner message="" />);
    // Empty message should still render the element
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();
  });

  it('handles very long messages', () => {
    const longMessage =
      'This is a very long loading message that might wrap to multiple lines and should still be displayed correctly without breaking the layout or causing any rendering issues';
    render(<LoadingSpinner message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles special characters in message', () => {
    const specialMessage =
      'Loading... 🚀 Please wait! 100% & <script>alert("test")</script>';
    render(<LoadingSpinner message={specialMessage} />);
    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });

  it('maintains consistent structure with different messages', () => {
    const messages = [
      'Loading...',
      'Processing...',
      'Analyzing article...',
      'Extracting content...',
      'Verifying claims...',
    ];

    messages.forEach((message) => {
      const { container } = render(<LoadingSpinner message={message} />);

      // Should always have the same structure
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading indicator')).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();

      // Clean up
      container.remove();
    });
  });

  it('has proper semantic structure', () => {
    render(<LoadingSpinner message="Loading..." />);

    // Should have status role for screen readers
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();

    // Should have aria-live for dynamic content
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('renders consistently across different message types', () => {
    const testCases = [
      { message: 'Loading...', expectedText: 'Loading...' },
      { message: 'Processing...', expectedText: 'Processing...' },
      { message: 'Please wait...', expectedText: 'Please wait...' },
    ];

    testCases.forEach(({ message, expectedText }) => {
      render(<LoadingSpinner message={message} />);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });
});
