import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';
import React from 'react';
import type { getTranslations as GetTranslationsFn } from 'next-intl/server';

type RouteLoadingProps = {
  message: string;
  description: string;
};

const routeLoadingRenderSpy = jest.fn<(props: RouteLoadingProps) => void>();

jest.mock('@/shared/ui/feedback/loading/RouteLoading', () => {
  const ReactModule = require('react') as typeof React;

  const RouteLoading = ({ message, description }: RouteLoadingProps) => {
    routeLoadingRenderSpy({ message, description });
    const [clicks, setClicks] = ReactModule.useState(0);

    return (
      <section aria-live="polite" data-testid="route-loading">
        <p data-testid="route-loading-message">{message}</p>
        <p data-testid="route-loading-description">{description}</p>
        <button type="button" onClick={() => setClicks(current => current + 1)}>
          Retry {clicks}
        </button>
      </section>
    );
  };

  RouteLoading.displayName = 'MockRouteLoading';

  return { RouteLoading };
});

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(),
}));

const { getTranslations } = jest.requireMock('next-intl/server') as {
  getTranslations: MockedFunction<GetTranslationsFn>;
};

const importRootLoading = async () => (await import('../RootLoading')).default;

describe('RootLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupTranslations = (overrides?: Partial<Record<string, string>>) => {
    const defaults = {
      loading: 'Loading your workspace...',
      loadingAppShell: 'Preparing your application shell...',
    };

    const messages = { ...defaults, ...overrides };

    const translator = jest.fn((key: string) => messages[key as keyof typeof messages] ?? `missing:${key}`);

    getTranslations.mockResolvedValueOnce(translator as unknown as Awaited<ReturnType<GetTranslationsFn>>);

    return { translator, messages };
  };

  it('requests translations from the common namespace and renders the localized text', async () => {
    const { translator, messages } = setupTranslations();

    const RootLoading = await importRootLoading();
    render(await RootLoading());

    await waitFor(() => expect(screen.getByTestId('route-loading')).toBeInTheDocument());

    expect(getTranslations).toHaveBeenCalledWith('common');
    expect(translator).toHaveBeenCalledWith('loading');
    expect(translator).toHaveBeenCalledWith('loadingAppShell');
    expect(screen.getByText(messages.loading)).toBeInTheDocument();
    expect(screen.getByText(messages.loadingAppShell)).toBeInTheDocument();
  });

  it('passes the translated copy as props to RouteLoading', async () => {
    const { messages } = setupTranslations({
      loading: 'Bootstrapping data...',
      loadingAppShell: 'Configuring environment...',
    });

    const RootLoading = await importRootLoading();
    render(await RootLoading());

    await waitFor(() => expect(screen.getByTestId('route-loading')).toBeInTheDocument());

    expect(routeLoadingRenderSpy).toHaveBeenCalledWith({
      message: messages.loading,
      description: messages.loadingAppShell,
    });
  });

  it('exposes user interactions provided by RouteLoading', async () => {
    setupTranslations();

    const RootLoading = await importRootLoading();
    render(await RootLoading());

    const retryButton = await screen.findByRole('button', { name: 'Retry 0' });

    fireEvent.click(retryButton);

    await waitFor(() => expect(retryButton).toHaveTextContent('Retry 1'));
  });

  it('matches the rendered snapshot', async () => {
    const { messages } = setupTranslations();

    const RootLoading = await importRootLoading();
    const { asFragment } = render(await RootLoading());

    await waitFor(() => expect(screen.getByText(messages.loading)).toBeInTheDocument());

    expect(asFragment()).toMatchSnapshot();
  });
});
