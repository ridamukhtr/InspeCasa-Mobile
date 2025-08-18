import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader'
import AuthIcon from '../../assets/icons/AuthanticaterEnabled.svg';
import Colors from '../../utilities/constants/colors';
import { Typography } from '../../utilities/constants/constant.style';
import CustomText from '../../components/CustomText';
const AuthanticaterEnabled = () => {
    return (
        <View style={styles.container}>
            <HomeProfessionalHeader title={'Authanticater Enabled'} />
            <View style={styles.smallContainer}>
                <View style={styles.iconContainer}>
                    <AuthIcon width={100} height={100} />
                    <CustomText style={styles.smallHeading}>Forget password Successfully!</CustomText>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    smallContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: '5%',
    },
    iconContainer:{
        justifyContent:"center",
        alignItems:"center",
        padding:30
    },
    smallHeading: {
        color: Colors.dark,
        margin:10,
        padding:10,
        ...Typography.f_17_nunito_bold
    }
})

export default AuthanticaterEnabled
