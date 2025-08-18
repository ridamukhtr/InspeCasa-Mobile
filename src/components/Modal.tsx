import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Typography, wp } from '../utilities/constants/constant.style';
import Colors from '../utilities/constants/colors';
import CustomText from './CustomText';
import ButtonSecondary from './ButtonSecondary';
import ButtonPrimary from './ButtonPrimary';

interface ConfirmationModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Yes',
  cancelText = 'Cancel',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <CustomText style={styles.modalMessage}>{message}</CustomText>

          <View style={styles.buttonContainer}>
            <ButtonSecondary
              text={cancelText}
              onPress={onCancel}
              btnPrimaryStyle={styles.button}
            />
            <ButtonPrimary
              text={confirmText}
              onPress={onConfirm}
              btnPrimaryStyle={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.light,
    padding: wp * 0.05,
    borderRadius: 10,
    width: '80%',
    maxWidth: 300,
  },

  modalMessage: {
    ...Typography.f_16_nunito_bold,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'space-around',
  },
  button: {
    width: 100,
    height: 40,
    paddingHorizontal: wp * 0.02,
  },
});
