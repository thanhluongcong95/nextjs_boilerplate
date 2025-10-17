import '@testing-library/jest-dom';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';
import React from 'react';

type UseTranslations = (namespace?: string) => (key: string) => string;

const useTranslationsMock: MockedFunction<UseTranslations> = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: (...args: Parameters<UseTranslations>) => useTranslationsMock(...args),
}));

const { useTranslations } = jest.requireMock('next-intl') as {
  useTranslations: UseTranslations;
};

const importClientOnly = () => import('../ClientOnly').then(module => module.ClientOnly);

describe('ClientOnly', () => {
  it('renders the provided fallback while awaiting client hydration', async () => {
    const ClientOnly = await importClientOnly();
    const useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);

    render(
      <ClientOnly fallback={<span data-testid="fallback">Loading content...</span>}>
        <span>Client-only content</span>
      </ClientOnly>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByText('Client-only content')).not.toBeInTheDocument();

    useEffectSpy.mockRestore();
  });

  it('renders children on the client once the component has mounted', async () => {
    const ClientOnly = await importClientOnly();

    render(
      <ClientOnly fallback={<span>Loading content...</span>}>
        <p>Client-only content</p>
      </ClientOnly>
    );

    await waitFor(() => expect(screen.getByText('Client-only content')).toBeInTheDocument());
    expect(screen.queryByText('Loading content...')).not.toBeInTheDocument();
  });

  it('falls back to null when no fallback prop is provided', async () => {
    const ClientOnly = await importClientOnly();
    const useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => undefined);

    const { container } = render(
      <ClientOnly>
        <span>Hidden on the server</span>
      </ClientOnly>
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Hidden on the server')).not.toBeInTheDocument();

    useEffectSpy.mockRestore();
  });

  it('allows user interactions within its children after mounting', async () => {
    const ClientOnly = await importClientOnly();

    const InteractiveChild = () => {
      const [count, setCount] = React.useState(0);

      return (
        <button type="button" onClick={() => setCount(current => current + 1)}>
          Count: {count}
        </button>
      );
    };

    render(
      <ClientOnly fallback={<span>Loading content...</span>}>
        <InteractiveChild />
      </ClientOnly>
    );

    const button = await screen.findByRole('button', { name: 'Count: 0' });

    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveTextContent('Count: 1'));
  });

  it('renders localized content provided by children that rely on i18n', async () => {
    const ClientOnly = await importClientOnly();

    useTranslationsMock.mockImplementationOnce(_namespace => (key: string) => `translated:${key}`);

    const LocalizedChild = () => {
      const t = useTranslations('Common');
      return <span>{t('welcome')}</span>;
    };

    render(
      <ClientOnly fallback={<span>Loading content...</span>}>
        <LocalizedChild />
      </ClientOnly>
    );

    await waitFor(() => expect(screen.getByText('translated:welcome')).toBeInTheDocument());
    expect(useTranslationsMock).toHaveBeenCalledWith('Common');
    expect(useTranslationsMock).toHaveBeenCalledTimes(1);
  });

  it('matches the snapshot after the client content mounts', async () => {
    const ClientOnly = await importClientOnly();

    const { asFragment } = render(
      <ClientOnly fallback={<span>Loading content...</span>}>
        <div>
          <h1>Snapshot heading</h1>
          <p>Snapshot body copy</p>
        </div>
      </ClientOnly>
    );

    await waitFor(() => expect(screen.getByText('Snapshot heading')).toBeInTheDocument());

    expect(asFragment()).toMatchSnapshot();
  });
});
