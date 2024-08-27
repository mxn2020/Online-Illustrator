import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  getUserDetails,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import IllustratorClient from './IllustratorClient';
import { Locale } from '@/i18n.config'

export default async function IllustratorPage({
  params
}: {
  params: { lang: Locale }
}) {
  const supabase = createClient();
  const [user, userDetails, subscription] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }

  return <IllustratorClient
    lang={params.lang}
  />;
}