'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/components/ui';
import { signUp } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { Loader2 } from "lucide-react";

interface SignUpProps {
  allowEmail: boolean;
  redirectMethod: string;
}

export default function SignUp({ allowEmail, redirectMethod }: SignUpProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleRequest(e, signUp, redirectMethod === 'client' ? router : null);
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
          Signing up...
        </Button>
      ) : (
        <Button
          variant="default"
          type="submit"
          className="w-full text-secondary dark:text-primary bg-primary dark:bg-secondary hover:bg-gray-400 hover:dark:bg-gray-900"
        >
          Sign up
        </Button>
      )}
      </form>
      <div className="mt-4 text-sm">
        <p>Already have an account?</p>
        <Link href="/signin/password_signin" className="hover:underline">
          Sign in with email and password
        </Link>
        {allowEmail && (
          <Link href="/signin/email_signin" className="block mt-2 hover:underline">
            Sign in via magic link
          </Link>
        )}
      </div>
    </div>
  );
}