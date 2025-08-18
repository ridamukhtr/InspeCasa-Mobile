import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import CustomText from './CustomText';
import { Typography, wp } from '../utilities/constants/constant.style';
import globalStyles from '../utilities/constants/globalStyles';

const ViewMessageAdmin = ({ message, style, messageTxtStyle, timestamp, type = 'text' }) => {
    const formatTime = (timeString) => {
        if (!timeString) return '';
        // Handle both string timestamps and Firestore Timestamp objects
        const date = timeString?.toDate ? timeString.toDate() : new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <View style={{ width: "100%", alignItems: 'flex-start' }}>
            <View
                style={[
                    styles.messageContainer,
                    style,
                    type === 'text' && { padding: wp * 0.03 },
                ]}>
                {type === 'text' && message && (
                    <CustomText style={[globalStyles.messageTxt, messageTxtStyle]}>
                        {message}
                    </CustomText>
                )}
            </View>
            {timestamp && (
                <CustomText style={styles.timestamp}>
                    {formatTime(timestamp)}
                </CustomText>
            )}
        </View>
    );
};

export default ViewMessageAdmin;

const styles = StyleSheet.create({

    messageContainer: {
        backgroundColor: "#F4F4F5", borderRadius: 8, borderBottomLeftRadius: 0,
        maxWidth: '85%', alignSelf: 'flex-start', marginHorizontal: 6
    },
    mediaImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 8,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        color: '#1f2937',
        fontSize: 16,
        marginLeft: 2,
    },
    timestamp: {
        color: '#9ca3af',
        paddingLeft: 10,
        ...Typography.f_12_nunito_medium,
    },
});