'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { signInWithPassword } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { Loader2 } from "lucide-react";

interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function PasswordSignIn({ allowEmail, redirectMethod }: PasswordSignInProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false);
  };

  return (
    <div className="my-8 max-w-sm mx-auto bg-secondary dark:bg-primary text-primary dark:text-secondary rounded-lg shadow-md p-8">
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            name="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            name="password"
            autoComplete="current-password"
          />
        </div>
        {isSubmitting ? (
        <Button
          variant="default"
          type="submit"
          className="w-full text-secondary dark:text-primary bg-primary dark:bg-secondary hover:bg-gray-400 hover:dark:bg-gray-900"
          disabled
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </Button>
      ) : (
        <Button
          variant="default"
          type="submit"
          className="w-full text-secondary dark:text-primary bg-primary dark:bg-secondary hover:bg-gray-400 hover:dark:bg-gray-900"
        >
          Sign in
        </Button>
      )}
      </form>
      <div className="mt-4 text-sm space-y-2">
        <Link href="/signin/forgot_password" className="block hover:underline">
          Forgot your password?
        </Link>
        {allowEmail && (
          <Link href="/signin/email_signin" className="block hover:underline">
            Sign in via magic link
          </Link>
        )}
        <Link href="/signin/signup" className="block hover:underline">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
}