'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui';
import { updatePassword } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { Loader2 } from "lucide-react";

interface UpdatePasswordProps {
  redirectMethod: string;
}

export default function UpdatePassword({ redirectMethod }: UpdatePasswordProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleRequest(e, updatePassword, redirectMethod === 'client' ? router : null);
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-sm mx-auto bg-secondary dark:bg-primary text-primary dark:text-secondary rounded-lg shadow-md p-8">
    <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="updatePasswordForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              placeholder="New Password"
              type="password"
              name="password"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Confirm New Password</Label>
            <Input
              id="passwordConfirm"
              placeholder="Confirm New Password"
              type="password"
              name="passwordConfirm"
              autoComplete="new-password"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
      {isSubmitting ? (
        <Button
          variant="default"
          type="submit"
          form="updatePasswordForm"
          className="w-full text-secondary dark:text-primary bg-primary dark:bg-secondary hover:bg-gray-400 hover:dark:bg-gray-900"
          disabled
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </Button>
      ) : (
        <Button
          variant="default"
          type="submit"
          form="updatePasswordForm"
          className="w-full text-secondary dark:text-primary bg-primary dark:bg-secondary hover:bg-gray-400 hover:dark:bg-gray-900"
        >
          Update Password
        </Button>
      )}
      </CardFooter>
    </Card>
  );
}