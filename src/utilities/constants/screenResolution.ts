import {Dimensions} from 'react-native';

const screenHeight: number = Dimensions.get('window').height;
const screenWidth: number = Dimensions.get('window').width;
export const heightFlex1: number = screenHeight / 10;

const screenResolution = {
  screenHeight,
  screenWidth,
};

export default screenResolution;
