import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator, } from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import CheckBox from '@react-native-community/checkbox';
import ButtonPrimary from '../../components/ButtonPrimary';
import Colors from '../../utilities/constants/colors';
import { IS_IOS, Typography, wp } from '../../utilities/constants/constant.style';
import { Formik } from 'formik';
import * as Yup from 'yup';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../../utilities/constants/globalStyles';
import CustomTextField from '../../components/CustomTextField';
import CountryCodeSelector from '../../components/CountryCodeSelector';
import CustomText from '../../components/CustomText';
import { Facebook, Google } from '../../assets/icons';
import { changeRoute } from '../../services/assynsStorage';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import { setCredentials, } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../store/store';
import useAgreeTerms from '../../services/hooks/useCustomHooks';
import { useAuthHook } from '../../services/hooks/useAuthHook';
import { CountryCode } from 'react-native-country-picker-modal';
import { SUBSCRIPTION_PLANS } from '../../data/Subscription';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [callingCode, setCallingCode] = useState('92');
  const [flagCountryCode, setFlagCountryCode] = useState<CountryCode>('PK');
  const [isLoading, setIsLoading] = useState(false);

  const { agreeTerms, toggleCheckbox } = useAgreeTerms();
  const { googleLoading, facebookLoading, signInWithGoogle, handleFacebookLogin } = useAuthHook();

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm Password is required'),
    phone: Yup.string()
      .matches(/^\d+$/, 'Phone number must contain only digits')
      .required('Phone number is required'),
  });

  const handleRegister = async (values: {
    confirmPassword: string | undefined;
    fullName: string;
    email: string;
    password: string;
    phone: string;
    Role: string,
    activeStatus: 'moderate' | 'active' | 'decline';
  }) => {
    if (!agreeTerms) {
      Toast.show({
        type: 'error',
        text1: 'Terms & Conditions',
        text2: 'You must agree to the Terms & Conditions',
      });
      return;
    }
    const { fullName, email, password, phone, Role, activeStatus } = values;
    if (isLoading) return;

    setIsLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      await userCredential.user.updateProfile({
        displayName: fullName,
      });

      const formattedPhone = `+${callingCode} ${phone}`;

      const userDoc = {
        fullName,
        email,
        countryCode: callingCode,
        flagCountryCode,
        phoneNumber: formattedPhone,
        photo: '',
        userId,
        Role,
        activeStatus,
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
        createdAt: new Date().toISOString(),
      };

      await firestore().collection('Users').doc(userId).set(userDoc);

      const token = await userCredential.user.getIdToken();

      dispatch(setCredentials({
        user: userDoc,
        token,
      }));

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: `Welcome, ${fullName}!`,
      });

      changeRoute(navigation, 'Tabs', { screen: 'HomeUser' }, true);

    } catch (error: any) {
      console.log('Registration Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'Invalid email or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the country code handler
  const handleCountryCodeSelect = (code: string, flagCode: string) => {
    setCallingCode(code);
    setFlagCountryCode(flagCode as CountryCode);
  };

  return (

    <KeyboardAvoidingView
      behavior={IS_IOS ? 'padding' : 'height'}
      style={globalStyles.mainAuthContainer}>
      <View style={globalStyles.authContainer}>
        <CustomHeader
          title="Create Your Account!"
          subheading="Sign Up"
          // link="Auth"
          text="Safe, secure & simple signup process."
        />
        <View style={globalStyles.bodyContainer}>
          <ScrollView
            style={globalStyles.scrollContainer}
            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}>
            <Formik
              initialValues={{
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                countryCode: '+92',
                Role: 'inspector',
                activeStatus: 'moderate'
              }}

              validationSchema={validationSchema}
              onSubmit={handleRegister}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.formWrapper}>
                  <CustomTextField
                    label="Full Name"
                    placeholder="Full Name"
                    value={values.fullName}
                    onChangeText={handleChange('fullName')}
                    onBlur={handleBlur('fullName')}
                    keyboardType="default"
                  />
                  {touched.fullName && errors.fullName && (
                    <CustomText style={globalStyles.errorText}>{errors.fullName}</CustomText>
                  )}
                  <CustomTextField
                    label="Email Address"
                    placeholder="Email Address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && (
                    <CustomText style={globalStyles.errorText}>{errors.email}</CustomText>
                  )}
                  <CustomTextField
                    label="Password"
                    placeholder="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry
                  />
                  {touched.password && errors.password && (
                    <CustomText style={globalStyles.errorText}>{errors.password}</CustomText>
                  )}
                  <CustomTextField
                    label="Confirm Password"
                    placeholder="Confirm Password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    secureTextEntry
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <CustomText style={globalStyles.errorText}>{errors.confirmPassword}</CustomText>
                  )}
                  <CustomTextField
                    label="Phone Number"
                    placeholder="Phone no."
                    left={
                      <CountryCodeSelector
                        countryCode={callingCode}
                        flagCountryCode={flagCountryCode}
                        onSelectCountryCode={handleCountryCodeSelect}
                      />
                    }
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    keyboardType="phone-pad"
                  />

                  {touched.phone && errors.phone && (
                    <CustomText style={globalStyles.errorText}>{errors.phone}</CustomText>
                  )}

                  <View style={styles.checkboxWrapper}>
                    <CheckBox
                      value={agreeTerms}
                      onValueChange={toggleCheckbox}
                      tintColors={{ true: '#008080', false: '#aaa' }}
                    />
                    <CustomText style={globalStyles.checkBoxText}>
                      {`I have read and agree to the `}
                    </CustomText>
                    <TouchableOpacity onPress={() => changeRoute(navigation, 'TermsAndCondition')}>
                      <CustomText style={globalStyles.blueText}>
                        Terms & Conditions.
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                  <ButtonPrimary btnPrimaryStyle={{ width: wp * 0.9, }}
                    text="Register" loading={isLoading} onPress={() => {
                      handleSubmit();
                    }} />
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
              <TouchableOpacity onPress={handleFacebookLogin} activeOpacity={0.8} style={[globalStyles.socialButtonWrapper, { backgroundColor: "#1978ED" }]}>
                {facebookLoading ? (
                  <ActivityIndicator size="small" color={Colors.light} />
                ) : (
                  <Facebook />
                )}
              </TouchableOpacity>
            </View>
            <View style={globalStyles.accountNavigationWrapper}>
              <CustomText style={globalStyles.statusText}>
                Already Have An Account?{' '}
                <CustomText
                  style={[globalStyles.statusText, globalStyles.blueText]}
                  onPress={() => changeRoute(navigation, 'Login')}>
                  Login
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
  screenWrapper: {
    flex: 1,
    backgroundColor: Colors.light,
  },

  formWrapper: {
    marginTop: wp * 0.056,
    marginBottom: wp * 0.07,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp * 0.04,
  },
  accountLink: {
    ...Typography.f_16_nunito_medium,
    textDecorationLine: "underline"
  },

});

export default RegisterScreen;
