import { cleanup, fireEvent, render } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { globalLoadingState } from '@/shared/state/atoms/loading.atoms';

// Mock the controller so we can assert registerGlobalLoading calls
const mockRegister = jest.fn();
jest.mock('@/shared/state/controllers/loading.controller', () => ({
  registerGlobalLoading: (...args: any[]) => mockRegister(...args),
}));

import { HttpLoadingBridge } from '@/shared/providers/bridges/HttpLoadingBridge';

afterEach(() => {
  cleanup();
  mockRegister.mockClear();
  document.body.className = '';
});

const Setter = () => {
  const set = useSetRecoilState(globalLoadingState);
  return (
    <div>
      <button onClick={() => set(1)} data-testid="start">
        start
      </button>
      <button onClick={() => set(0)} data-testid="stop">
        stop
      </button>
    </div>
  );
};

describe('HttpLoadingBridge (TDD)', () => {
  it('registers and unregisters the global loading setter on mount/unmount', () => {
    const { unmount } = render(
      <RecoilRoot>
        <HttpLoadingBridge />
      </RecoilRoot>
    );

    // Should be called on mount with a function
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(typeof mockRegister.mock.calls[0][0]).toBe('function');

    // On unmount, should unregister with null
    unmount();
    expect(mockRegister).toHaveBeenCalledTimes(2);
    expect(mockRegister.mock.calls[1][0]).toBeNull();
  });

  it('toggles body.cursor-progress when loadingCount changes', () => {
    const { getByTestId } = render(
      <RecoilRoot>
        <HttpLoadingBridge />
        <Setter />
      </RecoilRoot>
    );

    // initially no class
    expect(document.body.classList.contains('cursor-progress')).toBe(false);

    // start loading
    fireEvent.click(getByTestId('start'));
    expect(document.body.classList.contains('cursor-progress')).toBe(true);

    // stop loading
    fireEvent.click(getByTestId('stop'));
    expect(document.body.classList.contains('cursor-progress')).toBe(false);
  });
});
