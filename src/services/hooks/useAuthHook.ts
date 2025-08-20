import {useEffect, useState} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {useNavigation} from '@react-navigation/native';
import {changeRoute} from '../assynsStorage';
import {setCredentials} from '../../store/slices/authSlice';
import {useDispatch} from 'react-redux';
import {AccessToken, LoginManager} from 'react-native-fbsdk-next';
import {SUBSCRIPTION_PLANS} from '../../data/Subscription';
import {stripeKeys} from './useCustomHooks';

export const useAuthHook = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [facebookLoading, setFacebookLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: stripeKeys.webClientId,
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      const firebaseUser = signInResult.data?.user;
      console.log('userData', signInResult.data);

      if (!idToken || !firebaseUser) {
        throw {code: 'auth/cancelled'};
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const userId = userCredential.user.uid;
      console.log('user credentials', userCredential);

      // Update Firebase Auth profile
      await userCredential.user.updateProfile({
        displayName: firebaseUser.name,
        photoURL: firebaseUser.photo || '',
      });

      const userDocRef = firestore().collection('Users').doc(userId);
      const userSnapshot = await userDocRef.get();

      // Check if this is a new user using additionalUserInfo
      const isNewUser = userCredential.additionalUserInfo?.isNewUser;
      let userDoc;

      if (isNewUser || !userSnapshot.exists) {
        // New user - create complete document with default values
        userDoc = {
          fullName: firebaseUser.name,
          email: firebaseUser.email,
          photo: firebaseUser.photo || '',
          userId,
          Role: 'inspector',
          activeStatus: 'active',
          phoneNumber: '',
          countryCode: '',
          flagCountryCode: '',
          activeSubscription: {
            subscription_type: '',
            subscription_start_date: '',
            subscription_end_date: '',
            subscription_status: 'inactive',
            subscription_payment_status: 'unpaid',
            subscription_payment_date: '',
            subscription_payment_amount: 0,
          },
          features: {
            inspection_count: 0,
            inspection_count_limit: SUBSCRIPTION_PLANS.free.inspection_limit,
          },
          createdAt: firestore.FieldValue.serverTimestamp(),
        };
        await userDocRef.set(userDoc);
      } else {
        // Existing user - only update basic profile info, keep existing data
        const existingData = userSnapshot.data();

        // Only update basic profile information that might change
        const updatedProfileData = {
          fullName: firebaseUser.name,
          email: firebaseUser.email,
          photo: firebaseUser.photo || '',
          ...existingData,
        };

        await userDocRef.set(updatedProfileData, {merge: true});
        userDoc = existingData;
      }

      const token = await userCredential.user.getIdToken();

      dispatch(
        setCredentials({
          user: userDoc,
          token,
        }),
      );

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: `Welcome, ${firebaseUser.name}!`,
      });

      changeRoute(navigation, 'Tabs', {screen: 'HomeUser'}, true);
    } catch (error) {
      console.log('Google Sign-In Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Google Login Failed',
        text2: error.message || 'Something went wrong during sign-in',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setFacebookLoading(true);
      await LoginManager.logOut();

      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        console.log('User cancelled Facebook login');
        return;
      }

      const tokenData = await AccessToken.getCurrentAccessToken();
      if (!tokenData) {
        Toast.show({
          type: 'error',
          text1: 'Facebook Login Failed',
          text2: 'Unable to get access token.',
        });
        return;
      }

      const facebookCredential = auth.FacebookAuthProvider.credential(
        tokenData.accessToken,
      );

      const userCredential = await auth().signInWithCredential(
        facebookCredential,
      );
      const userId = userCredential.user.uid;
      const {email, displayName, photoURL} = userCredential.user;

      console.log('user credentials', userCredential);

      // Update Firebase Auth profile
      await userCredential.user.updateProfile({
        displayName: displayName || '',
        photoURL: photoURL || '',
      });

      const userDocRef = firestore().collection('Users').doc(userId);
      const userSnapshot = await userDocRef.get();

      // Check if this is a new user using additionalUserInfo
      const isNewUser = userCredential.additionalUserInfo?.isNewUser;
      console.log('isNewUser:', isNewUser);

      let userDoc;

      if (isNewUser || !userSnapshot.exists) {
        // New user - create complete document with default values
        userDoc = {
          fullName: displayName || '',
          email: email || '',
          photo: photoURL || '',
          userId,
          Role: 'inspector',
          activeStatus: 'active',
          phoneNumber: '',
          countryCode: '',
          flagCountryCode: '',
          activeSubscription: {
            subscription_type: '',
            subscription_start_date: '',
            subscription_end_date: '',
            subscription_status: 'inactive',
            subscription_payment_status: 'unpaid',
            subscription_payment_date: '',
            subscription_payment_amount: 0,
          },
          features: {
            inspection_count: 0,
            inspection_count_limit: SUBSCRIPTION_PLANS.free.inspection_limit,
          },
          createdAt: firestore.FieldValue.serverTimestamp(),
        };
        await userDocRef.set(userDoc);
      } else {
        // Existing user - only update basic profile info, keep existing data
        const existingData = userSnapshot.data();

        // Only update basic profile information that might change
        const updatedProfileData = {
          fullName: displayName || existingData?.fullName || '',
          email: email || existingData?.email || '',
          photo: photoURL || existingData?.photo || '',
        };

        console.log('Updating existing user with profile data only');
        await userDocRef.set(updatedProfileData, {merge: true});

        // Use existing data for the rest of the fields
        userDoc = {
          ...existingData,
          ...updatedProfileData,
        };
      }

      const token = await userCredential.user.getIdToken();

      dispatch(
        setCredentials({
          user: userDoc,
          token,
        }),
      );

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: displayName ? `Welcome, ${displayName}!` : 'Welcome!',
      });

      changeRoute(navigation, 'Tabs', {screen: 'HomeUser'}, true);
    } catch (error: any) {
      console.log('Facebook Login Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Facebook Login Failed',
        text2: error.message || 'Something went wrong during sign-in',
      });
    } finally {
      setFacebookLoading(false);
    }
  };

  return {
    googleLoading,
    facebookLoading,
    handleFacebookLogin,
    signInWithGoogle,
  };
};

export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};
