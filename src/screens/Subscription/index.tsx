import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Modal,
    KeyboardAvoidingView,
} from 'react-native';
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader';
import globalStyles from '../../utilities/constants/globalStyles';
import Colors from '../../utilities/constants/colors';
import CustomText from '../../components/CustomText';
import { hp, IS_IOS, Typography, wp } from '../../utilities/constants/constant.style';
import { Import } from '../../assets/icons'
import ButtonPrimary from '../../components/ButtonPrimary';
import ButtonSecondary from '../../components/ButtonSecondary';
import ConfirmationModal from '../../components/Modal';
import LoaderComponent from '../../components/LoaderComponent';
import { useSubscription } from '../../services/hooks/useSubscription';
import WebView from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useKeyboardVisibility from '../../services/hooks/useKeyboardVisibility';
import SubscritionSkeleton from './SubscritionSkeleton';


const SubscriptionScreen = () => {
    const {
        loading,
        refreshing,
        products,
        selectedProduct,
        showConfirmationModal,
        modalMessage,
        showWebView,
        checkoutUrl,
        setShowWebView,
        setSelectedProduct,
        handlePayment,
        handleConfirmPlanChange,
        handleCancelPlanChange,
        getButtonLabel, handleRefresh
    } = useSubscription();
    const { modalHeight } = useKeyboardVisibility()

    const handleCloseWebView = () => {
        setShowWebView(false);
        handleRefresh();
    }

    return (
        <View style={globalStyles.mainContainer}>
            <HomeProfessionalHeader title="Price Table" backIcon={false} />
            {loading ? (
                <SubscritionSkeleton />
            ) : (
                <ScrollView refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.primary]}
                    />
                } style={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={[globalStyles.paddingContainer,]}>
                        {/* Tab Selection */}
                        <View style={styles.tabContainer}>
                            {products.map((product) => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={[
                                        styles.tab,
                                        selectedProduct?.id === product.id && styles.activeTab
                                    ]}
                                    onPress={() => setSelectedProduct(product)}
                                    activeOpacity={0.8}
                                >
                                    <CustomText style={[
                                        styles.tabText,
                                        selectedProduct?.id === product.id && styles.activeTabText
                                    ]}>
                                        {product.name}
                                    </CustomText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <LoaderComponent loading={loading} loaderStyle={{ height: hp * 0.65 }} />

                        {!loading && selectedProduct && (
                            <View style={styles.contentContainer}>
                                <View style={styles.iconContainer}>
                                    <Import />
                                </View>
                                <CustomText style={styles.planTitle}>{"Upgrade to "}{selectedProduct.name}</CustomText>

                                {selectedProduct.description && (
                                    <CustomText style={styles.planDescription}>
                                        {selectedProduct.description}
                                    </CustomText>
                                )}
                                {/* Pricing Card */}
                                <View style={styles.pricingCard}>
                                    <View style={styles.serviceLabel}>
                                        <CustomText style={styles.serviceLabelText}>Home Inspection</CustomText>
                                    </View>

                                    {selectedProduct?.prices?.map((price: { id: React.Key | null | undefined; recurring: { interval_count: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; interval: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }; unit_amount: number; }) => (
                                        <View key={price.id}>
                                            <CustomText style={styles.duration}>
                                                {price?.recurring?.interval_count &&
                                                    price.recurring.interval_count < 10 ?
                                                    `0${price.recurring.interval_count}` :
                                                    price.recurring.interval_count}
                                            </CustomText>
                                            <CustomText style={styles.period}>
                                                ${price?.unit_amount / 100}
                                            </CustomText>
                                            <CustomText style={[styles.period, { textDecorationLine: "none" }]}>
                                                {price?.recurring?.interval}
                                            </CustomText>
                                        </View>
                                    ))}
                                </View>

                                {/* Subscribe Button */}
                                {getButtonLabel() === "Active" ? (
                                    <ButtonPrimary
                                        text="Active"
                                        btnPrimaryStyle={{ width: "100%" }}
                                        btnPrimaryText={[globalStyles.adminLabel, { color: Colors.light }]}
                                        disabled
                                    />
                                ) : (
                                    <ButtonSecondary
                                        btnPrimaryStyle={{ width: "100%" }}
                                        text={getButtonLabel()}
                                        onPress={handlePayment}
                                    />
                                )}

                                {/* Billing Information */}
                                <View style={styles.billingInfo}>
                                    <CustomText style={styles.billingTitle}>When will I be billed?</CustomText>
                                    <CustomText style={{ textAlign: "center" }}>
                                        You'll be charged at the end of your free trial (if you have one) or right after you confirm your subscription.
                                    </CustomText>
                                </View>
                            </View>
                        )}
                    </View>
                    <ConfirmationModal
                        visible={showConfirmationModal}
                        message={modalMessage}
                        onConfirm={handleConfirmPlanChange}
                        onCancel={handleCancelPlanChange}
                        confirmText="Confirm"
                        cancelText="Cancel"
                    />

                    <Modal
                        visible={showWebView}
                        animationType="slide"
                        onRequestClose={handleCloseWebView}
                        transparent={true}
                    >
                        <KeyboardAvoidingView
                            behavior={IS_IOS ? 'padding' : 'height'}
                            style={styles.modalOverlay}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.bottomSheet(modalHeight)}>
                                    <View style={styles.handleBar} />

                                    <TouchableOpacity
                                        onPress={handleCloseWebView}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close-circle" size={25} color={Colors.primary} />
                                    </TouchableOpacity>

                                    <View style={styles.webViewContainer}>
                                        <WebView
                                            source={{ uri: checkoutUrl }}
                                            onNavigationStateChange={(navState) => {
                                                if (navState.url.includes('success')) {
                                                    setShowWebView(false);
                                                    handleRefresh();
                                                }
                                                if (navState.url.includes('cancel')) {
                                                    setShowWebView(false);
                                                }
                                            }}
                                            startInLoadingState={true}

                                        />
                                    </View>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Modal>


                </ScrollView>
            )}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.light,
        borderRadius: 8,
        borderColor: Colors.primary,
        borderWidth: 1,
        alignItems: "center"
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 4,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        ...Typography.f_14_nunito_semi_bold,
    },
    activeTabText: {
        color: Colors.light,
    },
    contentContainer: {
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: wp * 0.085,
        marginTop: wp * 0.1,
    },
    planTitle: {
        ...Typography.f_20_nunito_bold,
        color: Colors.primary,
        lineHeight: wp * 0.08,
        textDecorationLine: 'underline',

    },
    planDescription: {
        ...Typography.f_14_nunito_medium,
        marginBottom: 32,
    },
    pricingCard: {
        backgroundColor: Colors.light,
        borderRadius: 4,
        borderColor: Colors.primary,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: wp * 0.06
    },
    serviceLabel: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 5,
    },
    serviceLabelText: {
        color: Colors.light,
        fontSize: 14,
        fontWeight: '600',
    },
    duration: {
        ...Typography.f_36_nunito_bold,
        color: Colors.black,
        textDecorationLine: 'underline',
    },
    period: {
        ...Typography.f_16_nunito_regular,
        color: '#6b7280',
        marginBottom: wp * 0.02,
        textDecorationLine: 'underline',
    },
    subscribeButton: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
    },
    subscribeButtonText: {
        color: Colors.light,
        fontSize: 16,
        fontWeight: '600',
    },
    billingInfo: {
        alignItems: 'center',
        paddingVertical: 22,
    },
    billingTitle: {
        ...Typography.f_16_nunito_bold,
        marginBottom: 8,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: (modalHeight: number) => ({
        height: modalHeight,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    }),
    handleBar: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 15,
    },

    closeButton: {
        justifyContent: 'center',
        alignItems: "flex-end",
        paddingHorizontal: 15,
    },
    webViewContainer: {
        flex: 1,
        overflow: 'hidden',
    },


});

export default SubscriptionScreen;
