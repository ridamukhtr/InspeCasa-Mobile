import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader'
import { Calender } from '../../assets/icons'
import CustomCalender from '../../components/CustomCalender'
import CustomText from '../../components/CustomText'
import ReportCard from '../../components/ReportCard'
import globalStyles from '../../utilities/constants/globalStyles'
import { formatDateOnly, formatFirestoreDate, useFormattedDate } from '../../services/hooks/useCustomHooks'
import { Inspection, RootState, Timestamp } from '../../types/types'
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux'
import Toast from 'react-native-toast-message'
import Colors from '../../utilities/constants/colors'
import LoaderComponent from '../../components/LoaderComponent'
import { hp } from '../../utilities/constants/constant.style'
import HomeUserCardSkeleton from '../Home/HomeUserSkeleton'
import ReportCardSkeleton from './ReportCardSkeleton'

const HistoryScreen = () => {
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [selectedDates, setSelectedDates] = useState<{ from: string; to: string }>({ from: '', to: '' });
    const [loading, setLoading] = useState<boolean>(true);
    const [assignedProperties, setAssignedProperties] = useState<Inspection[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const { formatDisplayDate } = useFormattedDate();
    const userId = useSelector((state: RootState) => state?.auth?.user?.userId);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        setLoading(true);
        try {
            const snapshot = await firestore().collection('reports')
                .where('signature.url', '!=', null)
                .get();

            const userIds = Array.from(new Set(
                snapshot.docs
                    .map(doc => doc.data().assign_to)
                    .filter(Boolean)
            ));

            const usersSnapshot = userIds.length > 0
                ? await firestore()
                    .collection('Users')
                    .where(firestore.FieldPath.documentId(), 'in', userIds)
                    .get()
                : { docs: [] };

            const usersMap: { [key: string]: any } = usersSnapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data();
                return acc;
            }, {} as { [key: string]: any });

            const allData = snapshot.docs.map(doc => {
                const data = doc.data();
                const inspectorData = data.assign_to ? usersMap[data.assign_to] : null;
                return {
                    id: doc.id,
                    ...data,
                    inspectorName: inspectorData?.fullName || 'Unassigned',
                    signedDate: data.signature?.timestamp?.seconds
                        ? formatDateOnly(data.signature.timestamp.seconds)
                        : null,
                    signatureUrl: data.signature?.url || null
                };
            });

            // Filter for current user's properties that aren't deleted
            const userProperties = allData.filter(item =>
                item?.assign_to === userId &&
                item?.overall_status !== 'deleted'
            );
            setAssignedProperties(userProperties);

        } catch (err) {
            console.log('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setSelectedDates({ from: '', to: '' });
        await fetchData();
        setRefreshing(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await firestore().collection('reports').doc(id).update({
                overall_status: 'deleted',
            });
            setAssignedProperties(prev => prev.filter(item => item.id !== id));
            Toast.show({ text1: "Successfully deleted", text2: "Inspection marked as deleted", type: "success" });
        } catch (error) {
            Toast.show({ text1: "Error", text2: "Failed to mark the inspection as deleted.", type: "error" });
        }
    };

    const isDateInRange = (
        dateToCheck: Timestamp,
        fromDate: string,
        toDate: string
    ): boolean => {
        if (!fromDate || !toDate) return true;

        const checkDate = new Date(dateToCheck.seconds * 1000);
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        checkDate.setHours(0, 0, 0, 0);

        return checkDate >= startDate && checkDate <= endDate;
    };

    const filteredProperties = assignedProperties.filter(property => {
        if (!selectedDates.from || !selectedDates.to) return true;
        if (!property.last_date_of_inspection) return false;

        return isDateInRange(property.last_date_of_inspection, selectedDates.from, selectedDates.to);
    });
    const renderHeader = () => (
        <View style={globalStyles.inputContainer}>
            <CustomText style={globalStyles.text}>
                {selectedDates.from && selectedDates.to
                    ? `${formatDisplayDate(selectedDates.from)} - ${formatDisplayDate(selectedDates.to)}`
                    : 'MM/DD/YYYY'}
            </CustomText>
            <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                <Calender />
            </TouchableOpacity>
        </View>
    );

    const renderEmptyComponent = () => {
        if (loading) return (<View>
            <ReportCardSkeleton />
            <ReportCardSkeleton />
        </View>
        );
        return (
            <View style={globalStyles.emptyContainer}>
                <CustomText style={globalStyles.emptyText}>No inspections found</CustomText>
            </View>
        );
    };

    return (
        <View style={globalStyles.mainContainer}>
            <HomeProfessionalHeader title="History" backIcon={false} />
            <FlatList
                data={filteredProperties}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ReportCard
                        key={item.id}
                        name={item.name}
                        inspectionImg={item.images?.[0]}
                        address={item.address}
                        date={formatFirestoreDate(item.last_date_of_inspection)}
                        signDate={item.signedDate}
                        status={item.status}
                        inspectorName={item.inspectorName}
                        onDelete={handleDelete}
                        id={item.id}
                        signatureUrl={item.signatureUrl}
                    />
                )}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                contentContainerStyle={[globalStyles.paddingContainer, { flexGrow: 1 }]}
                showsVerticalScrollIndicator={false}
            />

            <CustomCalender
                visible={isCalendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDates={(dates) => setSelectedDates(dates)}
                initialFromDate={selectedDates.from}
                initialToDate={selectedDates.to}
            />
        </View>
    );
};

export default HistoryScreen
