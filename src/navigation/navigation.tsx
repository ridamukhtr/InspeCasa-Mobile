import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/Splash/index';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgetPassword from '../screens/Auth/ForgetPassword';
import InspectionScreen from '../screens/Auth/InspectionScreen';
import { RootStackParamList } from '../types/types';
import HomeUser from '../screens/Home/HomeUser';
import BottomNavigation from './BottomNavigation';
import ReportDetailScreen from '../screens/ReportDetail';
import EditProfile from '../screens/EditProfile';
import ChangePassword from '../screens/ChangePassword';
import SubscriptionScreen from '../screens/Subscription';
import TermsAndCondition from '../screens/Terms&Conditions';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import StartInspection from '../screens/StartInspection';
import FilterProperty from '../screens/Home/FilterProperty';
import Properties from '../screens/Home/Properties';
import Signature from '../screens/Home/Signature';
import SupportScreen from '../screens/Support';
import HistoryScreen from '../screens/history';

const Stack = createNativeStackNavigator<RootStackParamList>();


function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          component={Splash}
          name="Splash"
        />
        <Stack.Screen
          options={{ headerShown: false }}
          component={LoginScreen}
          name="Login"
        />
        <Stack.Screen
          options={{ headerShown: false }}
          component={RegisterScreen}
          name="RegisterScreen"
        />
        <Stack.Screen
          options={{ headerShown: false }}
          component={ForgetPassword}
          name="Forget"
        />
        <Stack.Screen
          options={{ headerShown: false }}
          component={InspectionScreen}
          name="Inspection"
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Tabs"
          component={BottomNavigation}
        />
        <Stack.Screen
          name="HomeUser"
          component={HomeUser}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReportDetail"
          component={ReportDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SubscriptionScreen"
          component={SubscriptionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsAndCondition"
          component={TermsAndCondition}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StartInspection"
          component={StartInspection}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FilterProperty"
          component={FilterProperty}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Properties"
          component={Properties}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signature"
          component={Signature}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
