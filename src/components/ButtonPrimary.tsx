import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from '../utilities/constants/colors';
import { Typography } from '../utilities/constants/constant.style';
import CustomText from './CustomText';

const ButtonPrimary = ({ onPress, text, btnPrimaryText, btnPrimaryStyle, loading }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.btnPrimary, btnPrimaryStyle]}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={Colors.light} />
      ) : (
        <CustomText style={[styles.btnPrimaryText, btnPrimaryText]}>{text}</CustomText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnPrimary: {
    justifyContent: 'center',
    alignItems: 'center',
    // width: 360,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    marginVertical: 10,
  },
  btnPrimaryText: {
    color: Colors.light,
    ...Typography.f_16_nunito_bold,
  },
});

export default ButtonPrimary;
