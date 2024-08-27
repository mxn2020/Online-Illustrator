import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/utils/supabase/client';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

interface FeatureRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureRequestDialog({ open, onOpenChange }: FeatureRequestDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
      setError('');
    } else {
      setError(`Title must be ${MAX_TITLE_LENGTH} characters or less.`);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
      setError('');
    } else {
      setError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.length > MAX_TITLE_LENGTH || description.length > MAX_DESCRIPTION_LENGTH) {
      setError('Please ensure both title and description are within the character limits.');
      return;
    }

    if (!userId) {
      setError('You must be logged in to submit a feature request.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feature_requests')
        .insert([{ user_id: userId, title, description }]);

      if (error) throw error;

      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setError('');
      onOpenChange(false);
    } catch (error) {
      setError('Failed to submit feature request. Please try again.');
    }
  };

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, [supabase.auth]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit a Feature Request</DialogTitle>
          <DialogDescription>
            Let us know what features you&apos;d like to see in our product.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={handleTitleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="text-sm text-gray-500 text-right">
              {title.length}/{MAX_TITLE_LENGTH}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="text-sm text-gray-500 text-right">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FeatureRequestDialog;