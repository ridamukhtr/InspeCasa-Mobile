import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Image, } from 'react-native';
import Colors from '../utilities/constants/colors';
import { Typography, wp } from '../utilities/constants/constant.style';
import CustomText from './CustomText';
import * as Progress from 'react-native-progress';
import { Location } from '../assets/icons';
import { changeRoute } from '../services/assynsStorage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { HomeUserCardProps, RootState } from '../types/types';
import moment from 'moment';
import globalStyles from '../utilities/constants/globalStyles';
import { useSelector } from 'react-redux';
import ConfirmationModal from './Modal';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeUserCard: React.FC<HomeUserCardProps> = ({
  item,
}) => {
  const navigation = useNavigation();
  const currentUser = useSelector((state: RootState) => state?.auth?.user);
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [storedProgress, setStoredProgress] = useState<number | null>(null);
  const [hasProgress, setHasProgress] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    message: "",
    confirmText: "",
    onConfirm: () => { },
    showCancel: true
  });
  const [realTimeUserData, setRealTimeUserData] = useState(currentUser);


  const userId = currentUser?.userId;
  const isAssignedToCurrentUser = item?.assign_to === userId || item?.assign_to === null;
  const firstImage = item?.images?.[0] || null;

  useFocusEffect(
    useCallback(() => {
      const checkProgress = async () => {
        try {
          const value = await AsyncStorage.getItem(`progress_${item?.id}`);
          if (value !== null) {
            const parsed = JSON.parse(value);
            setStoredProgress(parsed);
            setHasProgress(parsed > 0);
          } else {
            setStoredProgress(null);
            setHasProgress(false);
          }
        } catch (e) {
          console.log('Error reading progress:', e);
        }
      };
      checkProgress();
    }, [item?.id])
  );

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('Users')
      .doc(userId)
      .onSnapshot((doc) => {
        const userData = doc.data();
        if (userData) {
          setRealTimeUserData(userData);
        }
      });

    return () => unsubscribe();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        if (userId) {
          const userDoc = await firestore().collection('Users').doc(userId).get();
          if (userDoc.exists()) {
            setRealTimeUserData(userDoc.data());
          }
        }
      };
      refreshData();
    }, [userId])
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (isAssignedToCurrentUser) {
          setUserName("You");
          setProfileImage(currentUser?.photo || null);
        } else if (item?.assign_to) {
          const userDoc = await firestore().collection('Users').doc(item.assign_to).get();
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileImage(userData?.photo || null);
            setUserName(userData?.fullName || "Inspector");
          }
        } else {
          setUserName("unassigned");
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [item?.assign_to, currentUser, isAssignedToCurrentUser]);

  const progressValue = storedProgress !== null ? storedProgress : item.progress || 0;

  const dateObj = new Date(
    item?.create_at?._seconds
      ? item.create_at._seconds * 1000
      : item.create_at
  );

  const date = moment(dateObj).format('DD');
  const month = moment(dateObj).format('MMM');
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // const getCurrentCounts = () => {
  //   const currentLimit = realTimeUserData?.features?.inspection_count_limit || 0;
  //   const currentUsed = realTimeUserData?.features?.inspection_count || 0;
  //   const remaining = currentLimit - currentUsed;
  //   return { currentLimit, currentUsed, remaining };
  // };
  // const handlePress = () => {
  //   const { currentLimit, remaining } = getCurrentCounts();

  //   if (hasProgress) {
  //     setModalConfig({
  //       message: "Do you want to continue this inspection?",
  //       confirmText: "Continue",
  //       onConfirm: () => {
  //         setShowModal(false);
  //         changeRoute(navigation, 'Properties', { item, id: item.id });
  //       },
  //       showCancel: true
  //     });
  //   }
  //   else if (remaining <= 0) {
  //     setModalConfig({
  //       message: `You've used all ${currentLimit} inspections.\nUpgrade for unlimited access?`,
  //       confirmText: "View Plans",
  //       onConfirm: () => {
  //         setShowModal(false);
  //         changeRoute(navigation, 'SubscriptionScreen');
  //       },
  //       showCancel: true,
  //       cancelText: "Not Now"
  //     });
  //   }
  //   else {
  //     setModalConfig({
  //       message: `${remaining} of ${currentLimit} inspections remaining\nStart this inspection?`,
  //       confirmText: "Start",
  //       onConfirm: async () => {
  //         setShowModal(false);
  //         await firestore().collection('Users').doc(userId).update({
  //           'features.inspection_count': firestore.FieldValue.increment(1)
  //         });
  //         changeRoute(navigation, 'Properties', { item, id: item.id });
  //       },
  //       showCancel: true
  //     });
  //   }
  //   setShowModal(true);
  // };

  const handlePress = () => {
    if (hasProgress) {
      setModalConfig({
        message: "Do you want to continue this inspection?",
        confirmText: "Continue",
        onConfirm: () => {
          setShowModal(false);
          changeRoute(navigation, 'Properties', { item, id: item.id });
        },
        showCancel: true
      });
    } else {
      setModalConfig({
        message: "Do you want to start this inspection?",
        confirmText: "Start",
        onConfirm: () => {
          setShowModal(false);
          changeRoute(navigation, 'Properties', { item, id: item.id });
        },
        showCancel: true
      });
    }
    setShowModal(true);
  };
  const getButtonText = () => {
    // const { remaining } = getCurrentCounts();

    if (hasProgress) {
      return "Continue";
    }
    // if (remaining <= 0) {
    //   return "Upgrade Plan";
    // }
    return "Start Inspection";
  };

  return (
    <View
      style={styles.container}
    >
      <ImageBackground
        source={
          firstImage && isValidUrl(firstImage)
            ? { uri: firstImage }
            : require("../assets/images/card_image_1.png")
        } style={{ flex: 1, }}
        imageStyle={{ borderRadius: 4, }}
      >
        <View style={styles.infoMain}>

          <View style={styles.infoContainer}>
            <CustomText style={styles.dateNumber}>{date}</CustomText>
            <CustomText style={styles.dateMonth}>{month}</CustomText>
          </View>
          <View style={styles.overlayContainer}>
            <View style={[globalStyles.container, { backgroundColor: "transparent" }]}>
              <View style={styles.statusBadge}>
                <CustomText style={{ color: "#CA8A04" }}>
                  {item.status ? `${item.status.charAt(0).toUpperCase()}${item.status.slice(1).toLowerCase()}` : "Pending"}
                </CustomText>
              </View>

              {isAssignedToCurrentUser && item.status !== "Completed" && (
                <TouchableOpacity
                  onPress={handlePress}
                  style={[styles.statusBadge, {
                    width: wp * 0.28,
                    backgroundColor: Colors.primary
                  }]}
                >
                  <CustomText style={styles.inspectorRole}>
                    {getButtonText()}
                  </CustomText>
                </TouchableOpacity>
              )}

            </View>
            <View style={styles.progress}>

              <Progress.Bar
                progress={progressValue}
                width={wp * 0.76}
                height={8}
                borderRadius={wp * 0.074}
                color={Colors.primary}
                unfilledColor="#e0e0e0"
                borderWidth={0}
              />
              <CustomText style={{ color: Colors.light }}>
                {Math.round((progressValue) * 100)}%
              </CustomText>
            </View>
            <View style={styles.propertyInfo}>
              <View style={{}}>
                <CustomText style={styles.propertyName}>{`${item?.name.charAt(0).toUpperCase()}${item?.name.slice(1).toLowerCase()}`}</CustomText>
                <View style={styles.locationContainer}>
                  <Location />
                  <CustomText style={styles.locationText}>{item?.address ? `${item?.address.charAt(0).toUpperCase()}${item?.address.slice(1).toLowerCase()}` : "456 Beach Rd, Miami"}</CustomText>
                </View>
              </View>

              <View style={styles.inspectorInfo}>
                <View style={styles.inspectorImageContainer}>
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      resizeMode='cover'
                      style={styles.inspectorImage}
                    />
                  ) : (
                    <View style={[globalStyles.initialsContainer, {
                      width: 25,
                      height: 25,
                    }]}>
                      <CustomText style={{ color: Colors.light, }}>
                        {userName?.charAt(0).toUpperCase()}
                      </CustomText>
                    </View>
                  )}
                </View>
                <View style={{ width: '60%' }}>
                  <CustomText style={styles.inspectorName} numberOfLines={1} ellipsizeMode={'tail'} >{userName}</CustomText>
                  <View style={styles.inspectorBadge}>
                    <CustomText style={styles.inspectorRole}>{"inspector"}</CustomText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>

      <ConfirmationModal
        visible={showModal}
        message={modalConfig.message}
        onCancel={() => setShowModal(false)}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.showCancel ? (modalConfig.cancelText || "Cancel") : undefined}
      />
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    marginVertical: 16,
    height: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    backgroundColor: Colors.primary, alignSelf: "flex-end", alignItems: "center", borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: wp * 0.02,
    width: wp * 0.16
  },
  dateNumber: {
    color: Colors.light,
    lineHeight: 22,
  },
  dateMonth: {
    ...Typography.f_17_nunito_bold,
    color: Colors.light,
    fontWeight: '500',
  },
  statusBadge: {
    width: wp * 0.26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#FEF9C3',
    borderRadius: 20,
    paddingHorizontal: wp * 0.03,
    paddingVertical: 4,
  },
  bottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  propertyInfo: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  propertyName: {
    color: Colors.light,
    ...Typography.f_20_nunito_bold,
  },
  progress: { flexDirection: "row", alignItems: "center", gap: 5, },
  locationContainer: {
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: Colors.light,
    ...Typography.f_12_nunito_bold,
  },
  inspectorInfo: {
    width: '35%',
    gap: wp * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspectorImageContainer: {
    width: 30,
    height: 30,
    borderRadius: 150 / 1,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light,
  },
  inspectorImage: {
    width: '100%',
    height: '100%',
  },
  inspectorName: {
    color: Colors.light,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  inspectorBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inspectorRole: {
    color: Colors.light,
    fontSize: 10,
  },
  overlayContainer: { backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: 10, gap: wp * 0.02, borderBottomRightRadius: 4, borderBottomLeftRadius: 4 },
  infoMain: { justifyContent: "space-between", flex: 1 },
});

export default HomeUserCard;