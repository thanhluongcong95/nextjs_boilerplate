import { fireEvent, render, screen } from '@testing-library/react';

// Mock the Button component
jest.mock('@/shared/ui/primitives/Button/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

import { ErrorBoundaryFallback } from '@/shared/ui/feedback/errors/ErrorBoundaryFallback';

describe('ErrorBoundaryFallback (TDD)', () => {
  const mockError = new Error('Test error message');
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      expect(container).toBeInTheDocument();
    });

    it('renders the error container with correct styling', () => {
      const { container } = render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const errorContainer = container.firstChild;

      expect(errorContainer).toHaveClass('flex', 'flex-col', 'items-start', 'gap-4', 'rounded-xl', 'border', 'border-rose-100', 'bg-rose-50', 'p-6');
    });

    it('displays the error heading', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const heading = screen.getByRole('heading', { level: 2 });

      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('An unexpected error occurred');
      expect(heading).toHaveClass('text-lg', 'font-semibold', 'text-rose-700');
    });

    it('displays the error message', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const errorMessage = screen.getByText('Test error message');

      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-sm', 'text-rose-600');
    });

    it('renders the Retry button', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const retryButton = screen.getByText('Retry');

      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Error Message Display', () => {
    it('displays different error messages correctly', () => {
      const customError = new Error('Custom error message');
      render(<ErrorBoundaryFallback error={customError} onRetry={mockOnRetry} />);

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('handles empty error message', () => {
      const emptyError = new Error('');
      const { container } = render(<ErrorBoundaryFallback error={emptyError} onRetry={mockOnRetry} />);

      // Should render without crashing, error message paragraph exists even if empty
      const errorParagraph = container.querySelector('.text-sm.text-rose-600');
      expect(errorParagraph).toBeInTheDocument();
      expect(errorParagraph?.textContent).toBe('');
    });

    it('handles long error messages', () => {
      const longError = new Error('A'.repeat(500));
      render(<ErrorBoundaryFallback error={longError} onRetry={mockOnRetry} />);

      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    it('handles error messages with special characters', () => {
      const specialError = new Error('Error: <script>alert("xss")</script>');
      render(<ErrorBoundaryFallback error={specialError} onRetry={mockOnRetry} />);

      expect(screen.getByText('Error: <script>alert("xss")</script>')).toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('calls onRetry when Retry button is clicked', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const retryButton = screen.getByText('Retry');

      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry multiple times when clicked multiple times', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const retryButton = screen.getByText('Retry');

      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(3);
    });

    it('does not call onRetry on initial render', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);

      expect(mockOnRetry).not.toHaveBeenCalled();
    });
  });

  describe('Optional Actions', () => {
    it('renders without actions when not provided', () => {
      const { container } = render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const actionsContainer = container.querySelector('.flex.items-center.gap-3');

      expect(actionsContainer).toBeInTheDocument();
      expect(actionsContainer?.children).toHaveLength(1); // Only Retry button
    });

    it('renders additional actions when provided', () => {
      const actions = <button data-testid="custom-action">Go Home</button>;
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} actions={actions} />);

      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('renders multiple custom actions', () => {
      const actions = (
        <>
          <button data-testid="action-1">Action 1</button>
          <button data-testid="action-2">Action 2</button>
        </>
      );
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} actions={actions} />);

      expect(screen.getByTestId('action-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-2')).toBeInTheDocument();
    });

    it('handles null actions gracefully', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} actions={null} />);

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('handles undefined actions gracefully', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} actions={undefined} />);

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('renders complex action elements', () => {
      const actions = (
        <div data-testid="complex-action">
          <button>Primary Action</button>
          <a href="/">Link Action</a>
        </div>
      );
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} actions={actions} />);

      expect(screen.getByTestId('complex-action')).toBeInTheDocument();
      expect(screen.getByText('Primary Action')).toBeInTheDocument();
      expect(screen.getByText('Link Action')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders error message container before actions container', () => {
      const { container } = render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const mainContainer = container.firstChild;
      const children = mainContainer?.childNodes;

      expect(children).toHaveLength(2);
      // First child contains the error message
      expect(children?.[0].textContent).toContain('An unexpected error occurred');
      // Second child contains the actions
      expect(children?.[1].textContent).toContain('Retry');
    });

    it('maintains proper layout structure', () => {
      const { container } = render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const actionsContainer = container.querySelector('.flex.items-center.gap-3');

      expect(actionsContainer).toBeInTheDocument();
      expect(actionsContainer).toHaveClass('flex', 'items-center', 'gap-3');
    });
  });

  describe('Props Validation', () => {
    it('accepts valid error object', () => {
      const error = new Error('Valid error');
      render(<ErrorBoundaryFallback error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('Valid error')).toBeInTheDocument();
    });

    it('accepts valid onRetry function', () => {
      const customRetry = jest.fn();
      render(<ErrorBoundaryFallback error={mockError} onRetry={customRetry} />);

      fireEvent.click(screen.getByText('Retry'));
      expect(customRetry).toHaveBeenCalled();
    });

    it('uses Readonly props correctly', () => {
      // This is a compile-time check, but we can verify runtime behavior
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('Re-rendering', () => {
    it('updates error message when error prop changes', () => {
      const { rerender } = render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();

      const newError = new Error('Updated error message');
      rerender(<ErrorBoundaryFallback error={newError} onRetry={mockOnRetry} />);

      expect(screen.getByText('Updated error message')).toBeInTheDocument();
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });

    it('updates onRetry handler when prop changes', () => {
      const { rerender } = render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);

      const newOnRetry = jest.fn();
      rerender(<ErrorBoundaryFallback error={mockError} onRetry={newOnRetry} />);

      fireEvent.click(screen.getByText('Retry'));

      expect(mockOnRetry).not.toHaveBeenCalled();
      expect(newOnRetry).toHaveBeenCalledTimes(1);
    });

    it('updates actions when prop changes', () => {
      const { rerender } = render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);

      expect(screen.queryByTestId('new-action')).not.toBeInTheDocument();

      const newActions = <button data-testid="new-action">New Action</button>;
      rerender(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} actions={newActions} />);

      expect(screen.getByTestId('new-action')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible heading structure', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const heading = screen.getByRole('heading', { level: 2 });

      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('An unexpected error occurred');
    });

    it('error message is readable by screen readers', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const errorText = screen.getByText('Test error message');

      expect(errorText).toBeVisible();
    });

    it('retry button is accessible', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const retryButton = screen.getByText('Retry');

      expect(retryButton).toBeVisible();
      expect(retryButton.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('handles Error object without message property', () => {
      const errorWithoutMessage = Object.create(Error.prototype);
      render(<ErrorBoundaryFallback error={errorWithoutMessage} onRetry={mockOnRetry} />);

      // Should render without crashing
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('handles error with only whitespace message', () => {
      const whitespaceError = new Error('   ');
      const { container } = render(<ErrorBoundaryFallback error={whitespaceError} onRetry={mockOnRetry} />);

      // Should render without crashing, error message paragraph contains whitespace
      const errorParagraph = container.querySelector('.text-sm.text-rose-600');
      expect(errorParagraph).toBeInTheDocument();
      expect(errorParagraph?.textContent).toBe('   ');
    });

    it('handles rapid successive clicks on retry button', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const retryButton = screen.getByText('Retry');

      for (let i = 0; i < 10; i++) {
        fireEvent.click(retryButton);
      }

      expect(mockOnRetry).toHaveBeenCalledTimes(10);
    });
  });

  describe('Integration', () => {
    it('works with Button component correctly', () => {
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} />);
      const buttons = screen.getAllByTestId('button');

      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent('Retry');
    });

    it('integrates custom actions alongside Retry button', () => {
      const customAction = <button data-testid="custom-btn">Custom</button>;
      render(<ErrorBoundaryFallback error={mockError} onRetry={mockOnRetry} actions={customAction} />);

      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.getByTestId('custom-btn')).toBeInTheDocument();
    });
  });
});
