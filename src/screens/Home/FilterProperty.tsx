import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ArrowDown, ArrowUpp, Calender, } from '../../assets/icons';
import CustomText from '../../components/CustomText';
import globalStyles from '../../utilities/constants/globalStyles';
import Colors from '../../utilities/constants/colors';
import { hp, Typography, wp } from '../../utilities/constants/constant.style';
import { useFormattedDate } from '../../services/hooks/useCustomHooks';
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader';
import ButtonPrimary from '../../components/ButtonPrimary';
import CustomCalendar from '../../components/CustomCalender';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { changeRoute } from '../../services/assynsStorage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FilterPropertyRouteProp, Inspector, } from '../../types/types';
import firestore from '@react-native-firebase/firestore';
import LoaderComponent from '../../components/LoaderComponent';

const FilterProperty: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<FilterPropertyRouteProp>();
  const [loading, setLoading] = useState(true);

  // Get current filters from navigation or use defaults
  const currentFilters = route.params?.filters || {
    selectedStatusKeys: [],
    selectedDates: { from: '', to: '' },
    selectedInspectorName: ''
  };

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState(currentFilters.selectedDates);
  const [selectedStatusKeys, setSelectedStatusKeys] = useState<string[]>(currentFilters.selectedStatusKeys);
  const [selectedInspector, setSelectedInspector] = useState(currentFilters.selectedInspectorName);
  const [inspectorItems, setInspectorItems] = useState<Inspector[]>([]);

  // Fetch inspectors on mount
  useEffect(() => {
    const fetchInspectors = async () => {
      try {
        setLoading(true);
        const inspectionsSnapshot = await firestore().collection('Users').get();

        const userIdsSet = new Set<string>();
        inspectionsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.userId) {
            userIdsSet.add(data.userId);
          }
        });

        const userIds = Array.from(userIdsSet);
        const inspectors: Inspector[] = [];

        for (const userId of userIds) {
          const userDoc = await firestore().collection('Users').doc(userId).get();
          const userData = userDoc.data();

          if (userData) {
            inspectors.push({
              id: userId,
              label: userData.fullName || 'Unknown',
              value: userId,
            });
          }
        }
        setInspectorItems(inspectors);
      } catch (error) {
        console.log('Error fetching inspectors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspectors();
  }, []);

  const handleCheckboxPress = (key: string) => {
    setSelectedStatusKeys(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const statusOptions = [
    { label: 'Pending', key: 'pending' },
    { label: 'In progress', key: 'Inprogress' },
    { label: 'Completed', key: 'completed' }
  ];

  const { formatDisplayDate } = useFormattedDate();

  const applyFilters = () => {
    // Prepare the filters object with all selected criteria
    const filters = {
      selectedStatusKeys,
      selectedDates,
      selectedInspector
    };

    changeRoute(navigation, 'Tabs', {
      screen: 'Home',
      params: { filters },
    }, true);
  };

  return (
    <View style={globalStyles.mainContainer}>
      <HomeProfessionalHeader title='Filter Property' backIcon={false} />

      <View style={globalStyles.paddingContainer}>
        <View>
          {/* Date Range Selector */}
          <CustomText style={[globalStyles.adminLabel, { lineHeight: wp * 0.08 }]}>
            Select Date Range
          </CustomText>
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

          {/* Inspector Dropdown */}
          <InspectorDropdown
            inspectorItems={inspectorItems}
            selectedInspector={selectedInspector}
            onSelectInspector={(id) => {
              setSelectedInspector(id);
            }}
            placeholder={loading ? <LoaderComponent loading={loading} loaderStyle={{ flex: 1 }} /> : "Inspector List"}
          />

          {/* Status Checkboxes */}
          <View style={{ marginVertical: wp * 0.04 }}>
            <CustomText style={[globalStyles.adminLabel, { lineHeight: wp * 0.08 }]}>
              Inspection Status
            </CustomText>
            <View style={[globalStyles.textContainer, { paddingVertical: wp * 0 }]}>
              {statusOptions.map(({ label, key }) => {
                const isChecked = selectedStatusKeys.includes(key);
                return (
                  <TouchableOpacity
                    onPress={() => handleCheckboxPress(key)}
                    activeOpacity={0.7}
                    key={key}
                    style={[globalStyles.checkboxContainer, { marginVertical: wp * 0.02 }]}
                  >
                    <View
                      style={[globalStyles.checkbox, isChecked && globalStyles.checkboxChecked]}
                    >
                      {isChecked && (
                        <Icon name="check" size={16} color={Colors.light} />
                      )}
                    </View>
                    <CustomText style={styles.checkboxLabel}>{label}</CustomText>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <ButtonPrimary
            text="Apply Filters"
            onPress={applyFilters}
          />
        </View>


        {/* Calendar Modal */}
        <CustomCalendar
          visible={isCalendarVisible}
          onClose={() => setCalendarVisible(false)}
          onSelectDates={(dates) => setSelectedDates(dates)}
          initialFromDate={selectedDates.from}
          initialToDate={selectedDates.to}
        />
      </View>
    </View>
  );
};

const InspectorDropdown: React.FC<{
  inspectorItems: Inspector[];
  selectedInspector: string;
  onSelectInspector: (value: string) => void;
  placeholder?: string | React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({
  inspectorItems,
  selectedInspector,
  onSelectInspector,
  placeholder,
  style,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const handleSelectInspector = (inspectorValue: string) => {
      onSelectInspector(inspectorValue);
      setIsDropdownOpen(false);
    };

    const selectedInspectorLabel = inspectorItems.find(
      item => item.value === selectedInspector
    )?.label || placeholder;

    const renderInspectorItem = ({ item }: { item: Inspector }) => (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => handleSelectInspector(item.value)}
        activeOpacity={0.7}
      >
        <CustomText style={styles.dropdownItemText}>{item.label}</CustomText>
      </TouchableOpacity>
    );

    return (
      <View style={[{ marginTop: wp * 0.04 }, style]}>
        <CustomText style={[globalStyles.adminLabel, { lineHeight: wp * 0.08 }]}>
          Find by Inspector
        </CustomText>

        {/* Dropdown Trigger */}
        <TouchableOpacity
          style={[globalStyles.inputContainer, { paddingVertical: hp * 0.017 }]}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          activeOpacity={0.7}
        >
          <CustomText style={[
            globalStyles.text,
            selectedInspector && styles.selectedText
          ]}>
            {selectedInspectorLabel}
          </CustomText>

          <View style={styles.arrowContainer}>
            {isDropdownOpen ? <ArrowUpp /> : <ArrowDown />}
          </View>
        </TouchableOpacity>

        {/* Dropdown List */}
        {isDropdownOpen && (
          <View style={styles.dropdownContainer}>
            <FlatList
              data={inspectorItems}
              renderItem={renderInspectorItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </View>
        )}
      </View>
    );
  };

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: hp * 0.09,
    left: wp * 0.02,
    right: wp * 0.02,
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.dropGray,
    borderRadius: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: hp * 0.35,
  },
  dropdownItem: {
    paddingVertical: hp * 0.008,
    paddingHorizontal: wp * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    ...Typography.f_14_nunito_regular,
    color: Colors.black,
  },
  selectedText: {
    color: Colors.black,
    fontWeight: '500',
  },
  arrowContainer: {
    transform: [{ rotate: '0deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    marginLeft: 8,
    ...Typography.f_16_nunito_bold,
  },
});

export default FilterProperty;