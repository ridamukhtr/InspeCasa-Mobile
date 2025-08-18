import React from 'react';
import { TouchableOpacity, View, StyleSheet, GestureResponderEvent, ViewStyle, } from 'react-native';
import CustomText from './CustomText';
import Colors from '../utilities/constants/colors';
import { Typography, wp } from '../utilities/constants/constant.style';
import globalStyles from '../utilities/constants/globalStyles';
import { RightArowIcon } from '../assets/icons';
import { TextStyle } from 'react-native';

interface SettingsMenuItemProps {
    title: string;
    onPress?: (event: GestureResponderEvent) => void;
    right?: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    description?: string | boolean;
    inspection_counts?: string | boolean;
    remainingCounts?: string | boolean;
    date?: string | boolean;
}
const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
    title,
    onPress,
    right,
    style,
    titleStyle,
    description = false,
    date = false,
    inspection_counts = false,
    remainingCounts = false
}) => {
    console.log(" wp * 0.015", wp * 0.04);

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}>
            <View>
                <CustomText style={[globalStyles.statusText, titleStyle]}>
                    {title}
                </CustomText>
                {description && <CustomText style={[styles.desText, { color: Colors.primary }]}>
                    {description}
                </CustomText>}
                {inspection_counts && <CustomText style={[styles.desText,]}>
                    {inspection_counts}
                </CustomText>}
                {remainingCounts && <CustomText style={[styles.desText,]}>
                    {remainingCounts}
                </CustomText>}
                {date && <CustomText style={[styles.desText,]}>
                    {date}
                </CustomText>}
            </View>
            {right ? right : <RightArowIcon />}

        </TouchableOpacity >
    );
};

export default SettingsMenuItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        paddingVertical: wp * 0.04,
        paddingHorizontal: 8,
        backgroundColor: Colors.light,
        borderWidth: 1,
        borderRadius: wp * 0.014,
        borderColor: Colors.dropGray,
        marginBottom: wp * 0.04
    },
    title: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '400',
    },
    desText: {
        ...Typography.f_12_nunito_medium,
        color: Colors.dark
    }
});