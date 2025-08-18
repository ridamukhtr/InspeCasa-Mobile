import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from '../utilities/constants/colors';
import { Typography } from '../utilities/constants/constant.style';

const ButtonSecondary = ({ onPress, text, color, btnPrimaryStyle }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.btnPrimary, btnPrimaryStyle]}
      onPress={onPress}>
      <Text style={styles.btnPrimaryText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnPrimary: {
    justifyContent: 'center',
    alignItems: 'center',
    // width: 360,
    height: 50,
    backgroundColor: Colors.light,
    borderRadius: 5,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnPrimaryText: {
    color: Colors.primary,
    ...Typography.f_17_nunito_black,
  },
});

export default ButtonSecondary;
