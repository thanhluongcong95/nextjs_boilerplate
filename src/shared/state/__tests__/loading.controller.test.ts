import { registerGlobalLoading, startGlobalLoading, stopGlobalLoading } from '../controllers/loading.controller';

describe('loading.controller', () => {
  afterEach(() => {
    registerGlobalLoading(null);
  });

  it('increments and decrements the loading counter via registered setter', () => {
    let value = 0;

    registerGlobalLoading(updater => {
      value = updater(value);
    });

    startGlobalLoading();
    expect(value).toBe(1);

    startGlobalLoading();
    expect(value).toBe(2);

    stopGlobalLoading();
    expect(value).toBe(1);

    stopGlobalLoading();
    expect(value).toBe(0);
  });

  it('guards against negative counts when stopping more than started', () => {
    let value = 5;

    registerGlobalLoading(updater => {
      value = updater(value);
    });

    stopGlobalLoading();
    stopGlobalLoading();

    expect(value).toBe(3);

    registerGlobalLoading(null);
    stopGlobalLoading();
    // Should not throw even if no setter is registered.
  });
});
