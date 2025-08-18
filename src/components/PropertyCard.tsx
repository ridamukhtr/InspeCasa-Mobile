import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, } from 'react-native';
import Colors from '../utilities/constants/colors';
import { hp, Typography, wp } from '../utilities/constants/constant.style';
import { Address } from '../assets/icons';
import * as Progress from 'react-native-progress';
import CustomText from './CustomText';
import { PropertyCardProps } from '../types/types';
import SliderView from './SliderView';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PropertyCard = ({ id, description, propertyImg, name, progress, address, status, propertyImgStyle, videoUrl }: PropertyCardProps) => {
    const progressRef = useRef<number | undefined>(undefined);

    const images = Array.isArray(propertyImg) ? propertyImg : [propertyImg].filter(Boolean);
    const [storedProgress, setStoredProgress] = useState<number | null>(null);

    const storeProgress = async (value: number) => {
        try {
            await AsyncStorage.setItem(`progress_${id}`, JSON.stringify(value));
            console.log('Progress saved:', value);
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    };

    if (progress !== progressRef.current && progress !== undefined && id) {
        storeProgress(progress);
        progressRef.current = progress;
    }


    useEffect(() => {
        const getProgress = async () => {
            try {
                const value = await AsyncStorage.getItem(`progress_${id}`);
                if (value !== null) {
                    const parsed = JSON.parse(value);
                    setStoredProgress(parsed);
                    console.log('Retrieved progress:', parsed);
                }
            } catch (e) {
                console.log('Error reading progress:', e);
            }
        };

        getProgress();
    }, [id])

    return (
        <View style={styles.container}>
            <SliderView images={images} videoUrl={videoUrl} propertyImgStyle={propertyImgStyle} />

            {/* Content Container */}
            <View style={styles.contentContainer}>
                {/* Title and Description */}
                <View style={styles.textSection}>
                    <CustomText style={styles.title}>{name || "Ocean View Complex"}</CustomText>
                    <CustomText style={styles.title}>Description</CustomText>

                    <CustomText style={styles.description}>
                        {description || "A modern villa with a private pool and elegant architecture."}
                    </CustomText>
                </View>

                {/* Address Section */}
                <View style={styles.addressSection}>
                    <Address />
                    <CustomText style={styles.addressText}>{address ? `${address.charAt(0).toUpperCase()}${address.slice(1).toLowerCase()}` : "456 Beach Rd, Miami"}</CustomText>
                </View>

                {/* Status Section */}
                <View style={styles.statusSection}>
                    <View style={styles.statusBadge}>
                        <CustomText style={styles.statusText}> {status ? `${status.charAt(0).toUpperCase()}${status.slice(1).toLowerCase()}` : "Pending"}</CustomText>
                    </View>
                    <CustomText style={styles.completionText}>{Math.round(progress * 100) || 0}%</CustomText>
                </View>

                {/* Progress Bar */}

                <Progress.Bar
                    progress={progress}
                    width={null}
                    height={8}
                    borderRadius={wp * 0.074}
                    color={Colors.primary}
                    unfilledColor="#e0e0e0"
                    borderWidth={0}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    contentContainer: {
        width: "97%",
        paddingHorizontal: 0.01,
        paddingTop: hp * 0.015,
        paddingBottom: wp * 0.06,
    },
    textSection: {
        marginBottom: wp * 0.03,
    },
    title: {
        ...Typography.f_15_nunito_extra_bold,
        color: Colors.black,
        lineHeight: hp * 0.03,
    },
    description: {
        ...Typography.f_14_nunito_regular,
        color: Colors.black,
        lineHeight: hp * 0.025,
    },
    addressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp * 0.015,
        gap: wp * 0.02,
        marginLeft: hp * 0.006
    },
    addressText: {
        ...Typography.f_15_nunito_medium,
        color: Colors.black,
    },
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp * 0.015,
    },
    statusBadge: {
        backgroundColor: Colors.successGreen,
        paddingHorizontal: wp * 0.02,
        paddingVertical: hp * 0.005,
        borderRadius: wp * 0.074,
    },
    statusText: {
        color: '#2FAE5E',
        ...Typography.f_14_nunito_regular,
    },
    completionText: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '600',
    },

});

export default PropertyCard;