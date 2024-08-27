import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/utils/supabase/client';

const MAX_TESTIMONIAL_LENGTH = 500;

interface TestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestimonialDialog({ open, onOpenChange }: TestimonialDialogProps) {
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  const handleTestimonialChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TESTIMONIAL_LENGTH) {
      setTestimonial(value);
      setError('');
    } else {
      setError(`Testimonial must be ${MAX_TESTIMONIAL_LENGTH} characters or less.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (testimonial.length > MAX_TESTIMONIAL_LENGTH) {
      setError(`Testimonial must be ${MAX_TESTIMONIAL_LENGTH} characters or less.`);
      return;
    }

    if (!userId) {
      setError('You must be logged in to submit a testimonial.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([{ user_id: userId, name, job_title: jobTitle, testimonial }]);

      if (error) throw error;

      // Reset form and close dialog
      setName('');
      setJobTitle('');
      setTestimonial('');
      onOpenChange(false);
    } catch (error) {
      setError('Failed to submit testimonial. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit a Testimonial</DialogTitle>
          <DialogDescription>
            Share your experience with our product. Your testimonial may be featured on our landing page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jobTitle" className="text-right">
                Job Title
              </Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testimonial" className="text-right">
                Testimonial
              </Label>
              <Textarea
                id="testimonial"
                value={testimonial}
                onChange={handleTestimonialChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="text-sm text-gray-500 text-right">
              {testimonial.length}/{MAX_TESTIMONIAL_LENGTH}
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

export default TestimonialDialog;