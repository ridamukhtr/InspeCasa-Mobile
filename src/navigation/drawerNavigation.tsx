import HomeUser from '../screens/Home/HomeUser';
import HomeProfessional from '../screens/Home/HomeProfessional';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeHeader from '../components/HomeHeader';
import FilterProperty from '../screens/Home/FilterProperty';

const Drawer = createDrawerNavigator();

export default function DrawerNavigation() {
    return (
        <Drawer.Navigator
            screenOptions={{
                header: () => <HomeHeader />, // ✅ Inject custom header
            }}
        >
            <Drawer.Screen
                name="FilterProperty"
                component={FilterProperty}
            />
        </Drawer.Navigator>
    );
}
