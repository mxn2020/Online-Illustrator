'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui';
import { updateName } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { Loader2 } from "lucide-react";

export default function NameForm({ userName }: { userName: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('fullName') as string;
    
    // Check if the new name is the same as the old name
    if (newName === userName) {
      return;
    }
    
    setIsSubmitting(true);
    await handleRequest(e, updateName, router);
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Name</CardTitle>
        <CardDescription>
          Please enter your full name, or a display name you are comfortable with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="nameForm" onSubmit={handleSubmit}>
          <Input
            type="text"
            name="fullName"
            defaultValue={userName}
            placeholder="Your name"
            maxLength={64}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <p className="pb-4 sm:pb-0">64 characters maximum</p>
        {isSubmitting ? (
        <Button
          variant="outline"
          type="submit"
          form="nameForm"
          disabled
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </Button>
      ) : (
        <Button
          variant="outline"
          type="submit"
          form="nameForm"
        >
          Update Name
        </Button>
      )}
      </CardFooter>
    </Card>
  );
}