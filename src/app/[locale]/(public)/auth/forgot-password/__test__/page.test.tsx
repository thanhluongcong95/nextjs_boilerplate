import { render, screen } from '@testing-library/react';

jest.mock('../../(_lib)/component/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">ForgotPasswordForm Mock</div>,
}));

import ForgotPasswordPage from '../page';

describe('ForgotPasswordPage', () => {
  it('should render ForgotPasswordForm component', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { asFragment } = render(<ForgotPasswordPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
