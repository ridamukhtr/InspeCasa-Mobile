import { FlatList, ListRenderItemInfo, RefreshControl, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import HomeHeader from '../../components/HomeHeader'
import HomeUserCard from '../../components/HomeUserCard'
import globalStyles from '../../utilities/constants/globalStyles'
import CustomTextField from '../../components/CustomTextField'
import { Search } from '../../assets/icons'
import { hp } from '../../utilities/constants/constant.style'
import firestore from '@react-native-firebase/firestore';
import CustomText from '../../components/CustomText'
import Colors from '../../utilities/constants/colors'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { changeRoute } from '../../services/assynsStorage'
import { Inspection, RouteParams } from '../../types/types'
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeUserCardSkeleton from './HomeUserSkeleton'
import usePropertyNotification from '../../services/hooks/usePropertyNotification'

const HomeUser = () => {
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const navigation = useNavigation();

  const filters = route.params?.filters || null;

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspectors, setInspectors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { triggerInspectionDueNotification } = usePropertyNotification();

  useEffect(() => {
    const checkDailyInspections = async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      try {
        const snapshot = await firestore()
          .collection('properties')
          .where('last_date_of_inspection', '>=', firestore.Timestamp.fromDate(tomorrow))
          .where('last_date_of_inspection', '<', firestore.Timestamp.fromDate(new Date(tomorrow.getTime() + 86400000)))
          .get();

        snapshot.forEach(doc => {
          triggerInspectionDueNotification(doc.data());
        });
      } catch (error) {
        console.log('Daily inspection check failed:', error);
      }
    };

    checkDailyInspections();
    const dailyInterval = setInterval(checkDailyInspections, 24 * 60 * 60 * 1000);

    return () => clearInterval(dailyInterval);
  }, [triggerInspectionDueNotification]);


  useEffect(() => {
    const fetchInspectors = async () => {
      try {
        const snapshot = await firestore().collection('Users').get();
        const inspectorsData: Record<string, string> = {};

        snapshot.forEach(doc => {
          const data = doc.data();

          if (data.userId && data.fullName) {
            inspectorsData[data.userId] = data.fullName;
          }
        });

        setInspectors(inspectorsData);
      } catch (error) {
        console.log('Error fetching inspectors:', error);
      }
    };

    fetchInspectors();
  }, []);

  const fetchData = async (bypassFilters = false) => {
    setLoading(true);
    try {
      const snapshot = await firestore().collection('properties').get();
      snapshot.forEach(doc => {
        const propertyData = doc.data();
        if (propertyData.assign_to) {
          triggerInspectionDueNotification({
            id: doc.id,
            ...propertyData
          });
        }
      })
      const allData: Inspection[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Inspection[];

      let filteredData = allData;

      if (!bypassFilters && filters) {
        const fromDate = filters.selectedDates?.from
          ? new Date(filters.selectedDates.from).setHours(0, 0, 0, 0)
          : null;
        const toDate = filters.selectedDates?.to
          ? new Date(filters.selectedDates.to).setHours(23, 59, 59, 999)
          : null;

        const selectedStatuses = filters.selectedStatusKeys?.map(s => s.toLowerCase()) || [];

        const selectedInspector = filters.selectedInspector;

        filteredData = filteredData.filter(item => {
          let dateFilterPassed = true;
          let statusFilterPassed = true;
          let inspectorFilterPassed = true;

          if (fromDate && toDate) {
            let inspectionDate: number | null = null;
            if (item.create_at?._seconds) {
              inspectionDate = item.create_at._seconds * 1000;
            } else if (item.create_at instanceof Date) {
              inspectionDate = item.create_at.getTime();
            } else if (typeof item.create_at === 'string') {
              inspectionDate = new Date(item.create_at).getTime();
            } else {
              dateFilterPassed = false;
            }

            if (inspectionDate !== null) {
              dateFilterPassed = inspectionDate >= fromDate && inspectionDate <= toDate;
            }
          }

          if (selectedStatuses.length > 0) {
            statusFilterPassed = selectedStatuses.includes(item.status?.toLowerCase());
          }

          if (selectedInspector) {
            inspectorFilterPassed = item.assign_to === selectedInspector;
          }

          return dateFilterPassed && statusFilterPassed && inspectorFilterPassed;
        });
      }

      if (searchQuery.trim()) {
        filteredData = filteredData.filter(item => {
          const itemName = item.name?.toLowerCase() || '';
          const searchTerm = searchQuery.toLowerCase();
          const inspectorName = inspectors[item.inspectorId]?.toLowerCase() || '';
          return itemName.includes(searchTerm) || inspectorName.includes(searchTerm);
        });
      }

      setInspections(filteredData);
    } catch (err) {
      console.log('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (Object.keys(inspectors).length > 0) {
      fetchData();
    }
  }, [filters, searchQuery, inspectors]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderFooter = () => (
    <View style={{ paddingBottom: hp * 0.17 }} />
  );

  const RightContainer = ({ onClear, showClear }: { onClear: () => void; showClear: boolean }) => (
    <View style={{ paddingHorizontal: 8 }}>
      {showClear && (
        <TouchableOpacity onPress={onClear} >
          <Ionicons name="close-circle" size={20} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }: ListRenderItemInfo<Inspection>) => {
    return <HomeUserCard item={item} />;
  };

  return (
    <View style={globalStyles.mainContainer}>
      <View style={globalStyles.paddingContainer}>
        <HomeHeader
          showResetFilter={!!filters}
          resetFilter={() => {
            navigation.setParams({ filters: null });
            fetchData(true);
          }}
          onPress={() =>
            changeRoute(navigation, 'FilterProperty', {
              filters: filters,
            })
          }
        />
        <CustomTextField
          leftContainer={<Search />}
          right={<RightContainer onClear={() => setSearchQuery('')} showClear={!!searchQuery} />}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchData()}
        />
        {loading ? (
          <View>
            <HomeUserCardSkeleton />
            <HomeUserCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={inspections}
            keyExtractor={(item) => item.id}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={globalStyles.emptyContainer}>
                <CustomText style={globalStyles.emptyText}>No inspections found.</CustomText>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default HomeUser