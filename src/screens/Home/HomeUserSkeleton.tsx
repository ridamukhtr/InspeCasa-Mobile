import React from 'react';
import { View, StyleSheet, } from 'react-native';
import Colors from '../../utilities/constants/colors';
import { wp } from '../../utilities/constants/constant.style';

const HomeUserCardSkeleton = () => {
    return (
        <View style={styles.container}>

            <View style={styles.infoMain}>
                <View style={styles.infoContainer}>
                    <View style={styles.dateNumberSkeleton} />
                    <View style={styles.dateMonthSkeleton} />
                </View>

                <View style={styles.overlayContainer}>
                    <View style={styles.statusRowSkeleton}>
                        <View style={styles.statusBadgeSkeleton} />
                        <View style={styles.inspectButtonSkeleton} />
                    </View>

                    <View style={styles.progressSkeleton}>
                        <View style={styles.progressBarSkeleton} />
                        <View style={styles.progressTextSkeleton} />
                    </View>

                    <View style={styles.propertyInfoSkeleton}>
                        <View>
                            <View style={styles.propertyNameSkeleton} />
                            <View style={styles.locationContainerSkeleton}>
                                <View style={styles.locationIconSkeleton} />
                                <View style={styles.locationTextSkeleton} />
                            </View>
                        </View>

                        <View style={styles.inspectorInfoSkeleton}>
                            <View style={styles.inspectorImageSkeleton} />
                            <View style={styles.inspectorTextSkeleton}>
                                <View style={styles.inspectorNameSkeleton} />
                                <View style={styles.inspectorBadgeSkeleton} />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
        marginVertical: 16,
        height: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        backgroundColor: Colors.light,
    },
    infoContainer: {
        backgroundColor: Colors.light,
        alignSelf: "flex-end",
        alignItems: "center",
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: wp * 0.02,
        width: wp * 0.16
    },
    dateNumberSkeleton: {
        height: 22,
        width: '60%',
        backgroundColor: Colors.gray,
        borderRadius: 4,
        marginBottom: 4,
    },
    dateMonthSkeleton: {
        height: 17,
        width: '80%',
        backgroundColor: Colors.gray,
        borderRadius: 4,
    },
    statusRowSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp * 0.02,
    },
    statusBadgeSkeleton: {
        width: wp * 0.26,
        height: 24,
        backgroundColor: Colors.gray,
        borderRadius: 20,
    },
    inspectButtonSkeleton: {
        width: wp * 0.28,
        height: 24,
        backgroundColor: Colors.gray,
        borderRadius: 20,
    },
    progressSkeleton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: wp * 0.02,
    },
    progressBarSkeleton: {
        width: wp * 0.76,
        height: 8,
        backgroundColor: Colors.gray,
        borderRadius: wp * 0.074,
    },
    progressTextSkeleton: {
        width: 30,
        height: 14,
        backgroundColor: Colors.gray,
        borderRadius: 4,
    },
    overlayContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
        gap: wp * 0.02,
        borderBottomRightRadius: 4,
        borderBottomLeftRadius: 4
    },
    infoMain: {
        justifyContent: "space-between",
        flex: 1
    },
    propertyInfoSkeleton: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    propertyNameSkeleton: {
        height: 20,
        width: wp * 0.4,
        backgroundColor: Colors.gray,
        borderRadius: 4,
        marginBottom: 8,
    },
    locationContainerSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationIconSkeleton: {
        width: 12,
        height: 12,
        backgroundColor: Colors.gray,
        borderRadius: 6,
    },
    locationTextSkeleton: {
        height: 12,
        width: wp * 0.3,
        backgroundColor: Colors.gray,
        borderRadius: 4,
    },
    inspectorInfoSkeleton: {
        width: '35%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp * 0.02,
    },
    inspectorImageSkeleton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.gray,
        borderWidth: 2,
        borderColor: Colors.light,
    },
    inspectorTextSkeleton: {
        width: '60%',
    },
    inspectorNameSkeleton: {
        height: 14,
        width: '80%',
        backgroundColor: Colors.gray,
        borderRadius: 4,
        marginBottom: 4,
    },
    inspectorBadgeSkeleton: {
        height: 12,
        width: '60%',
        backgroundColor: Colors.gray,
        borderRadius: 4,
    },
});

export default HomeUserCardSkeleton;