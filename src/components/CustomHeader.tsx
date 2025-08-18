import React from 'react';
import { BackHandler, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Colors from '../utilities/constants/colors';
import { hp, Typography, wp } from '../utilities/constants/constant.style';
import { ArrowLeft } from '../assets/icons';
import CustomText from './CustomText';
import { changeRoute } from '../services/assynsStorage';
import { StatusBar } from 'react-native';

interface CustomHeaderProps {
  title: string;
  subheading?: string;
  text?: string;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  subheading,
  text,
}) => {
  const navigation = useNavigation();
  const route = useRoute();

  const onBackPress = () => {
    if (route.name === 'Inspection') {
      BackHandler.exitApp();
    } else {
      changeRoute(navigation, 'pop');
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBackPress}
          style={styles.backButton}>
          <ArrowLeft />
        </TouchableOpacity>
        <CustomText style={styles.title}>{title}</CustomText>
      </View>
      <View style={styles.subHeader}>
        {subheading && <CustomText style={styles.subtitle}>{subheading}</CustomText>}
        {text && <CustomText style={styles.description}>{text}</CustomText>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    height: hp * 0.26,
    borderBottomLeftRadius: hp * 0.09,
    alignItems: "flex-start",
    paddingHorizontal: wp * 0.06,
    paddingTop: wp * 0.067,
    paddingBottom: wp * 0.05
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderColor: Colors.light,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  title: {
    color: Colors.light,
    flex: 1,
    textAlign: 'center',
    marginRight: 36,
    ...Typography.f_20_nunito_bold,
  },
  subHeader: {
    marginTop: wp * 0.07,
  },
  subtitle: {
    color: Colors.light,
    ...Typography.f_22_nunito_medium,
  },
  description: {
    marginTop: wp * 0.03,
    color: Colors.light,
    ...Typography.f_18_nunito_light,
  },
});

export default CustomHeader;
