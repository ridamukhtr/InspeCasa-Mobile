import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native'
import { RootStackParamList } from '../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hp, Typography, wp } from '../utilities/constants/constant.style';
import Colors from '../utilities/constants/colors';
import CustomText from './CustomText';

const HomeProfessionalHeader = ({ title, backIcon }: { title: string, backIcon: boolean }) => {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const handleNavigate = () => {
        navigation.goBack()
    }

    return (
        <View >
            {backIcon ? (<View>
                <CustomText style={{ ...Typography.f_16_nunito_bold, fontWeight: "bold", textAlign: "center" }}>{title}</CustomText>

            </View>
            ) : (
                <View style={styles.container}>
                    <TouchableOpacity style={styles.arrowButton} onPress={handleNavigate}>
                        <Image
                            style={{ height: 20, width: 20 }}
                            source={require("../assets/icons/header_arrow.png")}
                        />
                    </TouchableOpacity>
                    <CustomText style={{ ...Typography.f_16_nunito_bold, fontWeight: "bold", textAlign: "center" }}>{title}</CustomText>
                    <View style={{ height: 20, width: 20 }}>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        paddingHorizontal: wp * 0.05,
        paddingTop: hp * 0.030
    },
    arrowButton: {
        borderColor: Colors.grayDark,
        borderWidth: 2,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5
    },
})

export default HomeProfessionalHeader
