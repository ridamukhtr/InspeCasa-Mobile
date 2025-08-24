import React from 'react';
import { StatusBar, View, } from 'react-native';
import { SafeAreaProvider, SafeAreaView, } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import store, { persistor } from './src/store/store/index';
import { Provider } from 'react-redux';
import AppNavigator from './src/navigation/navigation';
import Colors from './src/utilities/constants/colors';
import { PersistGate } from 'redux-persist/integration/react';
import { StripeProvider, } from '@stripe/stripe-react-native';

function App() {

  return (
    <StripeProvider
      publishableKey={"pk_test_51Rh40D6zBQ3VWKCSLrIKhJxrgH3tRZWLgsbvhj1GUlx2kUyurpctma4Qiil7CNin1Hr12vFNRlMO7JLPvbhd4jM100NjuUtaNf"}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>

          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light }}>
            <SafeAreaProvider>

              {/* <View style={{ flex: 1, backgroundColor: Colors.primary, paddingTop: isAndroidLatestVersion ? StatusBar.currentHeight : 0 }}> */}
              <StatusBar backgroundColor={Colors.light} barStyle="dark-content" />
              <AppNavigator />
              <Toast />
              {/* </View> */}
            </SafeAreaProvider>
          </SafeAreaView>
        </PersistGate>
      </Provider>
    </StripeProvider >
  );
}

export default App;