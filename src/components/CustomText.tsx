import { Text } from 'react-native';
import React from 'react';
import globalStyles from '../utilities/constants/globalStyles';

interface CustomTextProps {
    children?: React.ReactNode;
    onPress?: () => void;
    numberOfLines?: number;
    style?: any;
    ellipsizeMode?: any;
}
const CustomText: React.FC<CustomTextProps> = ({
    children,
    onPress,
    numberOfLines,
    style,
    ellipsizeMode
}) => {
    return (
        <Text
            allowFontScaling={false}
            onPress={onPress}
            style={[globalStyles.defaultTxt, style]}
            ellipsizeMode={ellipsizeMode}
            numberOfLines={numberOfLines}>
            {children}
        </Text>
    );
};

export default CustomText;
