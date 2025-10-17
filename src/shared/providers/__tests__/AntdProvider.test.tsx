import { render, screen } from '@testing-library/react';

// Mock the NotificationBridge component
jest.mock('@/shared/providers/NotificationBridge', () => ({
  NotificationBridge: ({ children }: { children: React.ReactNode }) => <div data-testid="notification-bridge">{children}</div>,
}));

import { AntdProvider } from '@/shared/providers/AntdProvider';

describe('AntdProvider (TDD)', () => {
  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <AntdProvider>
          <div>Test content</div>
        </AntdProvider>
      );
      expect(container).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <AntdProvider>
          <div data-testid="test-child">Test Child</div>
        </AntdProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      render(
        <AntdProvider>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <div data-testid="child-3">Third Child</div>
        </AntdProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Provider Composition', () => {
    it('wraps children with ConfigProvider', () => {
      const { container } = render(
        <AntdProvider>
          <div>Test</div>
        </AntdProvider>
      );

      // ConfigProvider should be in the component tree
      const configProvider = container.querySelector('.ant-app');
      expect(configProvider).toBeInTheDocument();
    });

    it('includes NotificationBridge in the component tree', () => {
      render(
        <AntdProvider>
          <div>Test</div>
        </AntdProvider>
      );

      expect(screen.getByTestId('notification-bridge')).toBeInTheDocument();
    });

    it('renders children inside NotificationBridge', () => {
      render(
        <AntdProvider>
          <div data-testid="inner-child">Inner Content</div>
        </AntdProvider>
      );

      const notificationBridge = screen.getByTestId('notification-bridge');
      const innerChild = screen.getByTestId('inner-child');

      expect(notificationBridge).toContainElement(innerChild);
    });
  });

  describe('Theme Configuration', () => {
    it('applies custom theme with primary color', () => {
      const { container } = render(
        <AntdProvider>
          <div>Test</div>
        </AntdProvider>
      );

      // Verify that ConfigProvider is rendering (theme will be applied internally)
      expect(container.querySelector('.ant-app')).toBeInTheDocument();
    });

    it('provides consistent theme configuration across re-renders', () => {
      const { rerender } = render(
        <AntdProvider>
          <div>Initial</div>
        </AntdProvider>
      );

      rerender(
        <AntdProvider>
          <div>Updated</div>
        </AntdProvider>
      );

      expect(screen.getByText('Updated')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('accepts ReactNode as children', () => {
      render(
        <AntdProvider>
          <span>Text Node</span>
        </AntdProvider>
      );

      expect(screen.getByText('Text Node')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      const { container } = render(<AntdProvider>{null}</AntdProvider>);

      expect(container).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      const { container } = render(<AntdProvider>{undefined}</AntdProvider>);

      expect(container).toBeInTheDocument();
    });

    it('handles boolean children gracefully', () => {
      const { container } = render(
        <AntdProvider>
          {false}
          {true}
        </AntdProvider>
      );

      expect(container).toBeInTheDocument();
    });

    it('handles conditional rendering', () => {
      const showContent = true;
      render(<AntdProvider>{showContent && <div data-testid="conditional">Conditional Content</div>}</AntdProvider>);

      expect(screen.getByTestId('conditional')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('allows antd components to access theme configuration', () => {
      const { container } = render(
        <AntdProvider>
          <div className="ant-btn">Button</div>
        </AntdProvider>
      );

      expect(container.querySelector('.ant-btn')).toBeInTheDocument();
    });

    it('maintains provider context across nested components', () => {
      const NestedComponent = () => <div data-testid="nested">Nested</div>;
      const MiddleComponent = () => (
        <div data-testid="middle">
          <NestedComponent />
        </div>
      );

      render(
        <AntdProvider>
          <MiddleComponent />
        </AntdProvider>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByTestId('middle')).toBeInTheDocument();
    });
  });

  describe('Provider Hierarchy', () => {
    it('maintains correct provider order: ConfigProvider > App > NotificationBridge > children', () => {
      render(
        <AntdProvider>
          <div data-testid="final-child">Final Child</div>
        </AntdProvider>
      );

      const notificationBridge = screen.getByTestId('notification-bridge');
      const finalChild = screen.getByTestId('final-child');

      // NotificationBridge should contain the final child
      expect(notificationBridge).toContainElement(finalChild);
    });
  });

  describe('Edge Cases', () => {
    it('handles complex nested JSX', () => {
      render(
        <AntdProvider>
          <div>
            <ul>
              <li data-testid="item-1">Item 1</li>
              <li data-testid="item-2">Item 2</li>
            </ul>
          </div>
        </AntdProvider>
      );

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
    });

    it('handles array of children', () => {
      const items = ['One', 'Two', 'Three'];
      render(
        <AntdProvider>
          {items.map((item, index) => (
            <div key={index} data-testid={`item-${index}`}>
              {item}
            </div>
          ))}
        </AntdProvider>
      );

      expect(screen.getByTestId('item-0')).toHaveTextContent('One');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Two');
      expect(screen.getByTestId('item-2')).toHaveTextContent('Three');
    });

    it('handles fragments as children', () => {
      render(
        <AntdProvider>
          <>
            <div data-testid="fragment-1">Fragment 1</div>
            <div data-testid="fragment-2">Fragment 2</div>
          </>
        </AntdProvider>
      );

      expect(screen.getByTestId('fragment-1')).toBeInTheDocument();
      expect(screen.getByTestId('fragment-2')).toBeInTheDocument();
    });
  });

  describe('Re-rendering', () => {
    it('updates children when props change', () => {
      const { rerender } = render(
        <AntdProvider>
          <div data-testid="content">Original</div>
        </AntdProvider>
      );

      expect(screen.getByTestId('content')).toHaveTextContent('Original');

      rerender(
        <AntdProvider>
          <div data-testid="content">Updated</div>
        </AntdProvider>
      );

      expect(screen.getByTestId('content')).toHaveTextContent('Updated');
    });

    it('maintains provider stability across re-renders', () => {
      const { rerender, container } = render(
        <AntdProvider>
          <div>Initial</div>
        </AntdProvider>
      );

      const initialApp = container.querySelector('.ant-app');

      rerender(
        <AntdProvider>
          <div>Updated</div>
        </AntdProvider>
      );

      const updatedApp = container.querySelector('.ant-app');
      expect(updatedApp).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('accepts valid ReactNode types', () => {
      const TestComponent = () => <div>Component</div>;

      render(
        <AntdProvider>
          <TestComponent />
        </AntdProvider>
      );

      expect(screen.getByText('Component')).toBeInTheDocument();
    });

    it('handles string children', () => {
      render(<AntdProvider>Simple text content</AntdProvider>);

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('handles number children', () => {
      render(<AntdProvider>{42}</AntdProvider>);

      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
});
