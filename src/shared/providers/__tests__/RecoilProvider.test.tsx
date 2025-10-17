import { render, screen } from '@testing-library/react';

// Mock ErrorBoundary to a simple pass-through wrapper
jest.mock('@/shared/ui/feedback/errors/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>,
}));

// Mock AppRecoilRoot to a simple wrapper
jest.mock('@/shared/providers/bridges/AppRecoilRoot', () => ({
  AppRecoilRoot: ({ children }: any) => <div data-testid="recoil-root">{children}</div>,
}));

// Mock RouterBridge to a simple marker
jest.mock('@/shared/providers/bridges/RouterBridge', () => ({
  RouterBridge: () => <div data-testid="router-bridge" />,
}));

// Mock next/dynamic to return a fixed component marker for ClientHttpLoadingBridge
jest.mock('next/dynamic', () => {
  return () => {
    const Client = () => <div data-testid="client-http-loading-bridge" />;
    return Client as any;
  };
});

import { RecoilProvider } from '@/shared/providers/RecoilProvider';

describe('RecoilProvider (TDD)', () => {
  it('renders without crashing and displays children', () => {
    render(
      <RecoilProvider>
        <div data-testid="child">Hello</div>
      </RecoilProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('wraps children with ErrorBoundary and AppRecoilRoot', () => {
    const { container } = render(
      <RecoilProvider>
        <div data-testid="child">content</div>
      </RecoilProvider>
    );

    // Ensure wrappers exist
    const errorBoundary = screen.getByTestId('error-boundary');
    const recoilRoot = screen.getByTestId('recoil-root');

    expect(errorBoundary).toBeInTheDocument();
    expect(recoilRoot).toBeInTheDocument();
    // Child should be inside recoil root
    expect(recoilRoot).toContainElement(screen.getByTestId('child'));

    // Basic structure sanity
    expect(container.innerHTML.indexOf('error-boundary')).toBeLessThan(container.innerHTML.length);
  });

  it('includes RouterBridge and ClientHttpLoadingBridge markers', () => {
    render(
      <RecoilProvider>
        <div>content</div>
      </RecoilProvider>
    );

    expect(screen.getByTestId('router-bridge')).toBeInTheDocument();
    expect(screen.getByTestId('client-http-loading-bridge')).toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    render(
      <RecoilProvider>
        <div data-testid="c1">One</div>
        <div data-testid="c2">Two</div>
      </RecoilProvider>
    );

    expect(screen.getByTestId('c1')).toBeInTheDocument();
    expect(screen.getByTestId('c2')).toBeInTheDocument();
  });

  it('handles null/undefined/boolean children gracefully', () => {
    const { rerender } = render(<RecoilProvider>{null}</RecoilProvider>);
    expect(screen.getByTestId('recoil-root')).toBeInTheDocument();

    rerender(<RecoilProvider>{undefined}</RecoilProvider>);
    expect(screen.getByTestId('recoil-root')).toBeInTheDocument();

    rerender(
      <RecoilProvider>
        {false}
        {true}
      </RecoilProvider>
    );
    expect(screen.getByTestId('recoil-root')).toBeInTheDocument();
  });

  it('is stable across re-renders', () => {
    const { rerender } = render(
      <RecoilProvider>
        <div data-testid="child">A</div>
      </RecoilProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('A');

    rerender(
      <RecoilProvider>
        <div data-testid="child">B</div>
      </RecoilProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('B');
  });
});
