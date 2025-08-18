import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader';
import SignaturePad, { SignaturePadHandle } from '../../components/SignaturePad';
import ButtonPrimary from '../../components/ButtonPrimary';
import { changeRoute } from '../../services/assynsStorage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import CustomText from '../../components/CustomText';
import globalStyles from '../../utilities/constants/globalStyles';
import { hp } from '../../utilities/constants/constant.style';
import ButtonSecondary from '../../components/ButtonSecondary';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import { firebase } from '@react-native-firebase/auth';
import Colors from '../../utilities/constants/colors';

type SignatureRouteParams = {
  reportId: string;
};

const Signature = () => {
  const navigation = useNavigation();
  const signaturePadRef = useRef<any>(null);
  const route = useRoute<RouteProp<Record<string, SignatureRouteParams>, string>>();
  const [loading, setLoading] = useState(false)
  const { reportId, } = route.params;

  const currentDate = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleReset = () => {
    signaturePadRef.current?.reset();
  };

  const uploadSignatureToCloudinary = async (signatureData: string) => {

    try {
      const base64Data = signatureData.split(',')[1] || signatureData;

      const uploadStr = `data:image/png;base64,${base64Data}`;
      const cloudName = 'diej7qbfz';
      const uploadPreset = 'InspeCasa';

      const formData = new FormData();
      formData.append('file', uploadStr);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'property-inspections/signatures');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.log('Error uploading signature to Cloudinary:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {

    try {
      setLoading(true)
      if (!signaturePadRef.current) {
        throw new Error("Signature pad not initialized");
      }

      let signatureData: string | null = null;
      try {
        signatureData = await Promise.race<string | null>([
          signaturePadRef.current.getSignature(),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Signature capture timed out")), 3000)
          )
        ]);
      } catch (err) {
        console.log("Signature capture warning:", err);
        signatureData = await signaturePadRef.current.getSignature();
      }

      if (!signatureData || signatureData.length < 1000) {
        throw new Error("Please draw your signature before submitting");
      }

      const signatureUrl = await uploadSignatureToCloudinary(signatureData);

      await firestore().collection('reports').doc(reportId).update({
        signature: {
          url: signatureUrl,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          signedDate: currentDate,
        },
        status: 'Completed',
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Report submitted successfully',
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs', state: { routes: [{ name: 'HistoryTab' }] } }],
      });
    } catch (error) {
      console.log('Submission error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to submit report';

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }

  };

  return (
    <View style={globalStyles.mainContainer}>
      <HomeProfessionalHeader title="Signature" backIcon={false} />

      <View style={globalStyles.paddingContainer}>
        <CustomText style={globalStyles.statusText}>Enter Your Signature</CustomText>

        <View style={styles.signatureWrapper}>
          <SignaturePad
            ref={signaturePadRef}
          />
        </View>

        <CustomText style={[globalStyles.statusText, { marginLeft: 5 }]}>{currentDate}</CustomText>
        <ButtonSecondary text="Reset" onPress={handleReset} />

        <ButtonPrimary
          text={loading ? <ActivityIndicator size={'small'} color={Colors.light} /> : "Submit"}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  signatureWrapper: {
    height: hp * 0.3,
    marginVertical: 10,
  },
});

export default Signature;
