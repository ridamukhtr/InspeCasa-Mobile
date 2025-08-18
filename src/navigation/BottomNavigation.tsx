import React from 'react';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, DimensionValue } from 'react-native';
import { Bell, BellFilled, HistoryFilled, HistoryIcon, Home, HomeFilled, Setting, SettingFilled, Support, SupportFilled } from '../assets/icons';
import HomeUser from '../screens/Home/HomeUser';
import HistoryScreen from '../screens/history';
import SupportScreen from '../screens/Support';
import NotificationScreen from '../screens/Notification';
import SettingScreen from '../screens/Settings';
import { hp, Typography, wp } from '../utilities/constants/constant.style';
import Colors from '../utilities/constants/colors';
import useKeyboardVisibility from '../services/hooks/useKeyboardVisibility';
import CustomText from '../components/CustomText';
import { useAppSelector } from '../store/store';
import { RootState, TabIcons } from '../types/types';
import { useNotificationListener } from '../services/hooks/useCustomHooks';
import { useDispatch } from 'react-redux';
import { markMessagesAsSeen } from '../store/slices/chatSlice';
import firestore from '@react-native-firebase/firestore';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
const CustomTabBar: React.FC<
  BottomTabBarProps & { isKeyboardVisible?: boolean }
> = ({ state, descriptors, navigation, isKeyboardVisible = false }) => {
  if (isKeyboardVisible) {
    return null;
  }
  const dispatch = useDispatch()
  const tabWidth = 100 / state.routes.length;
  const indicatorLeft: DimensionValue = `${tabWidth * state.index}%`;
  const indicatorWidth: DimensionValue = `${70 / state.routes.length}%`;
  const indicatorMarginLeft: DimensionValue = `${(tabWidth - 10) / 2}%`;

  const userId = useAppSelector((state: RootState) => state?.auth?.user?.userId);
  useNotificationListener(userId);
  const unreadCount = useAppSelector(state => state.notifications.unreadCount);
  const note = useAppSelector(state => state.notifications);
  console.log("unread", unreadCount);
  console.log("note", note);

  const unseenCount = useAppSelector((state) => state.chat.unseenCount);
  const handleSupportTabPress = async () => {
    if (unseenCount > 0) {
      dispatch(markMessagesAsSeen());

      try {
        const messagesRef = firestore()
          .collection('support_chats')
          .doc(userId)
          .collection('Messages')
          .where('seen', '==', false);

        const snapshot = await messagesRef.get();

        const batch = firestore().batch();
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, { seen: true });
        });

        await batch.commit();
      } catch (error) {
        console.error('Error updating seen status:', error);
      }
    }
  };
  const renderTabItem = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        // Special handling for Support tab
        if (route.name === 'SupportTab') {
          handleSupportTabPress();
        }
        navigation.navigate(route.name);
      }
    };

    // Icon and badge rendering
    const IconComponent = getIconComponent(route.name, isFocused);
    const showNotificationBadge = route.name === 'NotificationTab' && unreadCount > 0;
    const showSupportBadge = route.name === 'SupportTab' && unseenCount > 0;

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={onPress}
        style={styles.navItem}
        activeOpacity={0.7}
      >
        <View>
          <IconComponent />
          {showNotificationBadge && (
            <View style={styles.badge}>
              <CustomText style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </CustomText>
            </View>
          )}
          {showSupportBadge && (
            <View style={styles.badge}>
              <CustomText style={styles.badgeText}>
                {unseenCount > 9 ? '9+' : unseenCount}
              </CustomText>
            </View>
          )}
        </View>
        <CustomText style={[
          styles.navLabel,
          { color: isFocused ? '#0891b2' : '#9ca3af' }
        ]}>
          {options.tabBarLabel || options.title || route.name}
        </CustomText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.activeIndicator,
          {
            left: indicatorLeft,
            width: indicatorWidth,
            marginLeft: indicatorMarginLeft,
          },
        ]}
      />
      <View style={styles.navContainer}>
        {state.routes.map(renderTabItem)}
      </View>
    </View>
  );
};

const getIconComponent = (routeName: string, isActive: boolean) => {
  const icons: TabIcons = {
    'HomeTab': isActive ? HomeFilled : Home,
    'HistoryTab': isActive ? HistoryFilled : HistoryIcon,
    'SupportTab': isActive ? SupportFilled : Support,
    'NotificationTab': isActive ? BellFilled : Bell,
    'SettingTab': isActive ? SettingFilled : Setting,
  };
  return icons[routeName] || (isActive ? HomeFilled : Home);
};

const BottomNavigation = () => {
  const { isKeyboardVisible } = useKeyboardVisibility();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} isKeyboardVisible={isKeyboardVisible} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeUser}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="SupportTab"
        component={SupportScreen}
        options={{
          tabBarLabel: 'Support',
          tabBarHideOnKeyboard: true
        }}
      />
      <Tab.Screen
        name="NotificationTab"
        component={NotificationScreen}
        options={{
          tabBarLabel: 'Notification',
        }}
      />
      <Tab.Screen
        name="SettingTab"
        component={SettingScreen}
        options={{
          tabBarLabel: 'Setting',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light,
    borderTopWidth: 1,
    // height: hp * 0.1,
    borderTopColor: '#e5e7eb',
    paddingVertical: wp * 0.03,
    paddingHorizontal: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 1.5,
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: hp * 0.05
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    ...Typography.f_12_nunito_medium,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -7,
    backgroundColor: Colors.Red,
    borderRadius: 8,
    paddingHorizontal: 5,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  badgeText: {
    color: Colors.light,
    fontSize: 10,
    fontWeight: 'bold',
  },

});

export default BottomNavigation;