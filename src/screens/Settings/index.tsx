import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader'
import Colors from '../../utilities/constants/colors'
import globalStyles from '../../utilities/constants/globalStyles'
import CustomText from '../../components/CustomText'
import SettingsMenuItem from '../../components/SettingMenuItem'
import { Typography, wp } from '../../utilities/constants/constant.style'
import { Signout } from '../../assets/icons'
import { changeRoute } from '../../services/assynsStorage'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { setCredentials } from '../../store/slices/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import Toast from 'react-native-toast-message'
import auth from '@react-native-firebase/auth';
import { RootState } from '../../types/types'
import firestore from '@react-native-firebase/firestore';
import { SUBSCRIPTION_PLANS } from '../../data/Subscription'
import { formatFirestoreDate, getRenewalDate } from '../../services/hooks/useCustomHooks'
import LoaderComponent from '../../components/LoaderComponent'

const SettingScreen = ({ }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state?.auth?.user?.userId);
  const user = useSelector((state: RootState) => state?.auth?.user);

  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [planDetails, setPlanDetails] = useState({
    name: 'Free',
    inspection_limit: 3
  });

  useFocusEffect(
    useCallback(() => {
      const fetchUserDetails = async () => {
        if (!userId) return;
        try {
          const doc = await firestore().collection('Users').doc(userId).get();
          if (doc.exists()) {
            const data = doc.data();

            // Update basic user info
            setUserName(data?.fullName || 'N/A');
            setUserEmail(data?.email || 'No email');
            setUserProfile(data?.photo || '');

            const newPlanDetails = data?.activeSubscription?.subscription_type
              ? SUBSCRIPTION_PLANS[data.activeSubscription.subscription_type as keyof typeof SUBSCRIPTION_PLANS]
              : { name: 'Free', inspection_limit: 3 };
            setPlanDetails(newPlanDetails);

            const newRenewalDate = data?.activeSubscription?.subscription_payment_date
              ? formatFirestoreDate({
                seconds: getRenewalDate(data.activeSubscription.subscription_payment_date).getTime() / 1000,
                nanoseconds: 0
              })
              : 'Not subscribed';
            setRenewalDate(newRenewalDate);

            dispatch(setCredentials({
              user: {
                ...data,
                inspection_count: data?.activeSubscription?.features?.inspection_count || 0,
                inspection_limit: newPlanDetails.inspection_limit
              },
              token: await auth().currentUser?.getIdToken()
            }));
          }
        } catch (error) {
          console.log('Failed to fetch user profile:', error);
        }
      };

      fetchUserDetails();
    }, [userId, dispatch])
  );

  const handleSignOut = async () => {
    try {
      setLoading(true)
      await auth().signOut();
      dispatch(setCredentials({ user: null, token: null }));

      Toast.show({
        type: 'success',
        text1: 'Signed Out',
        text2: 'You have been signed out successfully.',
      });
      changeRoute(navigation, 'Login', {}, true);
    } catch (error) {
      console.log('Signout Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Signout Failed',
        text2: 'Something went wrong during sign out.',
      });
    } finally {
      setLoading(false)
    }
  };

  const RightContainer = () => {
    return (
      <View style={styles.UpgradeContainer}>
        <CustomText style={{ color: Colors.light, ...Typography.f_16_nunito_bold }}>Upgrade</CustomText>
      </View>
    )
  }
  return (
    <View style={globalStyles.mainContainer}>
      <HomeProfessionalHeader title="Setting" backIcon={false} />
      <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
        <View style={[globalStyles.paddingContainer,]}>
          <View style={globalStyles.Imgcontainer}>

            <View style={[globalStyles.profileImage, { justifyContent: 'center', alignItems: 'center' }]}>
              {userProfile ? (
                <Image
                  source={{ uri: userProfile }}
                  style={[globalStyles.profileImage, {}]}
                />
              ) : (
                <View style={globalStyles.initialsContainer}>
                  <CustomText style={globalStyles.initialsText}>
                    {userName?.charAt(0).toUpperCase()}
                  </CustomText>
                </View>
              )}
            </View>

            <View style={globalStyles.messageContent}>
              <CustomText style={globalStyles.adminLabel}>{userName}</CustomText>
              <CustomText style={globalStyles.description}>{userEmail}</CustomText>
            </View>

          </View>

          <View style={{ marginVertical: wp * 0.08 }}>
            <SettingsMenuItem title={"Edit Profile"} onPress={() => changeRoute(navigation, 'EditProfile')} />
            <SettingsMenuItem title={"Change Password"} onPress={() => changeRoute(navigation, 'ChangePassword')} />
            <SettingsMenuItem title={"Terms and Conditions"} onPress={() => changeRoute(navigation, 'TermsAndCondition')} />
            <SettingsMenuItem title={"Privacy Policy"} onPress={() => changeRoute(navigation, 'PrivacyPolicy')} />
            {/* <SettingsMenuItem
              title={"Subscription"}
              onPress={() => changeRoute(navigation, 'SubscriptionScreen')}
              description={
                user?.activeSubscription?.subscription_status === 'active'
                  ? `${planDetails.name} Plan Active`
                  : `Free Plan`
              }
              inspection_counts={
                user?.activeSubscription?.subscription_status === 'active'
                  ? `Total ${planDetails.inspection_limit} inspections`
                  : `Total ${planDetails.inspection_limit} inspections`
              }
              remainingCounts={
                `Remaining ${Math.max(0, planDetails.inspection_limit - (user?.features?.inspection_count || 0))} inspections`
              }
              date={
                user?.activeSubscription?.subscription_status === 'active'
                  ? `Renews on ${renewalDate}`
                  : ""
              }
              right={<RightContainer />}
            /> */}
            <SettingsMenuItem
              onPress={handleSignOut}
              title={"Sign Out"}
              titleStyle={{ color: "#E33629" }}
              right={loading ? <ActivityIndicator color={Colors.Red} size={'small'} /> : <Signout />}
            />
          </View>
        </View>
      </ScrollView >
    </View >
  )
}

export default SettingScreen
const styles = StyleSheet.create({
  UpgradeContainer: { backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 }
})