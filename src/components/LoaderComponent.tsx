import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';
import Colors from '../utilities/constants/colors';

interface LoaderComponentProps {
    loading: boolean;
    loaderStyle: any
}

const LoaderComponent: React.FC<LoaderComponentProps> = ({ loading, loaderStyle }) => {
    if (!loading) return null;

    return (
        <View style={[styles.loaderStyle, loaderStyle]}>
            <ActivityIndicator size="small" color={Colors.primary} />
        </View>
    );
};

export default LoaderComponent;

const styles = StyleSheet.create({
    loaderStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light,
    },
});
