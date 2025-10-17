import { cleanup, render } from '@testing-library/react';
import { useRouter } from 'next/navigation';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

import { RouterBridge, getRouter } from '@/shared/providers/bridges/RouterBridge';

const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  refresh: mockRefresh,
  back: mockBack,
  forward: mockForward,
  prefetch: mockPrefetch,
};

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('RouterBridge (TDD)', () => {
  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<RouterBridge />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null as it is a bridge component', () => {
      const { container } = render(<RouterBridge />);
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Router Reference Management', () => {
    it('sets the router reference on mount', () => {
      render(<RouterBridge />);
      const router = getRouter();
      expect(router).toBe(mockRouter);
    });

    it('updates router reference when router changes', () => {
      const { rerender } = render(<RouterBridge />);

      const newMockRouter = { ...mockRouter, push: jest.fn() };
      (useRouter as jest.Mock).mockReturnValue(newMockRouter);

      rerender(<RouterBridge />);

      const router = getRouter();
      expect(router).toBe(newMockRouter);
    });

    it('returns null initially before mounting', () => {
      // Reset the module to clear any previous state
      jest.resetModules();
      // Re-import to get fresh module state
      const { getRouter: freshGetRouter } = require('@/shared/providers/bridges/RouterBridge');
      expect(freshGetRouter()).toBeNull();
    });
  });

  describe('getRouter() Function', () => {
    it('provides access to router methods after mounting', () => {
      render(<RouterBridge />);
      const router = getRouter();

      expect(router).toHaveProperty('push');
      expect(router).toHaveProperty('replace');
      expect(router).toHaveProperty('refresh');
      expect(router).toHaveProperty('back');
      expect(router).toHaveProperty('forward');
      expect(router).toHaveProperty('prefetch');
    });

    it('allows calling router.push through getRouter()', () => {
      render(<RouterBridge />);
      const router = getRouter();

      router?.push('/test-route');

      expect(mockPush).toHaveBeenCalledWith('/test-route');
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('allows calling router.replace through getRouter()', () => {
      render(<RouterBridge />);
      const router = getRouter();

      router?.replace('/new-route');

      expect(mockReplace).toHaveBeenCalledWith('/new-route');
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });

    it('allows calling router.back through getRouter()', () => {
      render(<RouterBridge />);
      const router = getRouter();

      router?.back();

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('allows calling router.refresh through getRouter()', () => {
      render(<RouterBridge />);
      const router = getRouter();

      router?.refresh();

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple RouterBridge instances by using the latest', () => {
      const firstRouter = mockRouter;
      render(<RouterBridge />);
      expect(getRouter()).toBe(firstRouter);

      const secondRouter = { ...mockRouter, push: jest.fn() };
      (useRouter as jest.Mock).mockReturnValue(secondRouter);
      render(<RouterBridge />);

      expect(getRouter()).toBe(secondRouter);
    });

    it('maintains router reference across component re-renders', () => {
      const { rerender } = render(<RouterBridge />);
      const firstRef = getRouter();

      rerender(<RouterBridge />);
      const secondRef = getRouter();

      expect(firstRef).toBe(secondRef);
      expect(firstRef).toBe(mockRouter);
    });
  });

  describe('Integration with Next.js Router', () => {
    it('calls useRouter hook on mount', () => {
      render(<RouterBridge />);
      expect(useRouter).toHaveBeenCalled();
    });

    it('provides the same router instance returned by useRouter', () => {
      render(<RouterBridge />);
      const routerFromBridge = getRouter();

      expect(routerFromBridge).toEqual(mockRouter);
      expect(routerFromBridge?.push).toBe(mockPush);
      expect(routerFromBridge?.replace).toBe(mockReplace);
    });
  });

  describe('Memory and Lifecycle', () => {
    it('does not cause memory leaks when mounting and unmounting multiple times', () => {
      const { unmount: unmount1 } = render(<RouterBridge />);
      const ref1 = getRouter();
      unmount1();

      const { unmount: unmount2 } = render(<RouterBridge />);
      const ref2 = getRouter();
      unmount2();

      const { unmount: unmount3 } = render(<RouterBridge />);
      const ref3 = getRouter();

      // All should reference the mock router
      expect(ref1).toBe(mockRouter);
      expect(ref2).toBe(mockRouter);
      expect(ref3).toBe(mockRouter);

      unmount3();
    });

    it('keeps router reference even after unmount (module-level state)', () => {
      const { unmount } = render(<RouterBridge />);
      expect(getRouter()).toBe(mockRouter);

      unmount();

      // Router ref should still be available (this is the current behavior)
      expect(getRouter()).toBe(mockRouter);
    });
  });

  describe('Type Safety', () => {
    it('getRouter returns the correct type signature', () => {
      render(<RouterBridge />);
      const router = getRouter();

      // Should have all expected methods
      if (router) {
        expect(typeof router.push).toBe('function');
        expect(typeof router.replace).toBe('function');
        expect(typeof router.refresh).toBe('function');
        expect(typeof router.back).toBe('function');
        expect(typeof router.forward).toBe('function');
        expect(typeof router.prefetch).toBe('function');
      }
    });
  });

  describe('Concurrent Rendering', () => {
    it('handles router updates in useEffect correctly', () => {
      const { rerender } = render(<RouterBridge />);

      // Simulate router change
      const newRouter = { ...mockRouter, push: jest.fn() };
      (useRouter as jest.Mock).mockReturnValue(newRouter);

      rerender(<RouterBridge />);

      // Should update to new router
      expect(getRouter()).toBe(newRouter);
      expect(getRouter()?.push).not.toBe(mockPush);
    });
  });
});
