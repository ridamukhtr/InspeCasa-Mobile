import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TextInputProps,
    NativeSyntheticEvent,
    TextInputFocusEventData,
    ViewStyle,
    StyleProp,
} from 'react-native';
import Colors from '../utilities/constants/colors';
import { hp, wp } from '../utilities/constants/constant.style';
import CustomText from './CustomText';
import globalStyles from '../utilities/constants/globalStyles';

interface CustomTextFieldProps extends TextInputProps {
    placeholder?: string;
    secureTextEntry?: boolean;
    onChangeText?: (text: string) => void;
    value?: string;
    label?: string;
    onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
    right?: React.ReactNode;
    left?: React.ReactNode;
    leftContainer?: React.ReactNode;
    inputContainerStyle?: StyleProp<ViewStyle>;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
    placeholder,
    secureTextEntry,
    onChangeText,
    value,
    label,
    onBlur,
    right,
    left, // New prop
    leftContainer,
    inputContainerStyle,
    ...rest
}) => {
    return (
        <View style={styles.container}>
            {label && <CustomText style={[globalStyles.messageTxt, { marginLeft: wp * 0.03 }]}>{label}</CustomText>}

            <View style={[styles.inputContainer, inputContainerStyle]}>
                {/* Left Side Component */}
                {left ? (
                    <View style={styles.leftContainer}>
                        {left}
                        <View style={styles.separator} />
                    </View>

                ) : leftContainer}

                <TextInput
                    style={[styles.textInput,]}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    onChangeText={onChangeText}
                    value={value}
                    onBlur={onBlur}
                    placeholderTextColor="#999"
                    {...rest}
                />
                {right}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: wp * 0.02,
    },
    input: {
        flex: 1,
        height: hp * 0.065,
        fontSize: wp * 0.037,
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light,
        borderWidth: 1,
        borderColor: Colors.dropGray,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: wp * 0.01,
        marginVertical: wp * 0.01,
    },
    textInput: {
        flex: 1,
        marginRight: 12,
        color: Colors.black,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    separator: {
        width: 1.5,
        height: hp * 0.053,
        backgroundColor: Colors.dropGray,
        marginHorizontal: 8,
    },
});

export default CustomTextField;