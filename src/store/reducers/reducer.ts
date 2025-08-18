interface State {
  isError: boolean;
  errorMsg: string;
  isLoader: boolean;
  user: Record<string, any>;
  postedByuser: any | null;
  savedCords: number[];
  isLocation: boolean;
  categories: any[];
  hourlyRates: string;
  roomSize: any[];
  noOfRooms: any[];
  additionalService: any[];
  taxes: any[];
  fixRates: any[];
  allAds: any[];
  myAds: any[];
  bookMarks: any[];
  adsByLocation: any[];
}

interface Action {
  type: string;
  payload: any;
}

const initState: State = {
  isError: false,
  errorMsg: '',
  isLoader: false,
  user: {},
  postedByuser: null,
  savedCords: [],
  isLocation: false,
  categories: [],
  hourlyRates: '',
  roomSize: [],
  noOfRooms: [],
  additionalService: [],
  taxes: [],
  fixRates: [],
  allAds: [],
  myAds: [],
  bookMarks: [],
  adsByLocation: [],
};

const reducer = (state = initState, action: Action): State => {
  switch (action.type) {
    case 'IS_ERROR':
      return {
        ...state,
        isError: action.payload,
      };
    case 'SET_ERROR_MSG':
      return {
        ...state,
        errorMsg: action.payload,
      };
    case 'IS_LOADER':
      return {
        ...state,
        isLoader: state.isLoader,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'IS_LOCATION':
      return {
        ...state,
        isLocation: action.payload,
      };
    case 'SAVED_COORDS':
      return {
        ...state,
        savedCords: action.payload,
      };
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };
    case 'SET_HOURLY_RATE':
      return {
        ...state,
        hourlyRates: action.payload,
      };
    case 'SET_ROOM_SIZE':
      return {
        ...state,
        roomSize: action.payload,
      };
    case 'SET_NO_OF_ROOMS':
      return {
        ...state,
        noOfRooms: action.payload,
      };
    case 'SET_ADITIONAL_SERVICE':
      return {
        ...state,
        additionalService: action.payload,
      };
    case 'SET_TAXES':
      return {
        ...state,
        taxes: action.payload,
      };
    case 'SET_FIXED_RATES':
      return {
        ...state,
        fixRates: action.payload,
      };
    case 'SET_ADS':
      return {
        ...state,
        allAds: action.payload,
      };
    case 'SET_My_ADS':
      return {
        ...state,
        myAds: action.payload,
      };
    case 'SET_BOOK_MARKS':
      return {
        ...state,
        bookMarks: action.payload,
      };
    case 'SET_POSTED_BY_USER':
      return {
        ...state,
        postedByuser: action.payload,
      };
    case 'FETCH_BY_LOCATION_ADS':
      return {
        ...state,
        adsByLocation: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
