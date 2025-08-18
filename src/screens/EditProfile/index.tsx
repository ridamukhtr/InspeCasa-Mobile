import { ActivityIndicator, Image, KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomTextField from '../../components/CustomTextField'
import globalStyles from '../../utilities/constants/globalStyles'
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader'
import { Typography, wp } from '../../utilities/constants/constant.style'
import ButtonPrimary from '../../components/ButtonPrimary'
import CountryCodeSelector from '../../components/CountryCodeSelector'
import { Edit } from '../../assets/icons'
import { TouchableOpacity } from 'react-native'
import Colors from '../../utilities/constants/colors'
import { launchImageLibrary } from 'react-native-image-picker'
import Toast from 'react-native-toast-message'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import CustomText from '../../components/CustomText'
import RNFS from 'react-native-fs';

const EditProfile = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [countryCode, setCountryCode] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    console.log("emailedit", email);

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth().currentUser;
            if (!currentUser) return;
            const userId = currentUser.uid;

            const doc = await firestore().collection('Users').doc(userId).get();

            if (doc.exists()) {
                const userData = doc.data();
                setFullName(userData?.fullName || '');
                setEmail(userData?.email || '');
                setCountryCode(userData?.countryCode);
                setSelectedCountryCode(userData?.flagCountryCode || 'PK');

                if (userData?.photo) {
                    setSelectedImage(userData.photo);
                }
                let rawPhone = userData?.phoneNumber || '';
                const countryCode = userData?.countryCode || '';
                if (rawPhone.startsWith(`${countryCode} `)) {
                    rawPhone = rawPhone.replace(`${countryCode} `, '');
                }
                setPhoneNumber(rawPhone);
            }
        };

        fetchUserData();
    }, []);


    const uploadImageToCloudinary = async (imageUri: string) => {
        try {
            const fileBase64 = await RNFS.readFile(imageUri, 'base64');
            const cloudName = 'diej7qbfz';
            const uploadPreset = 'InspeCasa';
            const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

            const formData = new FormData();
            formData.append('file', `data:image/jpeg;base64,${fileBase64}`);
            formData.append('upload_preset', uploadPreset);
            formData.append('cloud_name', cloudName);

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.log('Cloudinary upload error:', error);
            throw error;
        }
    };

    const handleImagePick = async () => {
        setIsImageLoading(true);
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
            if (result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                setSelectedImage(uri);
                return uri;
            }
            return null;
        } catch (error) {
            console.log('Image pick error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to select image',
            });
            return null;
        } finally {
            setIsImageLoading(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setIsLoading(true);

        const currentUser = auth().currentUser;
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        const userId = currentUser.uid;
        let photoUrl = selectedImage;
        if (selectedImage && selectedImage.startsWith('file://')) {
            try {
                const cloudinaryResponse = await uploadImageToCloudinary(selectedImage);

                if (!cloudinaryResponse.secure_url) {
                    throw new Error('No secure_url in Cloudinary response');
                }
                photoUrl = cloudinaryResponse.secure_url;

                // await AsyncStorage.setItem('profileImage', photoUrl);
            } catch (error) {
                console.log('Image upload failed:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Upload Failed',
                    text2: 'Could not upload profile image',
                });
                setIsLoading(false);
                return;
            }
        }

        const updatedData: any = {
            fullName,
            email,
            phoneNumber: `${countryCode} ${phoneNumber}`.trim(),
            countryCode,
            flagCountryCode: selectedCountryCode,
            updatedAt: new Date().toISOString(),
        };

        if (photoUrl) {
            updatedData.photo = photoUrl;
        }

        try {
            await firestore().collection('Users').doc(userId).update(updatedData);
            // Update Firebase Auth profile
            console.log('Updating Auth profile...');
            await currentUser.updateProfile({
                displayName: fullName,
                photoURL: photoUrl || currentUser.photoURL
            });

            console.log('Auth profile updated');

            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Your profile was updated successfully.',
            });
        } catch (error) {
            console.log('Update Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: 'Could not update profile.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
            newErrors.email = 'Invalid email format';
        }
        if (phoneNumber.trim()) {
            const phoneRegex = /^\+?[0-9]{10,15}$/;
            if (!phoneRegex.test(phoneNumber.trim())) {
                newErrors.phone = 'Invalid phone number';
            }
        }
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    return (
        <View style={globalStyles.mainContainer}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <HomeProfessionalHeader title="Edit Profile" backIcon={false} />
                <View style={globalStyles.paddingContainer}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleImagePick}
                        style={styles.imgConatiner}
                    >
                        {isImageLoading ? (
                            <View style={[styles.image, styles.loadingContainer]}>
                                <ActivityIndicator color={Colors.primary} size="large" />
                            </View>
                        ) : (
                            <>

                                {selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage }}
                                        style={styles.image}
                                    />
                                ) : (
                                    <View style={[globalStyles.initialsContainer, {
                                        width: 65,
                                        height: 65,
                                    }]}>
                                        <CustomText style={globalStyles.initialsText}>
                                            {fullName?.charAt(0).toUpperCase()}
                                        </CustomText>
                                    </View>
                                )}
                                <View style={styles.editContainer}>
                                    <Edit />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>

                    <CustomTextField
                        placeholder="Full Name"
                        label="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    {errors.fullName && (
                        <CustomText style={globalStyles.errorText}>{errors.fullName}</CustomText>
                    )}

                    <CustomTextField
                        placeholder="Email Address"
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                    />
                    {errors.email && (
                        <CustomText style={globalStyles.errorText}>{errors.email}</CustomText>
                    )}

                    <CustomTextField
                        label="Phone Number"
                        placeholder="Phone no."
                        left={
                            <CountryCodeSelector
                                flagCountryCode={selectedCountryCode}
                                countryCode={countryCode}
                                onSelectCountryCode={(code, flagCode) => {
                                    setCountryCode(code);
                                    setSelectedCountryCode(flagCode);
                                }}
                            />
                        }
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                    {errors.phone && (
                        <CustomText style={globalStyles.errorText}>{errors.phone}</CustomText>
                    )}
                    <ButtonPrimary
                        text="Save"
                        onPress={handleSave}
                        loading={isLoading}
                        btnPrimaryText={{ ...Typography.f_15_nunito_extra_bold }}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default EditProfile

const styles = StyleSheet.create({
    editContainer: { alignSelf: "flex-end", right: wp * 0.04, backgroundColor: Colors.grayLight },
    imgConatiner: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: wp * 0.06 },
    image: {
        width: 70,
        height: 70,
        borderRadius: 150 / 1
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.grayLight,
    }
})