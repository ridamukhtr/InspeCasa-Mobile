import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Alert,
    Linking,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../utilities/constants/colors';
import { hp, Typography, wp } from '../utilities/constants/constant.style';
import CustomText from './CustomText';
import globalStyles from '../utilities/constants/globalStyles';
import { Camera, Check, Clean, Dirty, FilledClean, FilledDamaged, FilledDirty, FilledFair, FilledMarked, FilledStar, HomeDamage, Marked, Notes, Star } from '../assets/icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { changeRoute } from '../services/assynsStorage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CustomTextField from './CustomTextField';
import ButtonPrimary from './ButtonPrimary';
import { ConditionOption, Props } from '../types/types';
import Toast from 'react-native-toast-message';
import { uploadImageToCloudinary } from '../services/hooks/useCustomHooks';

const conditions = [
    { id: 'good', label: 'Good', },
    { id: 'fair', label: 'Fair', },
    { id: 'clean', label: 'Clean', },
    { id: 'marked', label: 'Marked', },
    { id: 'dirty', label: 'Dirty', },
    { id: 'camera', label: '', },
    { id: 'damaged', label: 'Dam..ed', },
    { id: 'notes', label: '', },
];

const InspectionReport: React.FC<Props> = ({
    statusSection = false,
    ConditionRating = true,
    statusKey,
    comment,
    status,
    onPress,
    disable = false,
    isSubmit = true,
    reportImages = [],
    isReportView = false
}) => {

    const navigation = useNavigation();
    const [commentText, setCommentText] = useState(comment || '');
    const [selectedId, setSelectedId] = useState(status || null);

    const [images, setImages] = useState<(string | null)[]>(() => {
        if (isReportView || (reportImages && reportImages.length > 0)) {
            const filledImages = [...reportImages];
            while (filledImages.length < 4) filledImages.push(null);
            return filledImages.slice(0, 4);
        }
        return [null, null, null, null];
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (reportImages && reportImages.length > 0) {
            const filledImages = [...reportImages];
            while (filledImages.length < 4) filledImages.push(null);
            setImages(filledImages.slice(0, 4));
        }
    }, [reportImages]);
    const handlePress = (item: ConditionOption) => {
        if (isReportView) return;

        if (item.id === 'camera') {
            openCamera((capturedUri) => {
                setImages(prevImages => {
                    const firstEmptyIndex = prevImages.findIndex(img => img === null);
                    const targetIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
                    const newImages = [...prevImages];
                    newImages[targetIndex] = capturedUri;
                    return newImages;
                });
            });
        } else if (item.id === 'notes') {
            navigateToSupport();
        } else {
            setSelectedId(item.id);
        }
    };
    const uploadImages = async (imageUris: (string | null)[]) => {
        const uploadPromises = imageUris
            .filter(uri => uri !== null)
            .map(uri => uploadImageToCloudinary(uri!));

        try {
            const uploadedUrls = await Promise.all(uploadPromises);
            return uploadedUrls;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            // Upload images first
            const imageUrls = await uploadImages(images);

            const inspectionData = {
                comment: commentText,
                inspection_status: selectedId,
                images: imageUrls
            };

            if (onPress) {
                onPress(inspectionData);
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to upload images',
            });
        } finally {
            setLoading(false);
        }
    };

    const showAlert = () => {
        Alert.alert(
            'Camera Permission Needed',
            'Please allow Camera Permission for scanning.',
            [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => {
                        Linking.openSettings();
                    },
                },
            ],
            { cancelable: false },
        );
    };

    const navigateToSupport = () => {
        changeRoute(navigation, 'Support', {}, false);
    };

    const pickImage = async (index: number) => {
        const handleImageSelection = async () => {
            try {
                const result = await launchImageLibrary({
                    mediaType: 'photo',
                    quality: 0.8,
                    includeBase64: false,
                });

                if (result?.assets && result.assets[0].uri) {
                    const newImages = [...images];
                    newImages[index] = result.assets[0].uri;
                    setImages(newImages);
                }
            } catch (error) {
                console.error('Image selection error:', error);
            }
        };

        if (Platform.OS === 'ios') {
            const result = await request(PERMISSIONS.IOS.CAMERA);
            if (result === RESULTS.GRANTED) {
                await handleImageSelection();
            } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
                showAlert();
            }
        } else {
            const result = await request(PERMISSIONS.ANDROID.CAMERA);
            if (result === RESULTS.GRANTED) {
                await handleImageSelection();
            } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
                showAlert();
            }
        }
    };
    const openCamera = (onSuccess: { (capturedUri: any): void; (arg0: string | undefined): void; }) => {
        const handleLaunchCamera = () => {
            launchCamera(
                {
                    mediaType: 'photo',
                    cameraType: 'back',
                },
                response => {
                    if (response.didCancel) return;
                    if (response.errorCode) {
                        console.log('Camera Error: ', response.errorMessage);
                        return;
                    }

                    if (response.assets && response.assets.length > 0) {
                        const uri = response.assets[0].uri;
                        onSuccess(uri);
                    } else {
                        console.log('No image asset found in response');
                    }
                }
            );
        };

        const requestPermission = Platform.OS === 'ios'
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;

        request(requestPermission).then(result => {
            if (result === RESULTS.GRANTED) {
                handleLaunchCamera();
            } else if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
                showAlert();
            }
        });
    };
    const displayImages = isReportView
        ? (reportImages || []).slice(0, 4)
        : images;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.container}>
                {/* Status Section */}
                {statusSection && <View style={styles.statusSection}>
                    <View style={globalStyles.statusContainer}>
                        <View style={globalStyles.statusIcon}>
                            <Icon name="check" size={16} color={Colors.light} />
                        </View>
                        <CustomText style={globalStyles.statusText}>{statusKey}</CustomText>
                    </View>
                </View>}
                {ConditionRating && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                        {conditions
                            .filter(item => !isReportView || (item.id !== 'camera' && item.id !== 'notes'))
                            .map((item) => {
                                const isSelected = selectedId === item.id;
                                const isSpecial = item.id === 'camera' || item.id === 'notes';
                                const isBorderless = item.id === 'camera' || item.id === 'notes';

                                return (
                                    <View key={item.id} style={styles.iconMainContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.iconContainer,
                                                isBorderless && {
                                                    borderWidth: 0,
                                                    borderRadius: 0,
                                                },
                                                isSelected && !isSpecial && {
                                                    borderColor: Colors.primary,
                                                    borderWidth: 1.5,
                                                },
                                            ]}
                                            onPress={() => handlePress(item)}
                                        >
                                            {isSelected ? (
                                                <>
                                                    {item.id === "good" && <FilledStar />}
                                                    {item.id === "fair" && <FilledFair />}
                                                    {item.id === "clean" && <FilledClean />}
                                                    {item.id === "marked" && <FilledMarked />}
                                                    {item.id === "dirty" && <FilledDirty />}
                                                    {item.id === "damaged" && <FilledDamaged />}
                                                </>
                                            ) : (
                                                <>
                                                    {item.id === "good" && <Star />}
                                                    {item.id === "fair" && <Check />}
                                                    {item.id === "clean" && <Clean />}
                                                    {item.id === "marked" && <Marked />}
                                                    {item.id === "dirty" && <Dirty />}
                                                    {item.id === "damaged" && <HomeDamage />}
                                                </>
                                            )}

                                            {item.id === "camera" && <Camera />}
                                            {item.id === "notes" && <Notes />}
                                        </TouchableOpacity>
                                        {item.label !== "" && (
                                            <CustomText>{item.label}</CustomText>
                                        )}
                                    </View>
                                );
                            })}
                    </View>
                )}

                {/* Comments Section */}
                <View style={{ marginTop: wp * 0.04, paddingHorizontal: wp * 0.03, }}>
                    <CustomText style={styles.sectionTitle}>Comments:</CustomText>
                    <View  >
                        <CustomTextField
                            value={commentText}
                            onChangeText={(text) => setCommentText(text)}
                            style={styles.commentText}
                            placeholder="Write Comments here"
                            editable={!disable}
                            multiline={true}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Photos Section */}
                <View style={styles.section}>
                    <CustomText style={styles.sectionTitle}>Photos:</CustomText>
                    {isReportView && displayImages.length === 0 ? (
                        <View style={styles.noPhotosContainer}>
                            <Ionicon name="images" size={24} color="#999" />
                            <CustomText style={styles.noPhotosText}>
                                No photos added
                            </CustomText>
                        </View>
                    ) : (
                        <View style={styles.photosContainer}>
                            {displayImages.map((img, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.addPhotoButton}
                                        onPress={isReportView ? undefined : () => pickImage(index)}
                                        activeOpacity={isReportView ? 1 : 0.7}
                                    >
                                        {img ? (
                                            <Image
                                                source={{ uri: img }}
                                                style={{ width: '100%', height: '100%', borderRadius: 10 }}
                                                resizeMode="cover"
                                            />
                                        ) : !isReportView ? (
                                            <>
                                                <Ionicon name="add" size={20} color="#666" />
                                                <CustomText style={styles.addPhotoText}>Add Photo</CustomText>
                                            </>
                                        ) : null}
                                    </TouchableOpacity>
                                )
                            })}

                        </View>
                    )}

                </View>
                {isSubmit && <ButtonPrimary text={loading ? <ActivityIndicator size="small" color={Colors.light} /> : "Submit"}
                    btnPrimaryStyle={styles.btn} onPress={handleSubmit} />}
            </View>
        </KeyboardAvoidingView >
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light,
        paddingHorizontal: wp * 0.007,
        marginHorizontal: wp * 0.07,
        borderBottomRightRadius: wp * 0.01,
        borderBottomLeftRadius: wp * 0.01,
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    statusSection: {
        paddingVertical: hp * 0.015,
    },
    btn: { alignSelf: "flex-start", marginLeft: wp * 0.04, width: wp * 0.2, height: 40, },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        padding: 2,
        backgroundColor: Colors.primary,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    noPhotosContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginTop: 8,
    },
    noPhotosText: {
        marginLeft: 10,
        color: '#999',
        fontSize: 14,
    },
    section: {
        paddingHorizontal: wp * 0.03,
        paddingVertical: hp * 0.014,
        paddingBottom: hp * 0.006,
    },
    sectionTitle: {
        ...Typography.f_12_nunito_bold,
        color: Colors.black,
    },
    commentsContainer: {
        borderWidth: 1,
        borderColor: Colors.grayLight,
        borderRadius: wp * 0.01,
        paddingVertical: hp * 0.014,
        paddingHorizontal: wp * 0.02,
        marginVertical: hp * 0.015,

    },
    commentText: {
        ...Typography.f_12_nunito_bold,
        fontSize: 9,
        lineHeight: 15,
        color: Colors.dark,
        textAlign: 'justify',
        flex: 1
    },
    photosContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: hp * 0.014,
    },
    photoContainer: {
        borderRadius: 8,
        borderColor: Colors.primary,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        backgroundColor: Colors.light,
    },
    photo: {
        width: 73,
        height: hp * 0.09,
        borderRadius: 8,
    },

    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 150 / 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lightSecondary,
    },
    iconMainContainer: {
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: wp * 0.037,
        width: wp * 0.14,
        gap: 4,
    },



    addPhotoButton: {
        width: 70,
        height: 70,
        backgroundColor: '#f8f9fa',
        borderWidth: 1.5,
        borderColor: '#dee2e6',
        borderStyle: 'dashed',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: wp * 0.03
    },
    addPhotoText: {
        fontSize: 10,
        marginTop: 5,
        textAlign: 'center',
    },

    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    photoCount: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },

    // Grid Layout
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    gridPhotoContainer: {
        position: 'relative',
        margin: 5,
    },
    gridPhoto: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    gridRemoveButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});

export default InspectionReport;