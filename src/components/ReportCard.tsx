import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, } from 'react-native';
import { Delete, Download, Eye } from '../assets/icons';
import Colors from '../utilities/constants/colors';
import { hp, Typography, wp } from '../utilities/constants/constant.style';
import CustomText from './CustomText';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { changeRoute } from '../services/assynsStorage';
import ConfirmationModal from './Modal';
import ReportDetailScreen from '../screens/ReportDetail';
import { ReportCardProps, RootStackParamList } from '../types/types';
import useReportDetail from '../services/hooks/useReportDetail';

const ReportCard: React.FC<ReportCardProps> = ({
    id,
    name,
    inspectionImg,
    address,
    date,
    status,
    inspectorName,
    onDelete,
    signDate,
    signatureUrl,
}) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [showModal, setShowModal] = useState(false);
    const [isReportModalVisible, setReportModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState<{ id: string; inspectorName: string; } | null>(null);

    const { generatePDF, downloadloading } = useReportDetail(id, inspectorName);

    const handleViewReport = () => {
        setSelectedReport({
            id,
            inspectorName,
        });
        setReportModalVisible(true);
    };

    const handleConfirm = () => {
        onDelete?.(id);
        setShowModal(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", justifyContent: "center", }}>
                        <Image
                            source={inspectionImg ? { uri: inspectionImg } : require("../assets/images/reportimg.png")}
                            style={styles.propertyImage}
                        />
                        <View style={styles.propertyInfo}>
                            <CustomText style={styles.propertyName}>{name}</CustomText>
                            <CustomText style={styles.propertyAddress}>{address}</CustomText>
                            <CustomText style={styles.inspectionDate}>{date}</CustomText>
                        </View>
                    </View>
                    <View style={styles.btnContainer}>
                        <TouchableOpacity
                            onPress={() => changeRoute(navigation, 'ReportDetail', { reportId: id, inspectorName: inspectorName })}
                        >
                            <CustomText style={styles.viewReportText}>View Report</CustomText>
                        </TouchableOpacity>
                        {/* Icons Row */}
                        <View style={styles.iconsRow}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => handleViewReport()}
                            >
                                <Eye />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={generatePDF} style={styles.iconButton} >
                                {downloadloading ? <ActivityIndicator size={13} color={Colors.primary} /> : <Download />}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={() => setShowModal(true)}>
                                <Delete />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Condition and Damage Section */}
                <View style={styles.statusSection}>
                    <View style={styles.statusRow}>
                        <CustomText style={styles.statusLabel}>Condition:</CustomText>
                        <CustomText style={styles.statusLabel}>{status || 'Pending'}</CustomText>
                    </View>
                </View>

                {/* Inspector Section */}
                <View style={styles.inspectorSection}>
                    <CustomText style={styles.statusLabel}>Inspector :</CustomText>
                    <CustomText style={styles.statusLabel}>{inspectorName}</CustomText>
                </View>

                {/* Signature and Date Section */}
                <View style={styles.bottomSection}>
                    <View style={styles.signatureSection}>
                        <CustomText style={styles.statusLabel}>Signature :</CustomText>
                        {signatureUrl && (
                            <Image style={styles.signatureText} source={{ uri: signatureUrl }} />
                        )}
                    </View>
                    <View style={styles.dateSection}>
                        <CustomText style={styles.statusLabel}>Date :</CustomText>
                        <CustomText style={styles.statusLabel}>{signDate || ' no date'}</CustomText>
                    </View>
                </View>
            </View>

            <ConfirmationModal
                visible={showModal}
                message="Are you sure you want to delete the inspection?"
                onCancel={() => setShowModal(false)}
                onConfirm={handleConfirm}
                confirmText="Yes"
                cancelText="Cancel"
            />
            <Modal
                visible={isReportModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setReportModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {selectedReport && (
                            <ReportDetailScreen
                                propertyImgStyle={{ width: wp * 0.8 }}
                                backIcon={true}
                                route={{
                                    params: {
                                        reportId: selectedReport.id,
                                        inspectorName: selectedReport.inspectorName,
                                    }
                                }}
                            />
                        )}
                    </View>
                </View>
            </Modal>

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
    propertyName: {
        ...Typography.f_14_nunito_bold,
        fontWeight: '500',
        color: Colors.dark,
    },
    propertyAddress: {
        ...Typography.f_14_nunito_regular,
        color: Colors.dark,
    },
    btnContainer: { alignItems: "center", justifyContent: "space-between", gap: hp * 0.018, },
    inspectionDate: {
        ...Typography.f_12_nunito_medium,
        fontSize: 10,
        color: Colors.dark,
    },
    viewReportText: {
        ...Typography.f_14_nunito_extra_bold,
        color: Colors.primary,
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
    statusLabel: {
        ...Typography.f_12_nunito_bold,
        color: Colors.black,
    },
    inspectorSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 7,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 16,
    },
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: 16,
        borderTopWidth: 1,
        paddingBottom: 10,
        borderTopColor: '#e0e0e0',
    },
    signatureSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    signatureText: {
        width: 120,
        height: 40,
        overflow: "hidden"
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: Colors.light,
        borderRadius: 10,
        width: '90%',
        height: '90%',
        paddingVertical: wp * 0.07,
        // paddingHorizontal: wp * 0.007,
    },


});

export default ReportCard;