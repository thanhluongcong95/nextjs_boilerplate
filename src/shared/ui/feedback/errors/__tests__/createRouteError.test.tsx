import { fireEvent, render, screen } from '@testing-library/react';

// Mock ErrorBoundaryFallback to isolate factory behavior and capture props
const mockFallback = jest.fn();
jest.mock('@/shared/ui/feedback/errors/ErrorBoundaryFallback', () => ({
  ErrorBoundaryFallback: ({ error, onRetry, actions }: any) => {
    mockFallback(error, onRetry, actions);
    return (
      <div data-testid="fallback">
        <span data-testid="error-message">{error?.message}</span>
        <button data-testid="retry" onClick={onRetry}>
          Retry
        </button>
        <div data-testid="actions">{actions}</div>
      </div>
    );
  },
}));

import { createRouteError } from '@/shared/ui/feedback/errors/createRouteError';

describe('createRouteError (TDD)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a React component function', () => {
    const Component = createRouteError();
    expect(typeof Component).toBe('function');
  });

  it('sets a helpful displayName on the returned component', () => {
    const Component = createRouteError();
    expect((Component as any).displayName).toBe('RouteErrorComponent');
  });

  it('renders ErrorBoundaryFallback with provided error and actions', () => {
    const error = new Error('Boom');
    const actions = <button data-testid="action">Go Home</button>;
    const Component = createRouteError({ actions });

    render(<Component error={error} reset={jest.fn()} />);

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Boom');
    expect(screen.getByTestId('action')).toBeInTheDocument();
  });

  it('calls onError when mounted (effect) and when error changes', () => {
    const onError = jest.fn();
    const Component = createRouteError({ onError });

    const { rerender } = render(<Component error={new Error('E1')} reset={jest.fn()} />);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toBe('E1');

    rerender(<Component error={new Error('E2')} reset={jest.fn()} />);
    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError.mock.calls[1][0].message).toBe('E2');
  });

  it('does not error when onError is not provided', () => {
    const Component = createRouteError();
    expect(() => render(<Component error={new Error('E')} reset={jest.fn()} />)).not.toThrow();
  });

  it('delegates retry to provided reset function via onRetry', () => {
    const reset = jest.fn();
    const Component = createRouteError();

    render(<Component error={new Error('E')} reset={reset} />);

    fireEvent.click(screen.getByTestId('retry'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('renders without actions when actions prop is not provided', () => {
    const Component = createRouteError();

    render(<Component error={new Error('E')} reset={jest.fn()} />);

    // Actions container exists but empty
    expect(screen.getByTestId('actions')).toBeInTheDocument();
  });

  it('supports null/undefined actions gracefully', () => {
    const ComponentNull = createRouteError({ actions: null as any });
    render(<ComponentNull error={new Error('E')} reset={jest.fn()} />);
    expect(screen.getByTestId('actions')).toBeInTheDocument();

    const ComponentUndef = createRouteError({ actions: undefined });
    render(<ComponentUndef error={new Error('E')} reset={jest.fn()} />);
    expect(screen.getAllByTestId('actions').length).toBeGreaterThan(0);
  });

  it('passes through the exact onRetry reference to fallback', () => {
    const reset = jest.fn();
    const Component = createRouteError();

    render(<Component error={new Error('E')} reset={reset} />);

    // mockFallback captured the onRetry as the second param
    const [, capturedOnRetry] = mockFallback.mock.calls[0];
    expect(capturedOnRetry).toBe(reset);
  });
});
