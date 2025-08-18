import React, { useEffect } from 'react';
import { Image, Platform, StatusBar, StyleSheet, View } from 'react-native';
import Colors from '../../utilities/constants/colors';
import { SplashProps } from '../../types/types';
import { changeRoute } from '../../services/assynsStorage';
import { useAppSelector } from '../../store/store';
import { setCredentials } from '../../store/slices/authSlice';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import { SplashLogo } from '../../assets/icons';
import { isAndroidLatestVersion } from '../../utilities/constants/constant.style';

const Splash: React.FC<SplashProps> = ({ navigation }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 100);
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userId = firebaseUser.uid;
        const userDoc = await firestore().collection('Users').doc(userId).get();

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const token = await firebaseUser.getIdToken();

          dispatch(setCredentials({ user: userData, token }));

          changeRoute(navigation, 'Tabs', {}, true);
        } else {
          changeRoute(navigation, 'Inspection', {}, true);
        }
      } else {
        changeRoute(navigation, 'Inspection', {}, true);
      }

    });

    return () => unsubscribe();
  }, [dispatch, navigation]);

  return (
    <View style={styles.background}>


      <View style={styles.overlay}>
        <StatusBar backgroundColor={Colors.primary} translucent={false} barStyle="light-content" />
        <SplashLogo />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Splash;
