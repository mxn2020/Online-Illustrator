'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui';
import { createStripePortal } from '@/utils/stripe/server';
import { Tables } from '@/types_db';
import { Loader2 } from "lucide-react";
import Pricing from '../Pricing/Pricing';

type Subscription = Tables<'subscriptions'>;
type Price = Tables<'prices'>;
type Product = Tables<'products'>;

interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}


type SubscriptionWithPriceAndProduct = Subscription & {
  prices:
    | (Price & {
        products: Product | null;
      })
    | null;
};

interface Props {
  user: any;
  products: ProductWithPrices[];
  subscription: SubscriptionWithPriceAndProduct | null;
}

export function CustomerPortalForm({ user, products, subscription }: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription?.prices?.currency!,
      minimumFractionDigits: 0
    }).format((subscription?.prices?.unit_amount || 0) / 100);

  const handleStripePortalRequest = async () => {
    setIsSubmitting(true);
    const redirectUrl = await createStripePortal(currentPath);
    setIsSubmitting(false);
    return router.push(redirectUrl);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Your Plan</CardTitle>
        <CardDescription>
          {subscription
            ? `You are currently on the ${subscription?.prices?.products?.name} plan.`
            : 'You are not currently subscribed to any plan.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold">
          {subscription ? (
            `${subscriptionPrice}/${subscription?.prices?.interval}`
          ) : (
            <Link href="/">Choose your plan</Link>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <p className="pb-4 sm:pb-0">Manage your subscription on Stripe.</p>
        {isSubmitting ? (
          <Button
            variant="outline"
            disabled
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleStripePortalRequest}
            disabled={!subscription}
          >
            {subscription ? 'Open customer portal' : 'No active subscription'}
          </Button>
        )}
      </CardFooter>
    </Card>

      {!subscription ? (
    <Card>
        <Pricing user={user} products={products} subscription={subscription} />
        </Card>
      ) : (
        <></>
      )}
    </>
  );
}

export default CustomerPortalForm;
