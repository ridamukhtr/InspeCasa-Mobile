import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import CustomHeader from '../../components/CustomHeader';
import ButtonPrimary from '../../components/ButtonPrimary';
import Colors from '../../utilities/constants/colors';
import { hp, wp } from '../../utilities/constants/constant.style';
import { changeRoute } from '../../services/assynsStorage';
import CustomText from '../../components/CustomText';
import CustomTextField from '../../components/CustomTextField';
import globalStyles from '../../utilities/constants/globalStyles';
import { Facebook, Google } from '../../assets/icons';
import useKeyboardVisibility from '../../services/hooks/useKeyboardVisibility';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useAppDispatch } from '../../store/store';
import { setUser } from '../../store/slices/authSlice';
import { useAuthHook, } from '../../services/hooks/useAuthHook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const formikRef = useRef<FormikProps<any>>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isKeyboardVisible } = useKeyboardVisibility();
  const { googleLoading, facebookLoading, signInWithGoogle, handleFacebookLogin } = useAuthHook();

  useEffect(() => {
    const loadLoginInfo = async () => {
      try {
        const storedInfo = await AsyncStorage.getItem('loginInfo');
        if (storedInfo) {
          const { email, password } = JSON.parse(storedInfo);
          formikRef?.current?.setFieldValue('email', email);
          formikRef?.current?.setFieldValue('password', password);
          setRememberMe(true);
        }
      } catch (err) {
        console.log('Error loading login info', err);
      }
    };

    loadLoginInfo();
  }, []);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleLogin = async (values: { email: any; password: any }) => {
    const { email, password } = values;
    if (isLoading) return;

    setIsLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const userId = user?.uid;
      let userData = null;

      try {
        const userDoc = await firestore().collection('Users').doc(userId).get();

        if (userDoc.exists()) {
          userData = userDoc.data();

          if (userData?.createdAt?.toDate) {
            userData.createdAt = userData.createdAt.toDate().toISOString();
          }
          if (userData?.lastLoginAt?.toDate) {
            userData.lastLoginAt = userData.lastLoginAt.toDate().toISOString();
          }
        }
      } catch (firestoreError) {
        console.log('Error fetching user data:', firestoreError);
      }

      const displayName = userData?.fullName || user.displayName || 'User';

      dispatch(setUser({
        uid: userId,
        email: user.email,
        displayName,
        ...userData,
      }));
      if (rememberMe) {
        await AsyncStorage.setItem('loginInfo', JSON.stringify({ email, password }));
      } else {
        await AsyncStorage.removeItem('loginInfo');
      }
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: `Welcome back, ${displayName}!`,
      });
      changeRoute(navigation, 'Tabs', { screen: 'HomeUser' }, true);

    } catch (error: any) {
      console.log('Login Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Invalid email or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={globalStyles.mainAuthContainer}>
      <View style={globalStyles.authContainer}>
        <CustomHeader
          title="Please Login Here!"
          subheading="Login"
          link="Auth"
          text="Enter your email to login"
        />
        <View style={globalStyles.bodyContainer}>
          <ScrollView contentContainerStyle={{ ...(isKeyboardVisible ? { height: hp * 1.3 } : {}) }}
            showsVerticalScrollIndicator={false}
            style={globalStyles.scrollContainer}>
            <Formik
              innerRef={formikRef}
              initialValues={{ email: '', password: '' }}
              onSubmit={handleLogin}
              validationSchema={validationSchema}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.loginFormWrapper}>
                  <CustomTextField
                    label="Email Address"
                    placeholder="Email Address"
                    keyboardType="email-address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    autoCapitalize="none"
                  />
                  {touched.email && typeof errors.email === 'string' && (
                    <CustomText style={globalStyles.errorText}>{errors.email}</CustomText>
                  )}
                  <CustomTextField
                    label="Password"
                    placeholder="Password"
                    secureTextEntry
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                  />
                  {touched.password && typeof errors.password === 'string' && (
                    <CustomText style={globalStyles.errorText}>{errors.password}</CustomText>
                  )}
                  <View style={styles.rememberForgotContainer}>
                    <View style={styles.checkboxRow}>
                      <CheckBox
                        value={rememberMe}
                        onValueChange={setRememberMe}
                        tintColors={{ true: Colors.primary, false: '#aaa' }}
                      />
                      <CustomText style={globalStyles.statusText}>Remember me</CustomText>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => changeRoute(navigation, 'Forget')}>
                      <CustomText style={[globalStyles.statusText, globalStyles.blueText]}>
                        Forgot Password?
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                  <ButtonPrimary text="Login"
                    loading={isLoading}
                    onPress={handleSubmit}
                    btnPrimaryStyle={{ width: wp * 0.9, }}
                  />
                </View>
              )}
            </Formik>
            <CustomText style={[globalStyles.statusText, { textAlign: "center" }]}>or</CustomText>

            <View style={globalStyles.socialLoginButtonWrapper}>
              <TouchableOpacity
                onPress={signInWithGoogle}
                activeOpacity={0.8}
                style={globalStyles.socialButtonWrapper}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Google />
                )}
              </TouchableOpacity>
              {/* <TouchableOpacity
                onPress={handleFacebookLogin}
                activeOpacity={0.8} style={[globalStyles.socialButtonWrapper, { backgroundColor: "#1978ED" }]}>
                {facebookLoading ? (
                  <ActivityIndicator size="small" color={Colors.light} />
                ) : (
                  <Facebook />
                )}
              </TouchableOpacity> */}
            </View>
            <View style={globalStyles.accountNavigationWrapper}>
              <CustomText style={globalStyles.statusText}>
                Don't Have An Account?{' '}
                <CustomText
                  style={[globalStyles.statusText, globalStyles.blueText]}
                  onPress={() => changeRoute(navigation, 'RegisterScreen')}>
                  Register
                </CustomText>
              </CustomText>
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loginFormWrapper: {
    marginTop: wp * 0.056,
    marginBottom: wp * 0.07,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoginScreen;
