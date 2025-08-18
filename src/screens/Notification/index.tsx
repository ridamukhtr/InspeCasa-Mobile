import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    SectionList,
} from 'react-native';
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader';
import globalStyles from '../../utilities/constants/globalStyles';
import Colors from '../../utilities/constants/colors';
import CustomText from '../../components/CustomText';
import { Typography, wp } from '../../utilities/constants/constant.style';
import { changeRoute } from '../../services/assynsStorage';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useAppSelector } from '../../store/store';
import { RootState } from '../../types/types';
import moment from 'moment';

const NotificationScreen = () => {
    const navigation = useNavigation();
    const userId = useAppSelector((state: RootState) => state?.auth?.user?.userId);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    console.log("notificationss", notifications);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const snapshot = await firestore()
                .collection('Users')
                .doc(userId)
                .collection('Notifications')
                // .orderBy('createdAt', 'desc')
                .get();

            const notifs = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Raw createdAt:', data.createdAt);

                const createdAt = data.createdAt?.seconds
                    ? new Date(data.createdAt.seconds * 1000)
                    : new Date();
                const notificationTime = moment(createdAt).fromNow();
                console.log("time", notificationTime);
                return {
                    id: doc.id,
                    ...data,
                    createdAt,
                    time: formatNotificationTime(createdAt),
                    section: getNotificationSection(createdAt),
                };
            });

            const sortedNotifs = notifs.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setNotifications(sortedNotifs);
        } catch (error) {
            console.log('Error fetching notifications:', error);

            try {
                console.log('Trying fallback query without orderBy...');
                const fallbackSnapshot = await firestore()
                    .collection('Users')
                    .doc(userId)
                    .collection('Notifications')
                    .get();

                const fallbackNotifs = fallbackSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const createdAt = data.createdAt?.seconds
                        ? new Date(data.createdAt.seconds * 1000)
                        : new Date();

                    return {
                        id: doc.id,
                        ...data,
                        createdAt,
                        time: formatNotificationTime(createdAt),
                        section: getNotificationSection(createdAt),
                    };
                });

                // Sort manually since we can't use orderBy
                const sortedFallbackNotifs = fallbackNotifs.sort((a, b) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });

                setNotifications(sortedFallbackNotifs);
            } catch (fallbackError) {
                console.log('Fallback query also failed:', fallbackError);
                setNotifications([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    // Also update the useEffect to handle the real-time listener properly
    // const useEffectCode = `
    useEffect(() => {
        if (!userId) return;

        fetchNotifications();

        // Set up real-time listener with proper error handling
        const unsubscribe = firestore()
            .collection('Users')
            .doc(userId)
            .collection('Notifications')
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                snapshot => {
                    if (snapshot.docChanges().length > 0) {
                        if (!loading) {
                            fetchNotifications();
                        }
                    }
                },

            );

        return () => unsubscribe();
    }, [userId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

    const formatNotificationTime = (createdAt: Date) => {
        const now = moment();
        const notificationTime = moment(createdAt);
        const diffSeconds = now.diff(notificationTime, 'seconds');
        const diffMinutes = now.diff(notificationTime, 'minutes');
        const diffHours = now.diff(notificationTime, 'hours');
        const diffDays = now.diff(notificationTime, 'days');

        if (diffSeconds < 60) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays === 1) return 'Yesterday';
        return notificationTime.format('D MMM');
    };
    const getNotificationSection = (createdAt: Date) => {
        const now = moment().startOf('day');
        const notificationDate = moment(createdAt).startOf('day');
        const diffDays = now.diff(notificationDate, 'days');

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return 'This Week';
        if (diffDays < 30) return 'This Month';
        return 'Older';
    };
    // Memoized grouped notifications
    const groupedNotifications = useMemo(() => {
        const grouped = notifications.reduce((acc, item) => {
            if (!acc[item.section]) acc[item.section] = [];
            acc[item.section].push(item);
            return acc;
        }, {} as Record<string, Notification[]>);

        // Define section order (newest to oldest)
        return ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']
            .filter(section => grouped[section])
            .map(section => ({
                title: section,
                data: grouped[section],
            }));
    }, [notifications]);

    const handleNotificationPress = async (item: any) => {
        try {
            await firestore()
                .collection('Users')
                .doc(userId)
                .collection('Notifications')
                .doc(item.id)
                .update({ isRead: true });

            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === item.id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );


            const propertySnap = await firestore()
                .collection('properties')
                .doc(item.relatedPropertyId)
                .get();

            if (!propertySnap.exists) {
                console.log('Property not found for ID:', item?.relatedPropertyId);
                return;
            }

            const propertyData = propertySnap.data();

            changeRoute(navigation, 'StartInspection', {
                item: propertyData,
                id: item.relatedPropertyId,
            });
        } catch (error) {
            console.log('Error handling notification press:', error);
        }
    };

    const renderSkeletonItem = () => (
        <View style={styles.skeletonItem}>
            <View style={styles.skeletonDot} />
            <View style={styles.skeletonTextContainer}>
                <View style={[styles.skeletonText, { width: '80%' }]} />
                <View style={[styles.skeletonText, { width: '60%', marginTop: 8 }]} />
            </View>
            <View style={[styles.skeletonText, { width: '15%' }]} />
        </View>
    );

    const renderSkeletonSection = () => (
        <View style={styles.skeletonSection}>
            <View style={styles.skeletonHeader} />
            {[...Array(3)].map((_, index) => (
                <React.Fragment key={index}>
                    {renderSkeletonItem()}
                </React.Fragment>
            ))}
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.notificationItem}
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.notificationLeft}>
                <View
                    style={[
                        styles.statusDot,
                        {
                            backgroundColor: item.isRead === true
                                ? Colors.grayLight
                                : Colors.primary,
                        },
                    ]}
                />
                <CustomText
                    ellipsizeMode="tail"
                    numberOfLines={2}
                    style={[
                        styles.notificationText,
                        {
                            color: item.isRead ? '#626262' : Colors.black,
                        },
                    ]}
                >
                    {item?.type === 'inspection_due' ? `Reminder: ${item?.message}` : item?.message}
                </CustomText>
            </View>
            <CustomText style={styles.notificationText}>{item.time}</CustomText>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={styles.headerContainer}>
            <CustomText style={styles.sectionTitle}>{title}</CustomText>
        </View>
    );

    return (
        <View style={styles.container}>
            <HomeProfessionalHeader title="Notification" backIcon={false} />
            {loading ? (
                // Show skeleton while loading
                <View style={globalStyles.paddingContainer}>
                    {[...Array(3)].map((_, index) => (
                        <React.Fragment key={index}>
                            {renderSkeletonSection()}
                        </React.Fragment>
                    ))}
                </View>
            ) : (
                // Show actual notifications when loaded
                <View style={globalStyles.paddingContainer}>
                    <SectionList
                        sections={groupedNotifications}
                        renderItem={renderItem}
                        renderSectionHeader={renderSectionHeader}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[Colors.primary]}
                            />
                        }
                        ListEmptyComponent={
                            <View style={globalStyles.emptyContainer}>
                                <CustomText style={globalStyles.emptyText}>No notifications found.</CustomText>
                            </View>
                        }
                        ListFooterComponent={
                            <View style={[styles.notificationItem, { borderWidth: 0, borderColor: "transparent" }]} />
                        }
                    />
                </View>
            )}
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    headerContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        ...Typography.f_12_nunito_bold,
        fontWeight: 'bold',
    },
    notificationItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.light,
        borderRadius: 4,
        padding: wp * 0.04,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.grayLight,
    },
    notificationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        width: wp * 0.55,
        marginRight: 12,
    },
    statusDot: {
        padding: wp * 0.014,
        borderRadius: 16,
        marginRight: 12,
    },
    notificationText: {
        ...Typography.f_14_nunito_bold,
        lineHeight: 22,
        color: '#6b7280',
    },
    skeletonItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.light,
        borderRadius: 4,
        padding: wp * 0.04,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.grayLight,
    },
    skeletonDot: {
        width: wp * 0.05,
        height: wp * 0.05,
        borderRadius: wp * 0.025,
        backgroundColor: Colors.grayLight,
        marginRight: 12,
    },
    skeletonTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    skeletonText: {
        height: 16,
        backgroundColor: Colors.grayLight,
        borderRadius: 4,
    },
    skeletonSection: {
        marginBottom: 24,
    },
    skeletonHeader: {
        height: 18,
        width: '30%',
        backgroundColor: Colors.grayLight,
        borderRadius: 4,
        marginBottom: 16,
    },
});

export default NotificationScreen;