import firestore from '@react-native-firebase/firestore';
import { useCallback } from 'react';

interface Notification {
    type: 'inspection_due';
    title: string;
    message: string;
    relatedPropertyId: string;
    isRead: boolean;
    createdAt: any;
    scheduledAt: any;
}

const usePropertyNotification = () => {
    /**
     * Checks if a date is tomorrow
     * @param date Date to check
     */
    const isTomorrow = (date: Date) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return (
            date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear()
        );
    };

    /**
     * Creates inspection due notification in user's subcollection
     * @param userId User ID to notify
     * @param propertyData Property data
     */
    const createUserNotification = async (userId: string, propertyData: any) => {
        try {
            const userNotificationsRef = firestore()
                .collection('Users')
                .doc(userId)
                .collection('Notifications');

            // Check if notification already exists for this property
            const existingNotification = await userNotificationsRef
                .where('relatedPropertyId', '==', propertyData.id)
                .where('type', '==', 'inspection_due')
                .limit(1)
                .get();

            if (!existingNotification.empty) {
                console.log('Notification already exists for this property');
                return;
            }

            const inspectionDueDate = new Date(
                propertyData.last_date_of_inspection.seconds * 1000 +
                propertyData.last_date_of_inspection.nanoseconds / 1000000
            );

            const notificationDate = new Date(inspectionDueDate);
            notificationDate.setDate(inspectionDueDate.getDate() - 1);

            const notification: Notification = {
                type: 'inspection_due',
                title: 'Inspection Due Tomorrow!',
                message: `Inspection for "${propertyData.name || 'your property'}" is due tomorrow`,
                relatedPropertyId: propertyData.id,
                isRead: false,
                createdAt: firestore.FieldValue.serverTimestamp(),
                scheduledAt: firestore.Timestamp.fromDate(notificationDate)
            };

            await userNotificationsRef.add(notification);
            console.log('Inspection due notification created successfully');
        } catch (error) {
            console.log('Error creating user notification:', error);
        }
    };

    /**
     * Triggers inspection due notification if due date is tomorrow
     * @param propertyData Property data
     */
    const triggerInspectionDueNotification = useCallback(async (propertyData: any) => {
        if (!propertyData.assign_to || !propertyData.last_date_of_inspection) {
            return;
        }

        const inspectionDueDate = new Date(
            propertyData.last_date_of_inspection.seconds * 1000 +
            propertyData.last_date_of_inspection.nanoseconds / 1000000
        );

        // Only trigger if due date is tomorrow
        if (isTomorrow(inspectionDueDate)) {
            await createUserNotification(propertyData.assign_to, propertyData);
        }
    }, []);

    return {
        triggerInspectionDueNotification
    };

};

export default usePropertyNotification;