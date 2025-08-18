import {
    KeyboardAvoidingView,
    ScrollView,
    View,
} from 'react-native';
import React, { useState } from 'react';
import CustomTextField from '../../components/CustomTextField';
import globalStyles from '../../utilities/constants/globalStyles';
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader';
import CustomText from '../../components/CustomText';
import { IS_IOS, Typography } from '../../utilities/constants/constant.style';
import ButtonPrimary from '../../components/ButtonPrimary';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ChangePassword = () => {
    const [isLoading, setIsLoading] = useState(false);

    // 🔐 Yup validation schema
    const validationSchema = Yup.object().shape({
        currentPassword: Yup.string().required('Current password is required'),
        newPassword: Yup.string()
            .required('New password is required')
            .min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string()
            .required('Please confirm your new password')
            .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
    });


    // 🔁 Handle password update
    const handlePasswordChange = async (values: any, actions: any) => {
        const { currentPassword, newPassword } = values;
        const user = auth().currentUser;

        if (!user || !user.email) return;

        setIsLoading(true); // Start loading here

        if (user.providerData[0]?.providerId === 'google.com') {
            Toast.show({
                type: 'error',
                text1: 'You signed in with Google.',
                text2: 'Change password from your Google Account settings.',
            });
            setIsLoading(false); // stop loading
            return;
        }

        const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await user.reauthenticateWithCredential(credential);
            await user.updatePassword(newPassword);

            Toast.show({
                type: 'success',
                text1: 'Password Updated',
                text2: 'Your password has been changed successfully.',
            });

            actions.resetForm();
        } catch (error: any) {
            console.log('Password update error:', error);
            let message = 'Something went wrong';

            switch (error.code) {
                case 'auth/wrong-password':
                    message = 'Incorrect current password';
                    break;
                case 'auth/weak-password':
                    message = 'New password is too weak';
                    break;
            }

            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: message,
            });
        } finally {
            setIsLoading(false); // stop loading
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={IS_IOS ? 'padding' : 'height'}
        >
            <View style={globalStyles.mainContainer}>
                <HomeProfessionalHeader title="Change Password" backIcon={false} />
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, width: "100%" }}
                    keyboardShouldPersistTaps="always"
                >
                    <View
                        style={[
                            globalStyles.paddingContainer,
                            { justifyContent: 'space-between', flex: 1, paddingBottom: 20 },
                        ]}
                    >
                        <Formik
                            initialValues={{
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handlePasswordChange}
                        >
                            {({
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                values,
                                errors,
                                touched,
                                isSubmitting,
                            }) => (
                                <>
                                    <View>
                                        <CustomText
                                            style={[
                                                globalStyles.statusText,
                                                { fontWeight: 'bold', marginBottom: 5 },
                                            ]}
                                        >
                                            Change Password
                                        </CustomText>
                                        <CustomText style={{ ...Typography.f_14_nunito_regular }}>
                                            Your password must be at least 6 characters and include a combination
                                            of numbers, letters, and special characters (!$@%).
                                        </CustomText>

                                        {/* Current Password */}
                                        <CustomTextField
                                            placeholder="Current Password"
                                            secureTextEntry
                                            value={values.currentPassword}
                                            onChangeText={handleChange('currentPassword')}
                                            onBlur={handleBlur('currentPassword')}
                                        />
                                        {touched.currentPassword && errors.currentPassword && (
                                            <CustomText style={globalStyles.errorText}>{errors.currentPassword}</CustomText>
                                        )}

                                        {/* New Password */}
                                        <CustomTextField
                                            placeholder="New Password"
                                            secureTextEntry
                                            value={values.newPassword}
                                            onChangeText={handleChange('newPassword')}
                                            onBlur={handleBlur('newPassword')}
                                        />
                                        {touched.newPassword && errors.newPassword && (
                                            <CustomText style={globalStyles.errorText}>{errors.newPassword}</CustomText>
                                        )}

                                        {/* Confirm Password */}
                                        <CustomTextField
                                            placeholder="Retype New Password"
                                            secureTextEntry
                                            value={values.confirmPassword}
                                            onChangeText={handleChange('confirmPassword')}
                                            onBlur={handleBlur('confirmPassword')}
                                        />
                                        {touched.confirmPassword && errors.confirmPassword && (
                                            <CustomText style={globalStyles.errorText}>{errors.confirmPassword}</CustomText>
                                        )}

                                        {/* <CustomText
                                            style={[globalStyles.statusText, { marginBottom: 5, color: '#DC2626' }]}
                                        >
                                            Forgotten your password?
                                        </CustomText>
                                        <CustomText
                                            style={[globalStyles.messageTxt, { marginBottom: 5 }]}
                                        >
                                            Log out of other devices. Choose this if someone else used your
                                            account.
                                        </CustomText> */}
                                    </View>

                                    <View style={{ marginTop: 20 }}>
                                        <ButtonPrimary
                                            text="Save" loading={isLoading} onPress={() => {
                                                handleSubmit();
                                            }} />
                                    </View>
                                </>
                            )}
                        </Formik>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};


export default ChangePassword;
