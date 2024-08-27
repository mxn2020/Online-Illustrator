'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui';
import { updateEmail } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { Loader2 } from "lucide-react";

export default function EmailForm({
  userEmail
}: {
  userEmail: string | undefined;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEmail = formData.get('newEmail') as string;
    
    // Check if the new email is the same as the old email
    if (newEmail === userEmail) {
      return;
    }
    
    setIsSubmitting(true);
    await handleRequest(e, updateEmail, router);
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Email</CardTitle>
        <CardDescription>
          Please enter the email address you want to use to login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="emailForm" onSubmit={handleSubmit}>
          <Input
            type="email"
            name="newEmail"
            defaultValue={userEmail ?? ''}
            placeholder="Your email"
            maxLength={64}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <p className="pb-4 sm:pb-0">
          We will email you to verify the change.
        </p>
        {isSubmitting ? (
        <Button
          variant="outline"
          type="submit"
          form="emailForm"
          disabled
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </Button>
      ) : (
        <Button
          variant="outline"
          type="submit"
          form="emailForm"
        >
          Update Email
        </Button>
      )}
      </CardFooter>
    </Card>
  );
}