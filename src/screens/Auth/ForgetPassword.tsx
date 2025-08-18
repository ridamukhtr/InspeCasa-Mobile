import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomHeader from '../../components/CustomHeader';
import ButtonPrimary from '../../components/ButtonPrimary';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../utilities/constants/colors';
import { Typography, wp } from '../../utilities/constants/constant.style';
import CustomText from '../../components/CustomText';
import CustomTextField from '../../components/CustomTextField';
import globalStyles from '../../utilities/constants/globalStyles';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgetPassword = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [email, setEmail] = useState('');
  const formikRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showDrawer && formikRef.current) {
      formikRef.current.setFieldValue('email', '');
      formikRef.current.setTouched({ email: false });
      formikRef.current.setErrors({ email: '' });
    }
  }, [showDrawer]);


  const handleSendReset = async (values: { email: string }) => {
    if (values.email) {
      await forgotPassword(values.email);
    }
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const userSnapshot = await firestore()
        .collection('Users')
        .where('email', '==', email)
        .get();

      if (userSnapshot.empty) {
        Toast.show({
          type: 'error',
          text1: 'No account found with this email',
          text2: 'Sign up to continue.',
        });
        return;
      }

      await auth().sendPasswordResetEmail(email);
      setShowDrawer(true);
      setEmail('');
    } catch (error: any) {
      console.log("error", error);

      Toast.show({
        type: 'error',
        text1: error.message || 'Something went wrong. Try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.mainAuthContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={globalStyles.authContainer}>
        <CustomHeader
          title={'Please Login Here!'}
          link={'Auth'}
          subheading="Login"
          text="Enter the email address you registered below to reset your password."
        />
        <View style={globalStyles.bodyContainer}>
          <Formik
            innerRef={formikRef}
            initialValues={{ email: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSendReset}>
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              errors,
              touched,
            }) => (
              <View style={styles.buttonContainer}>
                <View >
                  <CustomTextField
                    label='Email Address'
                    placeholder="john@doe.com"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && touched.email && (
                    <CustomText style={globalStyles.errorText}>{errors.email}</CustomText>
                  )}
                </View>
                <ButtonPrimary
                  text="Send Reset Instruction"
                  onPress={handleSubmit}
                  loading={loading}
                  btnPrimaryStyle={{ width: wp * 0.9, }}
                />
                {showDrawer && (
                  <CustomText style={styles.resetText}>Reset email sent!</CustomText>
                )}

              </View>
            )}
          </Formik>


        </View>

        <Modal
          visible={showDrawer}
          animationType="slide"
          transparent={true}
          onRequestClose={closeDrawer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={0.8}
            onPressOut={closeDrawer}>
            <View style={styles.drawerContent}>
              <View style={styles.checkContainer}>
                <FontAwesome
                  name="check"
                  size={40}
                  color={Colors.primary}
                />
              </View>
              <CustomText style={styles.drawerText}>
                Reset link has been sent to your email
              </CustomText>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={closeDrawer}
                activeOpacity={0.8}>
                <CustomText style={styles.doneButtonText}>Done</CustomText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({

  buttonContainer: {
    flex: 1,
    paddingVertical: wp * 0.07
  },
  resetText: {
    color: Colors.primary,
    marginBottom: 20,
    ...Typography.f_18_nunito_semi_bold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerContent: {
    backgroundColor: Colors.primary,
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingBottom: 30,
  },
  drawerHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: 25,
  },
  checkContainer: {
    backgroundColor: Colors.light,
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    marginBottom: 20,
  },
  drawerText: {
    color: Colors.light,
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
    ...Typography.f_14_nunito_regular,
  },
  doneButton: {
    backgroundColor: Colors.light,
    paddingVertical: 15,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    ...Typography.f_15_nunito_extra_bold,
  },
});

export default ForgetPassword;
