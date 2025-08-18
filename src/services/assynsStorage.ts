import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItem = async <T>(
  key: string,
  defaultValue: T,
): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(`${key}`);

    if (value) {
      return JSON.parse(value) as T;
    } else {
      return defaultValue;
    }
  } catch (error) {
    return null;
  }
};

export const setItem = async (
  key: string,
  value: any,
): Promise<boolean | null> => {
  try {
    await AsyncStorage.setItem(`${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    return null;
  }
};

export const deleteItem = async (key: string): Promise<boolean | null> => {
  try {
    await AsyncStorage.removeItem(`${key}`);
    return true;
  } catch (error) {
    return null;
  }
};

export const changeRoute = async (
  navigation: any,
  value: string,
  params?: any,
  resetStack: boolean = false,
): Promise<void> => {
  try {
    if (value === 'pop') {
      navigation.pop();
    } else if (resetStack) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: value,
            ...(params && {params}),
          },
        ],
      });
    } else {
      navigation.navigate(value, params);
    }
  } catch (error) {
    console.log('Navigation Error:', error);
  }
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = ('' + phoneNumber)
    .replace(/\D+/g, '')
    .replace(/(\d{3})(\d{4})(\d{4})/, '+$1 $2 $3');

  return cleaned;
};

export const findClosest = (arr: number[], target: number): number => {
  let distance = Math.abs(arr[0] - target);
  let idx = 0;
  for (let c = 1; c < arr.length; c++) {
    const cdistance = Math.abs(arr[c] - target);
    if (cdistance < distance) {
      idx = c;
      distance = cdistance;
    }
  }
  return arr[idx];
};
