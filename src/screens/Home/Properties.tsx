import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader';
import Colors from '../../utilities/constants/colors';
import { hp, Typography, wp } from '../../utilities/constants/constant.style';
import PropertyCard from '../../components/PropertyCard';
import globalStyles from '../../utilities/constants/globalStyles';
import CustomAccordion from '../../components/CustomAccrodian';
import InspectionReport from '../../components/InspectionReport';
import CustomText from '../../components/CustomText';
import ButtonPrimary from '../../components/ButtonPrimary';
import { changeRoute } from '../../services/assynsStorage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import { CategoryGroup, PropertyItem, RouteParams, StatusKey, statusOptions, Subcategory } from '../../types/types';
import { firebase } from '@react-native-firebase/auth';
import LoaderComponent from '../../components/LoaderComponent';
import { uploadImageToCloudinary } from '../../services/hooks/useCustomHooks';
import { useDispatch, useSelector } from 'react-redux';

const Properties = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

    const { item } = route.params || {};
    console.log("item", item);

    const [propertyData, setPropertyData] = useState<PropertyItem>(item);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [nestedCollapsed, setNestedCollapsed] = useState<Record<string, boolean>>({});
    const [collapsedStates, setCollapsedStates] = useState<Record<string, boolean>>({});
    const [selectedStatusKey, setSelectedStatusKey] = useState<StatusKey | null>(null);

    const calculateProgress = useCallback((categories: CategoryGroup[]) => {
        if (!categories?.length) return 0;

        let totalSubcategories = 0;
        let completedSubcategories = 0;

        categories.forEach(categoryGroup => {
            Object.values(categoryGroup).forEach(category => {
                category.subcategories?.forEach(sub => {
                    totalSubcategories++;
                    if (sub.inspection_status && sub.comment) {
                        completedSubcategories++;
                    }
                });
            });
        });

        return totalSubcategories > 0 ? completedSubcategories / totalSubcategories : 0;
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const doc = await firestore().collection('properties').doc(item.id).get();
                if (doc.exists()) {
                    const data = doc.data() as PropertyItem;
                    // Set default status if not present
                    const status = data.status || 'pending';
                    setPropertyData({
                        ...data,
                        status
                    });
                    initializeCollapseStates(data.categories);

                    if (data.overall_condition) {
                        setSelectedStatusKey(data.overall_condition as StatusKey);
                    }
                }
            } catch (error) {
                console.log('Error fetching property data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const unsubscribe = navigation.addListener('focus', fetchData);
        return unsubscribe;
    }, [item.id, navigation]);

    const initializeCollapseStates = (categories: CategoryGroup[]) => {
        const newNested: Record<string, boolean> = {};
        const newCollapsed: Record<string, boolean> = {};

        categories.forEach(categoryGroup => {
            Object.entries(categoryGroup).forEach(([catName, catValue]) => {
                newCollapsed[catName] = true;

                catValue.subcategories?.forEach((sub, i) => {
                    newNested[`${catName}-${sub.name}-${i}`] = true;
                });
            });
        });

        setNestedCollapsed(newNested);
        setCollapsedStates(newCollapsed);
    };

    const transformedData = useMemo(() => {
        return propertyData.categories.flatMap(categoryGroup =>
            Object.entries(categoryGroup).map(([type, value]) => ({
                type,
                subcategories: value.subcategories,
            }))
        );
    }, [propertyData.categories]);

    useEffect(() => {
        const newProgress = calculateProgress(propertyData.categories);
        if (newProgress !== propertyData.progress) {
            setPropertyData(prev => ({
                ...prev,
                progress: newProgress,
            }));
        }
    }, [propertyData.categories, calculateProgress]);

    const handleInspectionSubmit = async (
        type: string,
        subcategoryName: string,
        newData: Partial<Subcategory>
    ) => {
        try {
            const updated = { ...propertyData };
            const catGroup = updated.categories.find(group => group[type]);

            if (!catGroup) throw new Error(`Category ${type} not found`);

            const category = catGroup[type];
            const subIndex = category.subcategories.findIndex(sub => sub.name === subcategoryName);

            if (subIndex === -1) throw new Error(`Subcategory ${subcategoryName} not found`);

            const existing = category.subcategories[subIndex];
            const isInitial = !existing.inspection_status && !existing.comment && (!existing.images?.length);

            category.subcategories[subIndex] = { ...existing, ...newData };

            // Calculate new progress
            const newProgress = calculateProgress(updated.categories);

            // Determine the new status
            let newStatus = updated.status;
            if (updated.status === 'pending' || !updated.status) {
                newStatus = 'in-progress';
            }

            // Update both categories, progress and status
            await firestore().collection('properties')
                .doc(item.id)
                .update({
                    categories: updated.categories,
                    progress: newProgress,
                    status: newStatus,
                    update_at: firebase.firestore.FieldValue.serverTimestamp()
                });

            setPropertyData({
                ...updated,
                progress: newProgress,
                status: newStatus,

            });

            Toast.show({
                type: 'success',
                text1: isInitial ? 'Inspection Recorded' : 'Inspection Updated',
                text2: isInitial ? 'Inspection added successfully' : 'Inspection updated successfully',
            });
        } catch (err: unknown) {
            console.log('Update error:', err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: (err as Error).message || 'Failed to save inspection data',
            });
        }
    };

    const handleCompleteInspection = async () => {
        const currentProgress = calculateProgress(propertyData.categories);
        if (currentProgress < 1) {
            Toast.show({
                type: 'error',
                text1: 'Incomplete Inspection',
                text2: 'Please complete all inspections before submitting',
            });
            return;
        }

        if (!selectedStatusKey) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select an inspection status',
            });
            return;
        }

        try {
            setReportLoading(true);

            // Get current timestamp for last inspection date
            const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();
            const lastInspectionDate = new Date();

            // Process and upload images from categories
            const updatedCategories = await Promise.all(
                propertyData.categories.map(async (categoryGroup) => {
                    const updatedGroup: CategoryGroup = {};

                    for (const [categoryName, category] of Object.entries(categoryGroup)) {
                        updatedGroup[categoryName] = {
                            ...category,
                            subcategories: await Promise.all(
                                category.subcategories.map(async (sub) => {
                                    const images = sub.images || [];
                                    const processedImages = await Promise.all(
                                        images.map(async img => {
                                            if (img && !img.startsWith('http')) {
                                                return await uploadImageToCloudinary(img);
                                            }
                                            return img;
                                        })
                                    );

                                    return {
                                        ...sub,
                                        images: processedImages.filter(img => img),
                                        last_inspection_date: lastInspectionDate
                                    };
                                })
                            )
                        };
                    }

                    return updatedGroup;
                })
            );

            const allImages = [...new Set([
                ...(propertyData.images || []),
            ])];

            const propertyUpdateData = {
                overall_condition: selectedStatusKey,
                status: 'Completed',
                progress: 1.0,
                update_at: serverTimestamp,
                last_date_of_inspection: lastInspectionDate,
                categories: updatedCategories,
                images: allImages
            };

            // Prepare report data
            const reportData = {
                status: 'Completed',
                assign_to: propertyData.assign_to,
                name: propertyData.name,
                address: propertyData.address,
                description: propertyData.description,
                progress: 1.0,
                create_at: propertyData.create_at || serverTimestamp,
                update_at: serverTimestamp,
                last_date_of_inspection: lastInspectionDate,
                categories: updatedCategories.map(categoryGroup =>
                    Object.entries(categoryGroup).reduce((acc, [categoryName, category]) => ({
                        ...acc,
                        [categoryName]: {
                            subcategories: category.subcategories.map(sub => ({
                                name: sub.name,
                                inspection_status: sub.inspection_status,
                                comment: sub.comment,
                                images: sub.images || [],
                                last_inspection_date: sub.last_inspection_date
                            }))
                        }
                    }), {})
                ),
                overall_condition: selectedStatusKey,
                signature: null,
                original_property_id: item.id,
                images: allImages,
                original_property_images: propertyData.images || []
            };

            const batch = firebase.firestore().batch();
            const propertyRef = firebase.firestore().collection('properties').doc(item.id);
            batch.update(propertyRef, propertyUpdateData);

            const reportRef = firebase.firestore().collection('reports').doc();
            batch.set(reportRef, reportData);

            await batch.commit();

            // Update local state
            setPropertyData(prev => ({
                ...prev,
                ...propertyUpdateData,
            }));

            Toast.show({
                type: 'success',
                text1: 'Inspection Completed',
                text2: 'Ready for signature',
            });

            changeRoute(navigation, 'Signature', {
                reportId: reportRef.id,
                propertyId: item.id,
                reportData
            });

        } catch (error) {
            console.log('Error completing inspection:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to complete inspection',
            });
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <View style={globalStyles.mainContainer}>
            <HomeProfessionalHeader title="Properties" backIcon={false} />
            <LoaderComponent loading={loading} loaderStyle={{ flex: 1 }} />

            {!loading && <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[globalStyles.paddingContainer,]}>

                    <PropertyCard
                        id={item?.id}
                        name={item.name}
                        address={item.address}
                        progress={propertyData.progress}
                        status={propertyData.status}
                        description={item.description}
                        videoUrl={item.videoUrl}
                        propertyImg={item.images} propertyImgStyle={undefined} />
                </View>
                <FlatList
                    data={transformedData}
                    keyExtractor={(item, index) => `${item.type}-${index}`}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item: category }) => (
                        <CustomAccordion
                            title={category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                            isCollapsed={collapsedStates[category.type]}
                            onPress={() =>
                                setCollapsedStates(prev => ({
                                    ...prev,
                                    [category.type]: !prev[category.type],
                                }))
                            }
                            simpleDropdown
                        >
                            {category.subcategories.map((sub, idx) => {
                                const key = `${category.type}-${sub.name}-${idx}`;
                                return (
                                    <CustomAccordion
                                        key={key}
                                        title={sub.name}
                                        isCollapsed={nestedCollapsed[key]}
                                        onPress={() =>
                                            setNestedCollapsed(prev => ({
                                                ...prev,
                                                [key]: !prev[key],
                                            }))
                                        }
                                    >
                                        <InspectionReport
                                            comment={sub.comment}
                                            status={sub.inspection_status}
                                            type={category.type}
                                            subcategoryName={sub.name}
                                            onPress={(newData: Partial<Subcategory>) =>
                                                handleInspectionSubmit(category.type, sub.name, newData)
                                            }
                                        />
                                    </CustomAccordion>
                                );
                            })}
                        </CustomAccordion>
                    )}
                />

                {/* Inspection Status Section */}
                <View style={{ paddingHorizontal: wp * 0.06 }}>
                    <CustomText style={[globalStyles.adminLabel, { lineHeight: wp * 0.08 }]}>
                        Inspection Status
                    </CustomText>
                    <View style={[globalStyles.textContainer, { paddingVertical: wp * 0 }]}>
                        {statusOptions.map(({ label, key }) => {
                            const isSelected = selectedStatusKey === key;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => setSelectedStatusKey(key)}
                                    activeOpacity={0.7}
                                    style={[globalStyles.checkboxContainer, { marginVertical: wp * 0.02 }]}
                                >
                                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                    <CustomText style={styles.checkboxLabel}>{label}</CustomText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <ButtonPrimary
                        text={reportLoading ? <ActivityIndicator size="small" color={Colors.light} /> : "Complete Inspection"}
                        onPress={handleCompleteInspection} />
                </View>
            </ScrollView>}
        </View>
    );
};

const styles = StyleSheet.create({
    checkboxLabel: {
        marginLeft: 8,
        ...Typography.f_16_nunito_bold,
    },

    radioOuter: {
        width: wp * 0.05,
        height: wp * 0.05,
        borderRadius: wp * 0.025,
        borderWidth: 2,
        borderColor: '#aaa',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp * 0.02,
    },
    radioOuterSelected: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: wp * 0.025,
        height: wp * 0.025,
        borderRadius: wp * 0.0125,
        backgroundColor: Colors.primary,
    },

});

export default Properties;
