import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserDetails,   getProducts, getSubscription, getUser } from '@/utils/supabase/queries';
import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui';

export default async function Account() {
  const supabase = createClient();
  const [user, products, userDetails, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getUserDetails(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-secondary text-primary dark:bg-primary dark:text-secondary">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <NameForm userName={userDetails?.full_name || ''} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Email</CardTitle>
              <CardDescription>
                Your current email address is: {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Email changes are currently disabled. Please contact support if you need to update your email.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <CustomerPortalForm 
        user={user}
        products={products ?? []}
        subscription={subscription} />
      </div>
    </div>
  );
}