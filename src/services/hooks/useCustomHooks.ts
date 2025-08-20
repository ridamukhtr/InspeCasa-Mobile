import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {setUnreadCount} from '../../store/slices/notificationsSlice';
import firestore from '@react-native-firebase/firestore';
import {PermissionsAndroid, Platform} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY,
  WEB_CLIENT_ID,
} from '../../../env';

export const useFormattedDate = () => {
  const formatDisplayDate = (date: moment.MomentInput): string => {
    return date ? moment(date).format('MM/DD/YYYY') : '';
  };

  return {formatDisplayDate};
};

export const formatFirestoreDate = (timestamp: {
  seconds: number;
  nanoseconds: number;
}): string => {
  if (!timestamp) return '';

  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getRenewalDate = (paymentDate: {
  seconds: number;
  nanoseconds: number;
}): string => {
  if (!paymentDate) return 'Not available';

  const date = new Date(paymentDate.seconds * 1000);
  const renewalDate = new Date(date);
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  return renewalDate;
};

export default function useAgreeTerms() {
  const [agreeTerms, setAgreeTerms] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadInitialAgreement = async () => {
        try {
          const savedValue = await AsyncStorage.getItem('@termsAgreed');
          if (savedValue !== null) {
            setAgreeTerms(JSON.parse(savedValue));
          }
        } catch (error) {
          console.log('Error loading initial agreement status:', error);
        }
      };

      loadInitialAgreement();
    }, []),
  );

  const toggleCheckbox = async () => {
    const newValue = !agreeTerms;
    setAgreeTerms(newValue);
    try {
      await AsyncStorage.setItem('@termsAgreed', JSON.stringify(newValue));
    } catch (error) {
      console.log('Error saving agreement:', error);
      setAgreeTerms(agreeTerms);
    }
  };

  return {
    agreeTerms,
    setAgreeTerms,
    toggleCheckbox,
  };
}

export const useNotificationListener = (userId: string | undefined) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('Users')
      .doc(userId)
      .collection('Notifications')
      .where('isRead', '==', false)
      .onSnapshot(snapshot => {
        if (snapshot) {
          dispatch(setUnreadCount(snapshot.size));
        } else {
          dispatch(setUnreadCount(0));
        }
      });
    return () => unsubscribe();
  }, [userId, dispatch]);
};

export const uploadImageToCloudinary = async (uri: string) => {
  try {
    const cloudName = 'diej7qbfz';
    const uploadPreset = 'InspeCasa';

    // Get the file name from the URI
    const filename = uri.split('/').pop();

    // Get the file type (jpg, png, etc.)
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image';

    // Prepare form data
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'property-inspections/images');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const formatDateOnly = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

export const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]);
      return (
        granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      return (
        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
  }
  return true;
};

export const stripeKeys = {
  secret: STRIPE_SECRET_KEY,
  publishable: STRIPE_PUBLISHABLE_KEY,
  webClientId: WEB_CLIENT_ID,
};
