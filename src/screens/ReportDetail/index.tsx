import { ActivityIndicator, FlatList, Image, PermissionsAndroid, Platform, ScrollView, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader'
import globalStyles from '../../utilities/constants/globalStyles'
import PropertyCard from '../../components/PropertyCard'
import CustomAccordion from '../../components/CustomAccrodian'
import CustomText from '../../components/CustomText'
import InspectionReport from '../../components/InspectionReport'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { hp, Typography, wp } from '../../utilities/constants/constant.style'
import Colors from '../../utilities/constants/colors'
import ButtonPrimary from '../../components/ButtonPrimary'
import ButtonSecondary from '../../components/ButtonSecondary'
import { useNavigation } from '@react-navigation/native'
import { changeRoute } from '../../services/assynsStorage'
import Toast from 'react-native-toast-message'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { Category, Report, ReportDetailScreenProps, RootState } from '../../types/types'
import firestore from '@react-native-firebase/firestore';
import LoaderComponent from '../../components/LoaderComponent'
import { formatDateOnly, requestStoragePermission } from '../../services/hooks/useCustomHooks'
import useReportDetail from '../../services/hooks/useReportDetail'
import { useSelector } from 'react-redux'


const ReportDetailScreen: React.FC<ReportDetailScreenProps> = ({ route, propertyImgStyle, backIcon }) => {
    const navigation = useNavigation();
    // const {
    //     reports,
    //     propertyData,
    //     loading,
    //     downloadloading,
    //     collapsedStates,
    //     nestedCollapsed,
    //     signatureUrl,
    //     signedDate,
    //     inspectorName,
    //     setNestedCollapsed,
    //     toggleCollapse,
    //     generatePDF,
    // } = useReportDetail(route.params?.reportId, route.params?.inspectorName);
    const [propertyData, setPropertyData] = useState<Category[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloadloading, setDownloading] = useState(false);
    const [collapsedStates, setCollapsedStates] = useState<Record<string, boolean>>({});
    const [nestedCollapsed, setNestedCollapsed] = useState<Record<string, boolean>>({});
    const [reports, setReports] = useState<Report>({});

    const { reportId, inspectorName } = route.params || {};
    const userId = useSelector((state: RootState) => state?.auth?.user?.userId);
    const signatureUrl = reports?.signature?.url || null;

    const signatureDate = reports?.signature?.timestamp?.seconds || null;
    const signedDate = signatureDate
        ? formatDateOnly(signatureDate)
        : "Not signed"

    const transformReportData = (reportData: { categories: any[] }) => {
        if (!reportData.categories || !reportData.categories[0]) return [];

        const categories = reportData.categories[0];
        const result = [];

        // Loop through each category (bathroom, masterBedroom, etc.)
        for (const [categoryName, categoryData] of Object.entries(categories)) {
            const subcategories = categoryData.subcategories.map(sub => ({
                name: sub.name,
                inspection_status: sub.inspection_status,
                comment: sub.comment,
                images: sub.images
            }));

            result.push({
                type: categoryName,
                subcategories: subcategories
            });
        }

        return result;
    };

    useEffect(() => {
        const fetchReport = async () => {
            try {
                if (!reportId) return;

                const documentSnapshot = await firestore()
                    .collection('reports')
                    .doc(reportId)
                    .get();

                if (documentSnapshot.exists()) {
                    const reportData = documentSnapshot.data();
                    setReports(reportData);
                    // Transform the data for FlatList
                    setPropertyData(transformReportData(reportData));
                } else {
                    console.log('No report found for the given ID');
                }
            } catch (error) {
                console.log('Error fetching report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    const toggleCollapse = (key: string) => {
        setCollapsedStates((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const generatePDF = async () => {
        try {
            // Request storage permission (Android)
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Denied',
                    text2: 'You must allow storage access to save PDF.',
                });
                return;
            }

            // Format date from Firebase timestamp
            const formatDate = (timestamp: { seconds: number }) => {
                if (!timestamp?.seconds) return 'N/A';
                const date = new Date(timestamp.seconds * 1000);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            // Status color mapping
            const getStatusColor = (status: string) => {
                switch (status.toLowerCase()) {
                    case 'completed': return '#4CAF50';
                    case 'in progress': return '#FFC107';
                    case 'pending': return '#9E9E9E';
                    default: return '#2196F3';
                }
            };

            // Condition color mapping
            const getConditionColor = (condition: string) => {
                switch (condition.toLowerCase()) {
                    case 'dirty': return '#d73038';
                    case 'damaged': return '#d73038';
                    default: return '#4CAF50';
                }
            };

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Inspection Report</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #008080;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #008080;
            margin-bottom: 5px;
        }
        .header .subtitle {
            color: #666;
            font-size: 16px;
        }
        .property-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .info-item strong {
            display: inline-block;
            width: 150px;
            color: #555;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 13px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            color: white;
        }
        .section-title {
            background-color: #008080;
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            margin: 25px 0 15px 0;
            font-size: 18px;
        }
        .category {
            margin-bottom: 25px;
        }
        .category-title {
            font-weight: bold;
            font-size: 16px;
            color: #444;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px dashed #ddd;
        }
        .subcategory {
            margin-left: 15px;
            margin-bottom: 15px;
        }
        .subcategory-title {
            font-weight: bold;
            color: #555;
        }
        .subcategory-details {
            margin-left: 15px;
            margin-top: 5px;
        }
        .signature-section {
            margin-top: 40px;
            text-align: center;
        }
        .signature-img {
            max-width: 200px;
            height: auto;
            margin-top: 10px;
            border-top: 1px solid #333;
            padding-top: 10px;
            display: inline-block;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        .image-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 10px;
        }
        .image-item {
            border: 1px solid #ddd;
            padding: 5px;
            text-align: center;
        }
        .image-item img {
            max-width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Property Inspection Report</h1>
        <div class="subtitle">Comprehensive property condition assessment</div>
    </div>

    <div class="property-info">
        <div class="info-grid">
            <div class="info-item">
                <strong>Property Name:</strong> ${reports?.name || 'N/A'}
            </div>
            <div class="info-item">
                <strong>Address:</strong> ${reports?.address || 'N/A'}
            </div>
            <div class="info-item">
                <strong>Inspection Date:</strong> ${formatDate(reports?.create_at)}
            </div>
            <div class="info-item">
                <strong>Last Updated:</strong> ${formatDate(reports?.update_at)}
            </div>
            <div class="info-item">
                <strong>Status:</strong> 
                <span class="status-badge" style="background-color: ${getStatusColor(reports?.status)};">
                    ${reports?.status || 'N/A'}
                </span>
            </div>
            <div class="info-item">
                <strong>Overall Condition:</strong> 
                <span class="status-badge" style="background-color: ${getConditionColor(reports?.overall_condition)};">
                    ${reports?.overall_condition || 'N/A'}
                </span>
            </div>
        </div>
        <div class="info-item">
            <strong>Description:</strong> ${reports?.description || 'No description provided'}
        </div>
    </div>

    <div class="section-title">Inspection Details</div>

    ${reports?.categories?.map((category: { [s: string]: unknown } | ArrayLike<unknown>) => {
                return Object.entries(category).map(([categoryName, categoryData]) => `
            <div class="category">
                <div class="category-title">${categoryName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                ${categoryData?.subcategories?.map((subcategory: { name: any; inspection_status: any; comment: any; images: any[] }) => `
                    <div class="subcategory">
                        <div class="subcategory-title">${subcategory.name}</div>
                        <div class="subcategory-details">
                            <strong>Status:</strong> ${subcategory.inspection_status}<br>
                            <strong>Comments:</strong> ${subcategory.comment || 'No comments'}<br>
                            ${subcategory.images?.length > 0 ? `
                                <strong>Images:</strong>
                                <div class="image-grid">
                                    ${subcategory.images.map((image: any) => `
                                        <div class="image-item">
                                            <img src="${image}" alt="Inspection Image">
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<strong>Images:</strong> No images'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('')
            }).join('') || '<p>No inspection categories found</p>'}

    ${reports?.signature?.signature ? `
        <div class="signature-section">
            <div><strong>Inspector's Signature</strong></div>
            <img class="signature-img" src="${reports.signature.signature}" alt="Signature">
            <div>Date: ${formatDate(reports.update_at)}</div>
        </div>
    ` : ''}

    <div class="footer">
        This report was generated automatically on ${new Date().toLocaleDateString()}.<br>
        © ${new Date().getFullYear()} Property Inspection System. All rights reserved.
    </div>
</body>
</html>
`;

            const options = {
                html: htmlContent,
                fileName: `Inspection_Report_${reports?.name?.replace(/\s+/g, '_') || Date.now()}`,
                directory: 'Documents',
            };

            const pdf = await RNHTMLtoPDF.convert(options);

            if (!pdf.filePath) {
                throw new Error('PDF generation failed');
            }

            const baseName = `Inspection_Report_${reports?.name?.replace(/\s+/g, '_') || Date.now()}`;
            let downloadPath = `${RNFS.DownloadDirectoryPath}/${baseName}.pdf`;
            let counter = 1;

            while (await RNFS.exists(downloadPath)) {
                downloadPath = `${RNFS.DownloadDirectoryPath}/${baseName} (${counter}).pdf`;
                counter++;
            }
            await RNFS.moveFile(pdf.filePath, downloadPath);
            const fileExists = await RNFS.exists(downloadPath);

            if (fileExists) {
                Toast.show({
                    type: 'success',
                    text1: 'PDF Downloaded',
                    text2: `Saved as ${downloadPath.split('/').pop()}`,
                });
            } else {
                throw new Error('File not found after move');
            }

        } catch (err) {
            console.error('PDF Error:', err);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not save PDF: ' + (err.message || 'Unknown error'),
            });
        }
    };

    console.log("items", reports);

    return (

        <View style={globalStyles.mainContainer}>
            <HomeProfessionalHeader title="Report Details" backIcon={backIcon} />
            <LoaderComponent loading={loading} loaderStyle={{ flex: 1 }} />

            {!loading &&
                <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                    <View style={globalStyles.paddingContainer}>
                        <PropertyCard
                            name={reports?.name}
                            description={reports?.description}
                            address={reports?.address}
                            status={reports?.status}
                            progress={reports?.progress}
                            propertyImgStyle={propertyImgStyle} propertyImg={reports.images} />
                    </View>

                    <FlatList
                        data={propertyData}
                        keyExtractor={(item) => item.type}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        scrollEnabled={false}
                        renderItem={({ item: category }) => (
                            <CustomAccordion
                                title={category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                                isCollapsed={collapsedStates[category.type]}
                                onPress={() => toggleCollapse(category.type)}
                                simpleDropdown={true}
                            >
                                {category.subcategories.map((sub, index) => {
                                    const key = `${category.type}_${sub.name}_${index}`;
                                    return (
                                        <CustomAccordion
                                            key={key}
                                            title={sub.name}
                                            isCollapsed={nestedCollapsed[key]}
                                            onPress={() => setNestedCollapsed(prev => ({
                                                ...prev,
                                                [key]: !prev[key],
                                            }))}
                                        >
                                            <InspectionReport
                                                disable={true}
                                                status={sub.inspection_status}
                                                comment={sub.comment}
                                                reportImages={sub.images || []}
                                                subcategoryName={sub.name}
                                                isSubmit={false}
                                                isReportView={true}
                                            />
                                        </CustomAccordion>
                                    );
                                })}
                            </CustomAccordion>
                        )}
                    />

                    <View style={[globalStyles.paddingContainer, { paddingTop: hp * 0.01, }]}>
                        <CustomText style={styles.header}>Overall Condition</CustomText>

                        {/* Status Card */}
                        <View style={styles.statusCard}>
                            <View style={globalStyles.statusContainer}>
                                <View style={globalStyles.statusIcon}>
                                    <Icon name="check" size={16} color={Colors.light} />
                                </View>
                                <CustomText style={globalStyles.statusText}>
                                    {reports?.overall_condition || 'N/A'}
                                </CustomText>
                            </View>
                        </View>

                        <View >
                            <View style={styles.detailRow}>
                                <CustomText style={styles.detailLabel}>Date:</CustomText>
                                <View >
                                    <CustomText style={styles.detailValue}>{signedDate}</CustomText>
                                    <View style={styles.underline} />
                                </View>
                            </View>

                            {/* Inspector */}
                            <View style={styles.detailRow}>
                                <CustomText style={styles.detailLabel}>Inspector:</CustomText>
                                <View>
                                    <CustomText style={styles.detailValue}>
                                        {inspectorName}
                                    </CustomText>
                                    <View style={styles.underline} />
                                </View>
                            </View>

                            {/* Signature */}
                            <View style={[styles.detailRow,]}>
                                <CustomText style={styles.detailLabel}>Signature:</CustomText>
                                <View >
                                    {signatureUrl ? (
                                        <Image
                                            style={styles.signatureImage}
                                            source={{ uri: signatureUrl }}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <CustomText style={styles.signatureText}>No signature available</CustomText>
                                    )}
                                    <View style={styles.underline} />
                                </View>
                            </View>
                        </View>
                        <ButtonPrimary
                            text={downloadloading ? <ActivityIndicator size={'small'} color={Colors.light} /> : "Download PDF"}
                            btnPrimaryText={styles.screenshotButtonText}
                            onPress={generatePDF}
                        />

                        <ButtonSecondary text={"Back"} onPress={() =>
                            changeRoute(navigation, 'Tabs', { screen: 'HistoryTab' }, true)
                        }
                        />
                    </View>

                </ScrollView>
            }
        </View>
    )
}

export default ReportDetailScreen

const styles = StyleSheet.create({
    header: {
        ...Typography.f_16_nunito_bold,
        fontWeight: '700',
        color: Colors.black,
    },
    statusCard: {
        backgroundColor: Colors.light,
        borderRadius: 8,
        borderColor: Colors.grayLight,
        borderWidth: 1,
        padding: wp * 0.04,
        marginTop: wp * 0.02,
        marginBottom: 32,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.black,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 24,
        gap: 10
    },
    detailLabel: {
        ...Typography.f_15_nunito_extra_bold,
        color: Colors.black,
    },

    detailValue: {
        ...Typography.f_14_nunito_regular,
        bottom: wp * 0.01,
        color: Colors.black,
        textAlign: "center"
    },
    signatureText: {
        ...Typography.f_14_nunito_regular,
        color: Colors.black,
        fontStyle: 'italic',
        fontFamily: 'cursive',
        bottom: wp * 0.01,
        textAlign: "center"
    },
    underline: {
        bottom: wp * 0.01,
        width: wp * 0.5,
        alignItems: 'center',
        justifyContent: "center",
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#000000',

    },
    screenshotButtonText: {
        color: Colors.light,
        fontSize: 15,
        fontWeight: '600',
    },
    signatureImage: {
        width: 120,
        height: 40,
        marginBottom: 5,
    },
})