import React from 'react';
import { View, StyleSheet, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/types';
import CustomHeader from '../../components/CustomHeader';
import ButtonPrimary from '../../components/ButtonPrimary';
import Colors from '../../utilities/constants/colors';
import ButtonSecondary from '../../components/ButtonSecondary';
import { Inspect } from '../../assets/icons';
import { changeRoute } from '../../services/assynsStorage';
import { hp, wp } from '../../utilities/constants/constant.style';
import globalStyles from '../../utilities/constants/globalStyles';

export default function InspectionScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={globalStyles.mainAuthContainer}>
      <View style={globalStyles.authContainer}>
        <CustomHeader
          title="Inspections"
          subheading="Smart Inspections, made easy."
        />
        <View style={globalStyles.bodyContainer}>
          <Inspect />
          <View style={styles.buttonContainer}>
            <ButtonPrimary
              text="Login"
              onPress={() => navigation.navigate('Login')}
              btnPrimaryStyle={{ width: wp * 0.9, }}
            />
            <ButtonSecondary
              text="Register"
              onPress={() => changeRoute(navigation, 'RegisterScreen')}
              color={Colors.light}
              btnPrimaryStyle={{ width: wp * 0.9, }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
