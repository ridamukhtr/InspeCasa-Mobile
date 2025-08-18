import { Platform, StyleSheet, ViewStyle } from 'react-native';
import Colors from './colors';
import { hp, Typography, wp } from './constant.style';
import { RFValue } from 'react-native-responsive-fontsize';

const globalStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: Colors.light,
        justifyContent: "space-between",
        alignItems: "center",
    },
    defaultTxt: {
        color: Colors.black,
        fontWeight: 'normal',
        ...Typography.f_12_nunito_medium
    } as ViewStyle,
    mainContainer: { backgroundColor: Colors.light, flex: 1, },
    paddingContainer: { paddingHorizontal: RFValue(10, wp), paddingTop: hp * 0.04 },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        padding: 2,
        backgroundColor: Colors.primary,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statusText: {
        ...Typography.f_16_nunito_medium,
        color: Colors.black,
    },
    messageTxt: { ...Typography.f_15_nunito_medium },
    Imgcontainer: {
        flexDirection: 'row',
        gap: 10,
        backgroundColor: Colors.light,
        alignItems: 'center',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 150 / 1,
    },
    messageContent: {
        flex: 1,
    },
    description: { color: Colors.grayDark, fontSize: 14, fontWeight: '400', },
    adminLabel: {
        ...Typography.f_17_nunito_extra_bold,
        color: Colors.black,
        lineHeight: wp * 0.06,
    },

    inputContainer: {
        justifyContent: "space-between",
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light,
        borderRadius: wp * 0.010,
        borderWidth: 1,
        borderColor: Colors.lightSecondary,
        paddingHorizontal: wp * 0.027,
        paddingVertical: hp * 0.012,

    },
    text: {
        flex: 1,
        ...Typography.f_12_nunito_medium,
        color: Colors.black,
        padding: 0,
    },

    textContainer: {
        borderRadius: 4,
        paddingVertical: wp * 0.03,
        paddingHorizontal: wp * 0.03,
        marginBottom: wp * 0.08,
        borderColor: Colors.lightSecondary,
        borderWidth: 1
    },

    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: wp * 0.05,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: Colors.dropGray,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },

    mainAuthContainer: { alignItems: "center", backgroundColor: Colors.primary, flex: 1 },
    bodyContainer: {
        backgroundColor: Colors.light,
        alignItems: "center",
        width: "100%",
        position: "absolute",
        top: hp * 0.26,
        borderTopRightRadius: hp * 0.09,
        flex: 1,
        height: hp
    },
    authContainer: {
        width: "100%",
        alignItems: "center",
        backgroundColor: Colors.light,
        marginHorizontal: wp * 0.05
    },

    checkBoxText: {
        ...Typography.f_14_nunito_semi_bold
    },
    blueText: {
        color: Colors.primary
    },
    scrollContainer: {
        flex: 1,
        paddingTop: wp * 0.04,
        borderTopRightRadius: hp * 0.09,
    },
    socialLoginButtonWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: wp * 0.03,
        alignItems: "center",
        marginVertical: hp * 0.04,
    },
    socialButtonWrapper: {
        borderWidth: 0.5,
        borderColor: Colors.primary,
        borderRadius: 150 / 1,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

    accountNavigationWrapper: {
        height: hp * 0.5,
        alignItems: "center",
    },

    errorText: {
        color: Colors.Red,
        alignSelf: 'flex-start',
        marginLeft: 10,
        marginBottom: 5,
        ...Typography.f_14_nunito_regular,
    },
    initialsContainer: {
        width: 50,
        height: 50,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsContainerHome: {

        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    initialsText: {
        ...Typography.f_36_nunito_bold,
        color: Colors.light,
    },

    emptyText: {
        ...Typography.f_16_nunito_semi_bold,
        fontWeight: "600",
    },
    emptyContainer: { alignItems: 'center', justifyContent: "center", marginTop: 20 }

});

export default globalStyles;

