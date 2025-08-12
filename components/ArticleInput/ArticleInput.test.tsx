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

describe('Welcome component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the welcome title', () => {
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
    await user.type(input, 'Hello world');

    expect(input).toHaveValue('Hello world');
  });

  it('shows error when trying to submit empty input', async () => {
    const user = userEvent.setup();
    render(<ArticleInput />);

    const submitButton = screen.getByText('Check Article');
    await user.click(submitButton);

    expect(
      screen.getByText('Error: Please enter an article url to check')
    ).toBeInTheDocument();
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<ArticleInput />);

    const input = screen.getByLabelText('Article URL:');
    const resetButton = screen.getByText('Reset');

    await user.type(input, 'Test input');
    await user.click(resetButton);

    expect(input).toHaveValue('');
  });
});
