import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { AppRecoilRoot } from '../AppRecoilRoot';

// Mock RecoilRoot so we can assert it is used
jest.mock('recoil', () => ({
  RecoilRoot: ({ children }: { children: ReactNode }) => <div data-testid="recoil-root">{children}</div>,
}));

describe('AppRecoilRoot', () => {
  it('should render children correctly', () => {
    const testContent = 'Test Content';
    render(
      <AppRecoilRoot>
        <div>{testContent}</div>
      </AppRecoilRoot>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should wrap children with RecoilRoot', () => {
    render(
      <AppRecoilRoot>
        <div>Test</div>
      </AppRecoilRoot>
    );

    expect(screen.getByTestId('recoil-root')).toBeInTheDocument();
  });

  it('should pass children to RecoilRoot', () => {
    const testId = 'test-child';
    render(
      <AppRecoilRoot>
        <div data-testid={testId}>Child Content</div>
      </AppRecoilRoot>
    );

    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    render(
      <AppRecoilRoot>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
      </AppRecoilRoot>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    const { container } = render(<AppRecoilRoot>{null}</AppRecoilRoot>);

    expect(screen.getByTestId('recoil-root')).toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle undefined children', () => {
    const { container } = render(<AppRecoilRoot>{undefined}</AppRecoilRoot>);

    expect(screen.getByTestId('recoil-root')).toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should accept ReactNode as children prop', () => {
    const Component = ({ text }: { text: string }) => <span>{text}</span>;

    render(
      <AppRecoilRoot>
        <Component text="Component Child" />
      </AppRecoilRoot>
    );

    expect(screen.getByText('Component Child')).toBeInTheDocument();
  });
});
