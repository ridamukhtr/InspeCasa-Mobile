import { Dispatch } from 'redux';
import { NavigationProp } from '@react-navigation/native';

interface Credentials {
  email: string;
  password: string;
}

// Dummy users array
const dummyUsers = [
  { id: '1', email: 'user1@example.com', password: 'password123', name: 'User One' },
  { id: '2', email: 'user2@example.com', password: 'password456', name: 'User Two' },
];


export const getCurrentUser =
  (navigation: NavigationProp<any>): any =>
    async (dispatch: Dispatch) => {
      // Add your implementation here
    };

export const loginUser =
  (
    credentials: Credentials,
    isSelectedRemember: boolean,
    navigation: NavigationProp<any>,
  ): any =>
    async (dispatch: Dispatch) => {
       try {
      // Check dummy users array for matching credentials
      const user = dummyUsers.find(
        (u) =>
          u.email.toLowerCase() === credentials.email.toLowerCase() &&
          u.password === credentials.password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Dispatch success action with user data (excluding password)
      const userWithoutPassword = { ...user };

      dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });

      if (isSelectedRemember) {
        // Save user info locally, e.g. AsyncStorage or localStorage
        // localStorage.setItem('rememberedUser', JSON.stringify(userWithoutPassword));
      }

      navigation.navigate('Home', { screen: 'HomeUser' });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      console.error(error);
    }
    };
