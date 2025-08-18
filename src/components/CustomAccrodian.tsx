import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import CustomText from './CustomText';
import { ArrowDown, ArrowUpp, } from '../assets/icons';
import Colors from '../utilities/constants/colors';
import { Typography, wp } from '../utilities/constants/constant.style';

type CustomAccordionProps = {
    children: React.ReactNode;
    isCollapsed?: boolean;
    onPress: () => void;
    onPressNested: () => void;
    titleStyle?: StyleProp<ViewStyle>;
    title: string;
    simpleDropdown?: boolean
};

const CustomAccordion: React.FC<CustomAccordionProps> = ({
    children,
    isCollapsed = true,
    onPress,
    titleStyle,
    title,
    simpleDropdown = false
}) => {
    const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);

    useEffect(() => {
        setLocalCollapsed(isCollapsed);
    }, [isCollapsed]);

    const handlePress = () => {
        setLocalCollapsed(!localCollapsed);
        onPress?.();
    };

    return (
        <View>
            {simpleDropdown ? (
                <View style={{
                    backgroundColor: Colors.dropGray,
                    paddingBottom: wp * 0.012,
                    marginVertical: wp * 0.012
                }}>
                    <TouchableOpacity
                        style={[styles.title, titleStyle]}
                        onPress={handlePress}
                        activeOpacity={0.7}
                    >
                        <View style={!localCollapsed ? { transform: [{ rotate: '180deg' }] } : null}>
                            <ArrowDown />
                        </View>
                        <CustomText style={styles.accessoriesTitle}>{title}</CustomText>
                    </TouchableOpacity>

                    {!localCollapsed && (
                        <Animatable.View
                            animation={!localCollapsed ? 'fadeIn' : undefined}
                            duration={300}
                        >
                            {children}
                        </Animatable.View>
                    )}
                </View>
            ) : (
                <View>
                    <TouchableOpacity
                        onPress={handlePress}
                        style={[
                            styles.titleStyle,
                            titleStyle,
                            !localCollapsed && {
                                borderBottomWidth: 0,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0
                            },
                        ]}
                    >
                        <CustomText style={styles.accessoriesTitle}>{title}</CustomText>
                        <View style={!localCollapsed ? { transform: [{ rotate: '180deg' }] } : null}>
                            <ArrowUpp />
                        </View>
                    </TouchableOpacity>

                    {!localCollapsed && (
                        <Animatable.View
                            animation={!localCollapsed ? 'fadeIn' : undefined}
                            duration={300}
                        >
                            {children}
                        </Animatable.View>
                    )}
                </View>
            )}
        </View>
    );
};

export default CustomAccordion;

const styles = StyleSheet.create({
    accessoriesTitle: { color: Colors.bluishGray, ...Typography.f_15_nunito_extra_bold },
    title: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginVertical: 6,
        marginHorizontal: 16,
    },
    titleStyle: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        padding: wp * 0.015,
        paddingHorizontal: wp * 0.02,
        justifyContent: "space-between",
        marginTop: 6,
        marginHorizontal: wp * 0.07,
        borderRadius: wp * 0.01,
        borderColor: Colors.primary,
        borderWidth: 1,
        backgroundColor: Colors.light,

    },
});
