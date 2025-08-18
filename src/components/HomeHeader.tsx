import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { AppLogo } from '../assets/icons';
import globalStyles from '../utilities/constants/globalStyles';
import { HomeHeaderProps } from '../types/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../utilities/constants/colors';

const HomeHeader: React.FC<HomeHeaderProps> = ({ onPress, resetFilter, showResetFilter }) => {
    return (
        <View style={globalStyles.container}>
            <AppLogo />
            <View style={styles.container}>
                {showResetFilter && (
                    <TouchableOpacity onPress={resetFilter}>
                        <Icon name="filter-list-off" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onPress}>
                    <Icon name="filter-list" size={28} style={{}} color={Colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default HomeHeader

const styles = StyleSheet.create({
    container: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 6 }
})
