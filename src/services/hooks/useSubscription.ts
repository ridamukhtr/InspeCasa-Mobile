import {useState, useEffect, useCallback} from 'react';
import {Alert, AppState, Linking} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {RootState} from '../../types/types';
import {SUBSCRIPTION_PLANS, SubscriptionPlan} from '../../data/Subscription';
import {stripeKeys} from './useCustomHooks';

const STRIPE_SECRET_KEY = stripeKeys.secret;

export const useSubscription = () => {
  const navigation = useNavigation();
  const userId = useSelector((state: RootState) => state?.auth?.user?.userId);
  const user = useSelector((state: RootState) => state?.auth?.user);
  console.log('user', user);

  const userMail = useSelector((state: RootState) => state?.auth?.user?.email);

  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const getPlanPrice = (product: any) => {
    const priceObj = product?.prices?.[0];
    return priceObj?.unit_amount || 0;
  };

  const isPlanExpired = (subscription: any) => {
    const currentTime = Date.now() / 1000;
    return subscription?.current_period_end < currentTime;
  };
  useFocusEffect(
    useCallback(() => {
      // Check subscription when screen comes into focus
      const unsubscribe = navigation.addListener('focus', () => {
        if (userMail) {
          setRefreshing(true);
          checkIfSubscribed(userMail);
        }
        setRefreshing(false);
      });

      return unsubscribe;
    }, [navigation, userMail]),
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse = await fetch(
          'https://api.stripe.com/v1/products',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

        const {data: products} = await productsResponse.json();

        const productsWithPrices = await Promise.all(
          products.map(async (product: {id: any}) => {
            const pricesResponse = await fetch(
              `https://api.stripe.com/v1/prices?product=${product.id}`,
              {
                headers: {
                  Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
                },
              },
            );
            const {data: prices} = await pricesResponse.json();
            return {...product, prices};
          }),
        );

        setProducts(productsWithPrices);
        if (productsWithPrices.length > 0) {
          setSelectedProduct(productsWithPrices[0]);
        }

        // Check subscription status if user email exists
        if (userMail) {
          const subscribed = await checkIfSubscribed(userMail);
          setIsSubscribed(subscribed);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load data');
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userMail]);

  useFocusEffect(
    useCallback(() => {
      const fetchDataAndCheckSubscription = async () => {
        try {
          setLoading(true);

          // Fetch products if not already loaded
          if (products.length === 0) {
            const productsResponse = await fetch(
              'https://api.stripe.com/v1/products',
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              },
            );
            const {data: products} = await productsResponse.json();
            setProducts(products);
          }

          // Always check subscription status when screen comes into focus
          if (userMail) {
            await checkIfSubscribed(userMail);
          }
        } catch (error) {
          console.error('Error during refresh:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDataAndCheckSubscription();
    }, [userMail]), // Add other dependencies if needed
  );
  const updateUserSubscription = async (subscriptionData: any) => {
    try {
      if (!userId) return;

      const userRef = firestore().collection('Users').doc(userId);
      const currentData = (await userRef.get()).data()?.activeSubscription;
      const planType = subscriptionData.plan?.product || 'unknown';

      // Get the plan details based on the Stripe product ID
      const planDetails =
        SUBSCRIPTION_PLANS[planType] || SUBSCRIPTION_PLANS.basic;

      if (
        currentData?.subscription_status !== subscriptionData.status ||
        currentData?.subscription_type !== planType
      ) {
        const subscriptionInfo = {
          subscription_type: planType,
          subscription_status: subscriptionData.status || 'inactive',
          subscription_payment_status: subscriptionData.status || 'inactive',
          subscription_payment_date: firestore.Timestamp.fromDate(new Date()),
          subscription_payment_amount: subscriptionData.plan?.amount
            ? subscriptionData.plan.amount / 100
            : planDetails.price,
          ...(subscriptionData.current_period_start && {
            subscription_start_date: firestore.Timestamp.fromDate(
              new Date(subscriptionData.current_period_start * 1000),
            ),
          }),
          ...(subscriptionData.current_period_end && {
            subscription_end_date: firestore.Timestamp.fromDate(
              new Date(subscriptionData.current_period_end * 1000),
            ),
          }),
        };

        // Update both subscription info and features
        await userRef.update({
          activeSubscription: subscriptionInfo,
          features: {
            inspection_count: 0, // Reset count on subscription change
            inspection_count_limit: planDetails.inspection_limit,
          },
        });
        console.log('Subscription status updated in Firestore');
      }
    } catch (error) {
      console.log('Error updating subscription:', error);
      Toast.show({
        text1: 'Failed to update subscription',
      });
    }
  };

  const checkIfSubscribed = async (userMail: string): Promise<boolean> => {
    try {
      setLoading(true);
      const customerResponse = await fetch(
        `https://api.stripe.com/v1/customers?email=${userMail}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const customerData = await customerResponse.json();
      const customer = customerData.data?.[0];

      if (!customer) {
        console.log('No customer found with this email.');
        setIsSubscribed(false);
        setSubscriptionData(null);
        return false;
      }

      const customerId = customer.id;
      const subscriptionResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions?customer=${customerId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const subscriptionData = await subscriptionResponse.json();
      const activeSubscription = subscriptionData.data?.find(
        (sub: any) => sub.status === 'active',
      );

      if (activeSubscription) {
        const isExpired = isPlanExpired(activeSubscription);

        if (isExpired) {
          setIsSubscribed(false);
          setSubscriptionData(null);
          await updateUserSubscription({
            status: 'expired',
            plan: activeSubscription.plan,
          });
          Toast.show({
            text1: 'Your subscription has expired',
          });
          return false;
        } else {
          // Active subscription
          setSubscriptionData(activeSubscription);
          setIsSubscribed(true);
          await updateUserSubscription(activeSubscription);
          return true;
        }
      }

      console.log('No active subscriptions found.');
      setIsSubscribed(false);
      setSubscriptionData(null);
      return false;
    } catch (error) {
      console.log('Stripe error:', error);
      Toast.show({
        text1: 'Failed to check subscription status',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (
      !selectedProduct ||
      !selectedProduct.prices ||
      selectedProduct.prices.length === 0
    ) {
      Alert.alert('Error', 'No price available for this product');
      return;
    }

    // If user is subscribed, show confirmation modal
    if (isSubscribed) {
      const selectedPrice = getPlanPrice(selectedProduct);
      const activePlanProductId = subscriptionData?.plan?.product;

      if (!activePlanProductId) {
        Alert.alert('Error', 'Could not determine current subscription');
        return;
      }

      const activeProduct = products.find(p => p.id === activePlanProductId);
      const activePrice = getPlanPrice(activeProduct);

      if (selectedPrice > activePrice) {
        setModalMessage(
          `Are you sure you want to upgrade from ${activeProduct?.name} to ${selectedProduct.name}?`,
        );
      } else if (selectedPrice < activePrice) {
        setModalMessage(
          `Are you sure you want to downgrade from ${activeProduct?.name} to ${selectedProduct.name}?`,
        );
      } else {
        setModalMessage(
          `Are you sure you want to change to ${selectedProduct.name}?`,
        );
      }

      setShowConfirmationModal(true);
      return;
    }

    proceedToCheckout();
  };

  const proceedToCheckout = async () => {
    const productToCheckoutUrl = {
      Basic: 'https://buy.stripe.com/test_00wfZa0WjbgOfDw02F08g02',
      Standard: 'https://buy.stripe.com/test_7sY00c7kHgB8bng6r308g01',
      Premium: 'https://buy.stripe.com/test_6oU00cfRd5Wudvo9Df08g00',
    };

    // const checkoutUrl = productToCheckoutUrl[selectedProduct.name];
    const url = productToCheckoutUrl[selectedProduct.name];

    if (url) {
      const fullUrl =
        url + `?prefilled_email=${userMail || 'user@example.com'}`;
      setCheckoutUrl(fullUrl);
      setShowWebView(true);
    } else {
      Alert.alert('Error', 'Payment link not available for this product');
    }
  };
  const handleConfirmPlanChange = () => {
    setShowConfirmationModal(false);
    proceedToCheckout();
  };

  const handleCancelPlanChange = () => {
    setShowConfirmationModal(false);
  };

  const isCurrentPlan =
    subscriptionData?.plan?.product &&
    selectedProduct?.id &&
    subscriptionData?.plan.product === selectedProduct?.id;

  const getButtonLabel = () => {
    if (loading) return 'Loading...';

    if (
      !isSubscribed ||
      !subscriptionData ||
      subscriptionData.status === 'expired' ||
      isPlanExpired(subscriptionData)
    ) {
      return 'Subscribe';
    }

    if (isCurrentPlan) {
      return 'Active';
    }

    const selectedPrice = getPlanPrice(selectedProduct);
    const activePlanProductId = subscriptionData.plan.product;

    const activeProduct = products.find(p => p.id === activePlanProductId);
    const activePrice = getPlanPrice(activeProduct);

    if (selectedPrice > activePrice) {
      return 'Upgrade';
    } else if (selectedPrice < activePrice) {
      return 'Downgrade';
    } else {
      return 'Change Plan';
    }
  };
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await checkIfSubscribed(userMail);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [userMail, checkIfSubscribed]);

  return {
    loading,
    refreshing,
    products,
    selectedProduct,
    isSubscribed,
    subscriptionData,
    showConfirmationModal,
    modalMessage,
    showWebView,
    checkoutUrl,

    setShowWebView,
    setSelectedProduct,
    handlePayment,
    handleConfirmPlanChange,
    handleCancelPlanChange,
    getButtonLabel,
    handleRefresh,
  };
};
