// constants/subscriptionPlans.ts
export const SUBSCRIPTION_PLANS = {
  prod_SdTZK3zhdOebgq: {
    name: 'Basic',
    inspection_limit: 5,
  },
  prod_SdTbQUYDuBuCAR: {
    name: 'Standard',
    inspection_limit: 15,
  },
  prod_SdTcVR43BJStOS: {
    name: 'Premium',
    inspection_limit: 30,
  },
  free: {
    name: 'Free',
    inspection_limit: 3,
  },
};

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
