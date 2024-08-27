'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/types_db';
import { Loader2 } from "lucide-react";

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;

interface ProductWithPrices extends Product {
  prices: Price[];
}

interface PriceWithProduct extends Price {
  products: Product | null;
}

interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const intervals = Array.from(
    new Set(products.flatMap((product) => product?.prices?.map((price) => price?.interval)))
  );

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(price, currentPath);

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(getErrorRedirect(currentPath, 'An unknown error occurred.', 'Please try again later or contact a system administrator.'));
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  return (
    <section className="py-20 bg-secondary text-primary">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Pricing Plans</h1>
        <p className="text-xl text-center mb-12 max-w-2xl mx-auto">
          Start building for free, then add a site plan to go live. Account plans unlock additional features.
        </p>
        
        {intervals.length > 0 && (
          <div className="flex justify-center mb-12">
            {intervals.includes('month') && (
              <Button
                variant={billingInterval === 'month' ? 'default' : 'outline'}
                onClick={() => setBillingInterval('month')}
                className="mr-4"
              >
                Monthly billing
              </Button>
            )}
            {intervals.includes('year') && (
              <Button
                variant={billingInterval === 'year' ? 'default' : 'outline'}
                onClick={() => setBillingInterval('year')}
              >
                Yearly billing
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Get started with basic features</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-4">$0<span className="text-xl font-normal">/forever</span></p>
            </CardContent>
            <CardFooter>
              <Link href={user ? '/illustrator' : '/signin/signup'} passHref>
                <Button className="w-full">
                  {user ? 'Go to IllustratorApp' : 'Sign Up'}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Paid Plans */}
          {products.map((product) => {
            const price = product?.prices?.find((price) => price.interval === billingInterval);
            if (!price) return null;
            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency!,
              minimumFractionDigits: 0
            }).format((price?.unit_amount || 0) / 100);

            return (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold mb-4">
                    {priceString}<span className="text-xl font-normal">/{billingInterval}</span>
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleStripeCheckout(price)}
                    disabled={priceIdLoading === price.id}
                  >
                    {priceIdLoading === price.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : subscription ? 'Manage' : 'Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {products.length === 0 && (
          <p className="text-2xl font-extrabold text-primary sm:text-center sm:text-3xl mt-8">
            No paid subscription plans found.
          </p>
        )}
      </div>
    </section>
  );
}