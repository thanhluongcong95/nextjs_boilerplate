/* istanbul ignore file */

'use client';

import { AuthRedirect, SignInForm } from '@/app/[locale]/(public)/auth/(_lib)/component';

const SignInPage = () => {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <SignInForm />
      <AuthRedirect />
    </div>
  );
};

export default SignInPage;
