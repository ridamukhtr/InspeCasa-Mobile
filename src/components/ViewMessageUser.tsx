import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import CustomText from './CustomText';
import Colors from '../utilities/constants/colors';
import globalStyles from '../utilities/constants/globalStyles';
import { Typography, wp } from '../utilities/constants/constant.style';

const ViewMessageUser = ({ message, style, messageTxtStyle, type = 'text', timestamp }) => {
    const formatTime = (timeString: string | number | Date) => {
        if (!timeString) return '';
        // Handle both string timestamps and Firestore Timestamp objects
        const date = timeString?.toDate ? timeString.toDate() : new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour6: false
        });
    };

    return (
        <View style={styles.outerContainer}>
            <View
                style={[
                    styles.messageContainer,
                    style,
                    type === 'text' && { padding: wp * 0.03 },
                ]}>
                {type === 'text' && message && (
                    <CustomText style={[globalStyles.messageTxt, { color: Colors.light }, messageTxtStyle]}>
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

export default ViewMessageUser;

const styles = StyleSheet.create({
    outerContainer: {
        alignItems: 'flex-end',
    },
    messageContainer: {
        backgroundColor: Colors.primary, borderRadius: 8, borderBottomRightRadius: 0,
        maxWidth: '85%', alignSelf: 'flex-end', marginHorizontal: 6
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
        marginRight: 6,
        marginBottom: 6,
        ...Typography.f_12_nunito_medium,
    },
});