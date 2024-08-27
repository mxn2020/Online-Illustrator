'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { signInWithEmail } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { Loader2 } from "lucide-react";

interface EmailSignInProps {
  allowPassword: boolean;
  redirectMethod: string;
  disableButton?: boolean;
}

export default function EmailSignIn({
  allowPassword,
  redirectMethod,
  disableButton
}: EmailSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signInWithEmail, router);
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

        {isSubmitting || disableButton ? (
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
      {allowPassword && (
        <div className="mt-4 text-sm space-y-2">
          <Link href="/signin/password_signin" className="block hover:underline">
            Sign in with email and password
          </Link>
          <Link href="/signin/signup" className="block hover:underline">
            Don't have an account? Sign up
          </Link>
        </div>
      )}
    </div>
  );
}