import { View, StyleSheet } from 'react-native';
import { hp, wp } from '../../utilities/constants/constant.style';
import Colors from '../../utilities/constants/colors';


const ReportCardSkeleton = () => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Header Section Skeleton */}
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                        <View style={[styles.propertyImage, styles.skeleton]} />
                        <View style={styles.propertyInfo}>
                            <View style={[styles.skeletonText, { width: '70%', height: 16 }]} />
                            <View style={[styles.skeletonText, { width: '90%', height: 14, marginTop: 4 }]} />
                            <View style={[styles.skeletonText, { width: '50%', height: 12, marginTop: 4 }]} />
                        </View>
                    </View>
                    <View style={styles.btnContainer}>
                        <View style={[styles.skeletonText, { width: 80, height: 18 }]} />
                        <View style={styles.iconsRow}>
                            {[...Array(3)].map((_, i) => (
                                <View key={i} style={[styles.iconButton, styles.skeleton, { width: 24, height: 24 }]} />
                            ))}
                        </View>
                    </View>
                </View>

                {/* Condition and Damage Section Skeleton */}
                <View style={styles.statusSection}>
                    <View style={styles.statusRow}>
                        <View style={[styles.skeletonText, { width: 60, height: 14 }]} />
                        <View style={[styles.skeletonText, { width: 80, height: 14 }]} />
                    </View>
                </View>

                {/* Inspector Section Skeleton */}
                <View style={[styles.inspectorSection, { borderTopWidth: 1, borderTopColor: Colors.grayLight }]}>
                    <View style={[styles.skeletonText, { width: 70, height: 14 }]} />
                    <View style={[styles.skeletonText, { width: 100, height: 14 }]} />
                </View>

                {/* Signature and Date Section Skeleton */}
                <View style={[styles.bottomSection, { borderTopWidth: 1, borderTopColor: Colors.grayLight }]}>
                    <View style={styles.signatureSection}>
                        <View style={[styles.skeletonText, { width: 60, height: 8 }]} />
                        <View style={[styles.skeleton, { width: 120, height: 8, marginLeft: 8 }]} />
                    </View>
                    <View style={styles.dateSection}>
                        <View style={[styles.skeletonText, { width: 40, height: 14 }]} />
                        <View style={[styles.skeletonText, { width: 80, height: 14, marginLeft: 8 }]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: hp * 0.025,
    },
    card: {
        backgroundColor: Colors.light,
        borderRadius: hp * 0.006,
        paddingVertical: hp * 0.02,
        paddingRight: wp * 0.04,
        paddingLeft: wp * 0.027,
        borderColor: Colors.lightSecondary,
        borderWidth: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: wp * 0.07,
    },
    propertyImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    propertyInfo: {
        gap: wp * 0.01
    },
    btnContainer: {
        alignItems: "center",
        justifyContent: "space-between",
        gap: hp * 0.018
    },
    iconsRow: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    statusSection: {
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inspectorSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 7,
        paddingTop: 16,
    },
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 10,
    },
    signatureSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skeleton: {
        backgroundColor: Colors.grayLight,
        borderRadius: 4,
    },
    skeletonText: {
        backgroundColor: Colors.grayLight,
        borderRadius: 4,
    },
});

export default ReportCardSkeleton;