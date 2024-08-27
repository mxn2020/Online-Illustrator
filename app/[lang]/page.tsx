import React from "react";
import { Locale } from '@/i18n.config' 
import Landing from '@/components/landing/LandingPage';
import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';

export default async function PricingPage({
  params
}: {
  params: { lang: Locale }
}) {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <>
    <Landing
      user={user}
      products={products ?? []}
      subscription={subscription}
      lang={params.lang}
    />
    </>
  );
}
