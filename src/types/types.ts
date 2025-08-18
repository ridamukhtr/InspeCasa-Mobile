import {NavigationProp, RouteProp} from '@react-navigation/native';
import rootReducer from '../store/reducers/rootReducer';
import {ImageSourcePropType, StyleProp, ViewStyle} from 'react-native';

export interface SplashProps {
  navigation: NavigationProp<any, any>;
}

export interface RegisterScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  RegisterScreen: undefined;
  Forget: undefined;
  Inspection: undefined;
  Tabs: undefined;
  SubscriptionScreen: undefined;
  HomeUser: undefined;
  Properties: undefined;
  History: undefined;
  Report: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  TermsAndCondition: undefined;
  PrivacyPolicy: undefined;
  StartInspection: undefined;
  FilterProperty: undefined;
  Signature: undefined;
  Support: undefined;
  ReportDetail: {reportId: string; inspectorName: string};
};

export type RootState = ReturnType<typeof rootReducer>;

export interface State {
  isError: boolean;
  isLoader: boolean;
  user: Record<string, any>;
}

export interface Action {
  type: string;
  payload: any;
}

export type HomeHeaderProps = {
  onPress: () => void;
  resetFilter: () => void;
  showResetFilter: boolean;
};

export interface FilterParams {
  selectedStatusKeys?: string[];
  selectedDates?: {
    from?: string;
    to?: string;
  };
  selectedInspector: string;
}

export interface RouteParams {
  filters?: FilterParams;
  item: PropertyItem;
}

export type Inspection = {
  inspectorId: any;
  signedDate: unknown;
  signatureUrl: unknown;
  inspectorName: unknown;
  address: unknown;
  last_date_of_inspection: unknown;
  assign_to: any;
  create_at: any;
  id: string;
  name?: string;
  location?: string;
  status?: string;
  progress?: string;
  username?: string;
  job?: string;
  image?: string;
  userImg?: string;
  percent?: number;
  timestamp: any;
};

export type Filters = {
  selectedStatusKeys: string[];
  selectedDates: {
    from: string;
    to: string;
  };
  selectedInspectorName: string;
};

export type FilterPropertyRouteProp = RouteProp<
  Record<'FilterProperty', {filters?: Filters}>,
  'FilterProperty'
>;

export type HomeUserCardProps = {
  id?: string;
  item?: any;
  onPress?: boolean;
  propertyImg?: string;
};

export type Inspector = {
  label: string;
  value: string;
  id: string;
};

export interface InspectorDropdownProps {
  selectedInspector: string;
  onSelectInspector: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  setIsLoading: (value: string) => void;
}

export type PropertyCardProps = {
  id: string;
  description: string;
  propertyImg: string;
  videoUrl: string;
  name: string;
  progress: number;
  address: string;
  status: string;
  propertyImgStyle: StyleProp<ViewStyle>;
};

export type Subcategory = {
  last_inspection_date: any;
  name: string;
  inspection_status: string;
  comment: string;
  images: string[];
};

export type CategoryGroup = {
  [categoryName: string]: {
    subcategories: Subcategory[];
  };
};

export type PropertyItem = {
  signature: null;
  assign_to: any;
  create_at: any;
  status: string;
  name: string;
  address: string;
  description: string;
  overall_condition: any;
  progress: number;
  id: string;
  categories: CategoryGroup[];
  images: string;
  videoUrl?: string;
};

export type StatusKey = 'good' | 'damaged' | 'needsRepair';

export const statusOptions: {label: string; key: StatusKey}[] = [
  {label: 'Good', key: 'good'},
  {label: 'Damaged', key: 'damaged'},
  {label: 'Needs Repair', key: 'needsRepair'},
];

export type ConditionOption = {
  id: string;
  label: string;
};

export type InspectionData = {
  comment: string;
  inspection_status: string | null;
  // images?: string[]; // optional if needed
};

export type Props = {
  statusSection?: boolean;
  ConditionRating?: boolean;
  disable?: boolean;
  isSubmit?: boolean;
  isReportView: boolean;
  statusKey?: string;
  title?: string;
  comment?: string;
  reportImages?: string[];
  status?: string;
  type?: string;
  subcategoryName?: string;
  onPress?: (data: InspectionData) => void;
};

export interface Report {
  id?: string;
  images?: string[];
  signature?: {
    url?: string;
    timestamp?: {seconds: number};
  };
  [key: string]: any;
  name?: string;
  address?: string;
  description?: string;
  status?: string;
  progress?: number;
  overall_condition?: string;
  create_at?: {seconds: number; nanoseconds: number};
  update_at?: {seconds: number; nanoseconds: number};
  categories?: Array<
    Record<
      string,
      {
        subcategories: Array<{
          name: string;
          inspection_status: string;
          comment: string;
          images: string[];
        }>;
      }
    >
  >;
}

export interface Category {
  type: string;
  subcategories: Subcategory[];
}

export interface ReportDetailScreenProps {
  route: {
    params?: {
      reportId?: string;
      inspectorName?: string;
    };
  };
  propertyImgStyle?: any;
  backIcon?: boolean;
}

export type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

export interface HistoryInspection {
  id: string;
  name: string;
  address: string;
  last_date_of_inspection?: Timestamp;
  overall_status?: string;
  assign_to?: string;
  status?: string;
  inspectorName?: string;
}

export interface ReportCardProps {
  id: string;
  name: string;
  inspectionImg?: string;
  address: string;
  date: string;
  status?: string;
  inspectorName: string;
  onDelete?: (id: string) => void;
  signDate?: string;
  signatureUrl?: string;
}

export type TabIcons = {
  HomeTab: React.FC<React.SVGProps<SVGSVGElement>>;
  HistoryTab: React.FC<React.SVGProps<SVGSVGElement>>;
  SupportTab: React.FC<React.SVGProps<SVGSVGElement>>;
  NotificationTab: React.FC<React.SVGProps<SVGSVGElement>>;
  SettingTab: React.FC<React.SVGProps<SVGSVGElement>>;
  [key: string]: React.FC<React.SVGProps<SVGSVGElement>>; // Index signature
};
