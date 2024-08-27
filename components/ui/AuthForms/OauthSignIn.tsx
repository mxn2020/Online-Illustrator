'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { signInWithOAuth } from '@/utils/auth-helpers/client';
import { type Provider } from '@supabase/supabase-js';
import { Github, Loader2 } from 'lucide-react';

type OAuthProviders = {
  name: Provider;
  displayName: string;
  icon: JSX.Element;
};

export default function OauthSignIn() {
  const oAuthProviders: OAuthProviders[] = [
    {
      name: 'github',
      displayName: 'GitHub',
      icon: <Github className="h-5 w-5" />
    }
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await signInWithOAuth(e);
    setIsSubmitting(false);
  };

  return (
    <div className="my-8 max-w-sm mx-auto bg-secondary dark:bg-primary text-primary dark:text-secondary rounded-lg shadow-md p-8">
    {oAuthProviders.map((provider) => (
        <form key={provider.name} onSubmit={handleSubmit} className="mb-2">
          <input type="hidden" name="provider" value={provider.name} />
          {isSubmitting ? (
          <Button
            variant="outline"
            type="submit"
            className="w-full flex items-center justify-center text-secondary dark:text-primary bg-primary dark:bg-secondary hover:bg-gray-400 hover:dark:bg-gray-900"
            disabled
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </Button>
        ) : (
          <Button
            variant="outline"
            type="submit"
            className="w-full flex items-center justify-center text-secondary dark:text-primary bg-primary dark:bg-secondary hover:bg-gray-400 hover:dark:bg-gray-900"
          >
            <span className="mr-2">{provider.icon}</span>
            <span>{provider.displayName}</span>
          </Button>
        )}
        </form>
      ))}
    </div>
  );
}