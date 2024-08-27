import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ABTestContext, trackEvent } from '../tools';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import type { Tables } from '@/types_db';
import { Locale } from '@/i18n.config';
import { useDictionary } from '@/lib/dictionary-provider';

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
  lang: Locale;
}

export function PricingSection({ user, products, subscription, lang }: Props, ) {
  const [isYearly, setIsYearly] = useState(false);
  const { t } = useDictionary();
  const { variant, trackConversion } = useContext(ABTestContext);
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const router = useRouter();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  // Define the static Free Plan
  const freePlan = {
    name: t('pricing.free_plan.name', 'Free Plan'),
    price: 0,
    features: [
      t('pricing.free_plan.feature_1', 'Various Paint tools'),
      t('pricing.free_plan.feature_2', 'Layers and Elements'),
      t('pricing.free_plan.feature_3', 'History and Undo'),
      t('pricing.free_plan.feature_3', 'Many interactive elements'),
    ],
    stripePrice: null,
    isFree: true,
  };

  // Map over Stripe products to create plan objects
  const paidPlans = products
    .map((product) => {
      const price = product.prices.find(
        (price) => price.interval === (isYearly ? 'year' : 'month')
      );

      if (!price || !price.active) return null;

      const priceAmount = price.unit_amount ? price.unit_amount / 100 : 0;

      return {
        name: product.name,
        price: priceAmount,
        features: product.description ? product.description.split(',') : [],
        stripePrice: price,
        isFree: false,
      };
    })
    .filter(Boolean);

  // Combine Free Plan with Paid Plans
  const allPlans = [freePlan, ...paidPlans];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t('pricing.title', 'Our Pricing Plans')}
        </h2>
        <div className="flex justify-center items-center mb-8">
          <span
            className={`mr-2 ${
              !isYearly ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('pricing.monthly', 'Monthly')}
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={(checked) => {
              setIsYearly(checked);
              trackEvent('pricing_toggle', { isYearly: checked, variant });
            }}
          />
          <span
            className={`ml-2 ${
              isYearly ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('pricing.yearly', 'Yearly')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {allPlans.map((plan, index) => (
            <motion.div
              key={index}
              className={`flex flex-col justify-between bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-lg ${
                plan?.isFree ? 'border-2 border-blue-500' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">{plan?.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  {plan?.isFree ? (
                    t('pricing.free', 'Free')
                  ) : (
                    <>
                      ${plan?.price}
                      <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                        {isYearly
                          ? t('pricing.per_year', '/year')
                          : t('pricing.per_month', '/month')}
                      </span>
                    </>
                  )}
                </div>
                <ul className="mb-8 space-y-2">
                  {plan?.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-200">{feature.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className="w-full py-3 mt-4"
                variant={plan?.isFree ? 'default' : 'outline'}
                onClick={() => {
                  if (plan?.isFree) {
                    if (user) {
                      router.push('/dashboard');
                    } else {
                      router.push('/signin/signup');
                    }
                  } else if (plan?.stripePrice) {
                    handleStripeCheckout(plan?.stripePrice);
                  }
                  trackEvent('plan_selected', { plan: plan?.name, isYearly, variant });
                  trackConversion(variant, `plan_selected_${plan?.name?.replace(/\s+/g, '_').toLowerCase()}`);
                }}
                //loading={priceIdLoading === plan?.stripePrice?.id}
              >
                {plan?.isFree
                  ? user
                    ? t('pricing.goto_dashboard')
                    : t('pricing.start_free')
                  : subscription && subscription.prices?.products?.name === plan?.name
                  ? t('pricing.manage_plan')
                  : t('pricing.choose_plan')}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
