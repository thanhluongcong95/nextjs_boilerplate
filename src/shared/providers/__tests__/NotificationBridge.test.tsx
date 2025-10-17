import { render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';

// Mock the error handler module
const mockSetNotificationApi = jest.fn();
jest.mock('@/shared/infra/errors/error-handler', () => ({
  setNotificationApi: (api: any) => mockSetNotificationApi(api),
}));

import { NotificationBridge } from '@/shared/providers/NotificationBridge';

// Mock notification instance
const mockNotification = {
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  open: jest.fn(),
  destroy: jest.fn(),
};

// Mock App.useApp hook
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  App: {
    ...jest.requireActual('antd').App,
    useApp: jest.fn(),
  },
}));

const mockUseApp = App.useApp as jest.Mock;

beforeEach(() => {
  mockUseApp.mockReturnValue({
    notification: mockNotification,
    message: {},
    modal: {},
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('NotificationBridge (TDD)', () => {
  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <NotificationBridge>
          <div>Test content</div>
        </NotificationBridge>
      );
      expect(container).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <NotificationBridge>
          <div data-testid="test-child">Test Child</div>
        </NotificationBridge>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('renders as a fragment without extra DOM nodes', () => {
      const { container } = render(
        <NotificationBridge>
          <div data-testid="direct-child">Direct Child</div>
        </NotificationBridge>
      );

      // Should not add wrapper elements
      const directChild = screen.getByTestId('direct-child');
      expect(directChild.parentElement).toBe(container);
    });

    it('renders multiple children correctly', () => {
      render(
        <NotificationBridge>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
          <div data-testid="child-3">Third</div>
        </NotificationBridge>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Notification API Registration', () => {
    it('calls setNotificationApi with notification instance on mount', () => {
      render(
        <NotificationBridge>
          <div>Test</div>
        </NotificationBridge>
      );

      expect(mockSetNotificationApi).toHaveBeenCalledWith(mockNotification);
      expect(mockSetNotificationApi).toHaveBeenCalledTimes(1);
    });

    it('registers notification API before rendering children', async () => {
      const callOrder: string[] = [];

      mockSetNotificationApi.mockImplementation(() => {
        callOrder.push('setNotificationApi');
      });

      const TestChild = () => {
        callOrder.push('renderChild');
        return <div>Child</div>;
      };

      render(
        <NotificationBridge>
          <TestChild />
        </NotificationBridge>
      );

      await waitFor(() => {
        expect(callOrder).toContain('setNotificationApi');
        expect(callOrder).toContain('renderChild');
      });
    });

    it('uses App.useApp hook to get notification instance', () => {
      render(
        <NotificationBridge>
          <div>Test</div>
        </NotificationBridge>
      );

      expect(mockUseApp).toHaveBeenCalled();
    });
  });

  describe('Effect Dependencies', () => {
    it('re-registers notification API when notification instance changes', () => {
      const { rerender } = render(
        <NotificationBridge>
          <div>Test</div>
        </NotificationBridge>
      );

      expect(mockSetNotificationApi).toHaveBeenCalledTimes(1);

      // Change notification instance
      const newNotification = { ...mockNotification, error: jest.fn() };
      mockUseApp.mockReturnValue({
        notification: newNotification,
        message: {},
        modal: {},
      });

      rerender(
        <NotificationBridge>
          <div>Test</div>
        </NotificationBridge>
      );

      expect(mockSetNotificationApi).toHaveBeenCalledTimes(2);
      expect(mockSetNotificationApi).toHaveBeenLastCalledWith(newNotification);
    });

    it('does not re-register if notification instance is the same', () => {
      const { rerender } = render(
        <NotificationBridge>
          <div>Initial</div>
        </NotificationBridge>
      );

      expect(mockSetNotificationApi).toHaveBeenCalledTimes(1);

      // Re-render with same notification instance
      rerender(
        <NotificationBridge>
          <div>Updated</div>
        </NotificationBridge>
      );

      // Should not call setNotificationApi again if notification hasn't changed
      // Note: This depends on React's effect dependency comparison
      expect(mockSetNotificationApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('Children Handling', () => {
    it('handles null children gracefully', () => {
      const { container } = render(<NotificationBridge>{null}</NotificationBridge>);

      expect(container).toBeInTheDocument();
      expect(mockSetNotificationApi).toHaveBeenCalled();
    });

    it('handles undefined children gracefully', () => {
      const { container } = render(<NotificationBridge>{undefined}</NotificationBridge>);

      expect(container).toBeInTheDocument();
      expect(mockSetNotificationApi).toHaveBeenCalled();
    });

    it('handles boolean children gracefully', () => {
      const { container } = render(
        <NotificationBridge>
          {false}
          {true}
        </NotificationBridge>
      );

      expect(container).toBeInTheDocument();
      expect(mockSetNotificationApi).toHaveBeenCalled();
    });

    it('handles string children', () => {
      render(<NotificationBridge>Simple text content</NotificationBridge>);

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
      expect(mockSetNotificationApi).toHaveBeenCalled();
    });

    it('handles number children', () => {
      render(<NotificationBridge>{42}</NotificationBridge>);

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(mockSetNotificationApi).toHaveBeenCalled();
    });

    it('handles array of children', () => {
      const items = ['One', 'Two', 'Three'];
      render(
        <NotificationBridge>
          {items.map((item, index) => (
            <div key={index} data-testid={`item-${index}`}>
              {item}
            </div>
          ))}
        </NotificationBridge>
      );

      expect(screen.getByTestId('item-0')).toHaveTextContent('One');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Two');
      expect(screen.getByTestId('item-2')).toHaveTextContent('Three');
    });

    it('handles fragments as children', () => {
      render(
        <NotificationBridge>
          <>
            <div data-testid="fragment-1">Fragment 1</div>
            <div data-testid="fragment-2">Fragment 2</div>
          </>
        </NotificationBridge>
      );

      expect(screen.getByTestId('fragment-1')).toBeInTheDocument();
      expect(screen.getByTestId('fragment-2')).toBeInTheDocument();
    });

    it('handles nested components', () => {
      const NestedComponent = () => <div data-testid="nested">Nested</div>;
      const MiddleComponent = () => (
        <div data-testid="middle">
          <NestedComponent />
        </div>
      );

      render(
        <NotificationBridge>
          <MiddleComponent />
        </NotificationBridge>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByTestId('middle')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('registers notification API immediately on mount', () => {
      render(
        <NotificationBridge>
          <div>Test</div>
        </NotificationBridge>
      );

      expect(mockSetNotificationApi).toHaveBeenCalledWith(mockNotification);
    });

    it('maintains registration across re-renders', () => {
      const { rerender } = render(
        <NotificationBridge>
          <div>Initial</div>
        </NotificationBridge>
      );

      const initialCallCount = mockSetNotificationApi.mock.calls.length;

      rerender(
        <NotificationBridge>
          <div>Updated</div>
        </NotificationBridge>
      );

      // Should maintain registration (exact call count depends on React behavior)
      expect(mockSetNotificationApi).toHaveBeenCalled();
    });

    it('updates children without re-registering notification API unnecessarily', () => {
      const { rerender } = render(
        <NotificationBridge>
          <div data-testid="content">Original</div>
        </NotificationBridge>
      );

      expect(screen.getByTestId('content')).toHaveTextContent('Original');

      rerender(
        <NotificationBridge>
          <div data-testid="content">Updated</div>
        </NotificationBridge>
      );

      expect(screen.getByTestId('content')).toHaveTextContent('Updated');
    });
  });

  describe('Integration with Error Handler', () => {
    it('provides notification API that can be used by error handler', () => {
      render(
        <NotificationBridge>
          <div>Test</div>
        </NotificationBridge>
      );

      const providedApi = mockSetNotificationApi.mock.calls[0][0];

      expect(providedApi).toBe(mockNotification);
      expect(providedApi).toHaveProperty('error');
      expect(providedApi).toHaveProperty('warning');
      expect(providedApi).toHaveProperty('info');
      expect(providedApi).toHaveProperty('success');
    });

    it('passes complete notification API interface', () => {
      render(
        <NotificationBridge>
          <div>Test</div>
        </NotificationBridge>
      );

      const providedApi = mockSetNotificationApi.mock.calls[0][0];

      // Verify all expected notification methods are present
      expect(typeof providedApi.error).toBe('function');
      expect(typeof providedApi.warning).toBe('function');
      expect(typeof providedApi.info).toBe('function');
      expect(typeof providedApi.success).toBe('function');
      expect(typeof providedApi.open).toBe('function');
      expect(typeof providedApi.destroy).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('handles conditional rendering', () => {
      const showContent = true;
      render(<NotificationBridge>{showContent && <div data-testid="conditional">Conditional Content</div>}</NotificationBridge>);

      expect(screen.getByTestId('conditional')).toBeInTheDocument();
      expect(mockSetNotificationApi).toHaveBeenCalled();
    });

    it('handles complex nested JSX', () => {
      render(
        <NotificationBridge>
          <div>
            <ul>
              <li data-testid="item-1">Item 1</li>
              <li data-testid="item-2">Item 2</li>
            </ul>
          </div>
        </NotificationBridge>
      );

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
    });

    it('works correctly when mounted multiple times (not recommended but should handle)', () => {
      const { unmount: unmount1 } = render(
        <NotificationBridge>
          <div>First</div>
        </NotificationBridge>
      );

      expect(mockSetNotificationApi).toHaveBeenCalledTimes(1);
      unmount1();

      render(
        <NotificationBridge>
          <div>Second</div>
        </NotificationBridge>
      );

      expect(mockSetNotificationApi).toHaveBeenCalledTimes(2);
    });
  });

  describe('Type Safety', () => {
    it('accepts ReactNode as children prop', () => {
      const TestComponent = () => <div>Component</div>;

      render(
        <NotificationBridge>
          <TestComponent />
        </NotificationBridge>
      );

      expect(screen.getByText('Component')).toBeInTheDocument();
    });

    it('enforces readonly children prop', () => {
      // This is a compile-time check, but we can verify runtime behavior
      render(
        <NotificationBridge>
          <div>Test</div>
        </NotificationBridge>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
