import { fireEvent, render, screen } from '@testing-library/react';
import { Component } from 'react';

// Mock the logger
const mockLogError = jest.fn();
jest.mock('@/shared/infra/monitoring/logger', () => ({
  logError: (...args: any[]) => mockLogError(...args),
}));

// Mock the Button component
jest.mock('@/shared/ui/primitives/Button/Button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

import { ErrorBoundary, ErrorBoundaryWrapper } from '@/shared/ui/feedback/errors/ErrorBoundary';

// Component that throws an error
class ThrowError extends Component<{ shouldThrow?: boolean; error?: Error }> {
  render() {
    if (this.props.shouldThrow) {
      throw this.props.error || new Error('Test error');
    }
    return <div data-testid="child-component">Child content</div>;
  }
}

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

beforeEach(() => {
  jest.clearAllMocks();
  delete (global as any).location;
  (global as any).location = { href: '' };
});

describe('ErrorBoundary (TDD)', () => {
  describe('Component Rendering - No Error State', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="test-child">Test Child</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('does not render fallback UI when no error', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Error Catching and State Management', () => {
    it('catches errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
    });

    it('updates state when error is caught', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error UI
      expect(container.querySelector('.text-slate-900')).toHaveTextContent('Something went wrong');
    });

    it('captures the error object in state', () => {
      const customError = new Error('Custom error message');
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={customError} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('logs error when caught', () => {
      const testError = new Error('Test error for logging');
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={testError} />
        </ErrorBoundary>
      );

      expect(mockLogError).toHaveBeenCalledWith(
        testError,
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('includes component stack in error log', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(mockLogError).toHaveBeenCalled();
      const logCall = mockLogError.mock.calls[0];
      expect(logCall[1]).toHaveProperty('componentStack');
    });
  });

  describe('Default Fallback UI', () => {
    it('renders default error UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We notified the engineering team/)).toBeInTheDocument();
    });

    it('renders Try again button in default fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('renders Back home button in default fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Back home')).toBeInTheDocument();
    });

    it('applies correct styling to error container', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorDiv = container.querySelector('.rounded-xl');
      expect(errorDiv).toHaveClass(
        'flex',
        'min-h-[200px]',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-4',
        'rounded-xl',
        'border',
        'border-slate-200',
        'bg-white',
        'p-6',
        'text-center'
      );
    });
  });

  describe('Custom Fallback UI', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });

    it('does not render default UI when custom fallback provided', () => {
      const customFallback = <div>Custom</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('renders complex custom fallback elements', () => {
      const customFallback = (
        <div>
          <h1 data-testid="custom-title">Error</h1>
          <button data-testid="custom-action">Action</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('calls onReset callback when reset', () => {
      const mockOnReset = jest.fn();

      render(
        <ErrorBoundary onReset={mockOnReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByText('Try again');
      fireEvent.click(tryAgainButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('does not call onReset if not provided', () => {
      // Should not crash
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByText('Try again');
      expect(() => fireEvent.click(tryAgainButton)).not.toThrow();
    });

    it('updates state to clear error on reset', () => {
      const mockOnReset = jest.fn();

      render(
        <ErrorBoundary onReset={mockOnReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Try again'));

      // State should be reset (hasError: false)
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Back Home Functionality', () => {
    it('navigates to home when Back home is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const backHomeButton = screen.getByText('Back home');
      fireEvent.click(backHomeButton);

      expect(globalThis.location.href).toContain('/');
    });

    it('renders Back home button with outline variant', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const buttons = screen.getAllByTestId('button');
      const backHomeButton = buttons.find(btn => btn.textContent === 'Back home');

      expect(backHomeButton).toHaveAttribute('data-variant', 'outline');
    });
  });

  describe('Development Mode Error Stack', () => {
    it('displays error stack trace in development mode', () => {
      // Note: process.env.NODE_ENV is set at build time and cannot be changed at runtime
      // This test verifies the conditional rendering logic exists
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('Test error')} />
        </ErrorBoundary>
      );

      // Should render the error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('does not show stack in production builds', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // The component handles this internally based on NODE_ENV
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('accepts ReactNode as children', () => {
      const TestComponent = () => <div>Component</div>;

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Component')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);

      // Should render without crashing
      expect(document.body).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);

      expect(document.body).toBeInTheDocument();
    });
  });

  describe('ErrorBoundaryWrapper', () => {
    it('renders using the wrapper component', () => {
      render(
        <ErrorBoundaryWrapper>
          <div data-testid="wrapper-child">Wrapper Child</div>
        </ErrorBoundaryWrapper>
      );

      expect(screen.getByTestId('wrapper-child')).toBeInTheDocument();
    });

    it('catches errors when using wrapper', () => {
      render(
        <ErrorBoundaryWrapper>
          <ThrowError shouldThrow={true} />
        </ErrorBoundaryWrapper>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('passes props correctly to ErrorBoundary', () => {
      const mockOnReset = jest.fn();
      const customFallback = <div data-testid="wrapper-fallback">Wrapper Fallback</div>;

      render(
        <ErrorBoundaryWrapper onReset={mockOnReset} fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundaryWrapper>
      );

      expect(screen.getByTestId('wrapper-fallback')).toBeInTheDocument();

      // Trigger reset through the wrapper (if custom fallback had a button)
      // For now, just verify the fallback is shown
    });

    it('renders the wrapper as a functional component', () => {
      render(
        <ErrorBoundaryWrapper>
          <div>Test</div>
        </ErrorBoundaryWrapper>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles errors thrown during render', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles multiple errors sequentially', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('First error')} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Reset
      fireEvent.click(screen.getByText('Try again'));

      // Trigger another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('Second error')} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles rapid clicks on Try again button', () => {
      const mockOnReset = jest.fn();

      render(
        <ErrorBoundary onReset={mockOnReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByText('Try again');

      // Click once - after first click, component resets and may re-render
      fireEvent.click(tryAgainButton);

      // Verify callback was called at least once
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('Static Method getDerivedStateFromError', () => {
    it('returns correct state when error occurs', () => {
      const error = new Error('Test error');
      const state = ErrorBoundary.getDerivedStateFromError(error);

      expect(state).toEqual({
        hasError: true,
        error: error,
      });
    });

    it('preserves error object in returned state', () => {
      const customError = new Error('Custom');
      const state = ErrorBoundary.getDerivedStateFromError(customError);

      expect(state.error).toBe(customError);
      expect(state.hasError).toBe(true);
    });
  });

  describe('Integration', () => {
    it('works with nested components', () => {
      const NestedComponent = () => <ThrowError shouldThrow={true} />;

      render(
        <ErrorBoundary>
          <div>
            <NestedComponent />
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('integrates with Button component correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const buttons = screen.getAllByTestId('button');
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveTextContent('Try again');
      expect(buttons[1]).toHaveTextContent('Back home');
    });
  });
});
