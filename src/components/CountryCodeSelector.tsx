import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import CountryPicker, { getAllCountries } from 'react-native-country-picker-modal';
import { CountryCode, Country } from 'react-native-country-picker-modal';
import CustomText from './CustomText';
import { ArrowDown } from '../assets/icons';
import { wp } from '../utilities/constants/constant.style';

interface CountryCodeSelectorProps {
    countryCode: string;
    flagCountryCode: string;
    onSelectCountryCode: (code: string, flagCode: string) => void;
}
const CountryCodeSelector = ({ countryCode, onSelectCountryCode, flagCountryCode }: CountryCodeSelectorProps) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(flagCountryCode || 'PK');
    const [callingCode, setCallingCode] = useState<string>(countryCode);

    useEffect(() => {
        if (countryCode) {
            setCallingCode(countryCode);
        }
        if (flagCountryCode) {
            setSelectedCountryCode(flagCountryCode);
        }
    }, [countryCode, flagCountryCode]);

    const onSelect = (selectedCountry: Country) => {
        const selectedCallingCode = selectedCountry.callingCode[0];
        const selectedCountryCode = selectedCountry.cca2;

        setCallingCode(selectedCallingCode);
        setSelectedCountryCode(selectedCountryCode);

        onSelectCountryCode(selectedCallingCode, selectedCountryCode);
        setShowPicker(false);
    };

    return (
        <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
        >
            <CountryPicker
                countryCode={selectedCountryCode}
                withFilter
                withFlag
                withCallingCode
                withEmoji
                withCountryNameButton={false}
                visible={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={onSelect}
                containerButtonStyle={{ width: 30 }}
            />
            <CustomText style={{ fontSize: 16, marginRight: wp * 0.01 }}>
                +{callingCode}
            </CustomText>
            <ArrowDown />
        </TouchableOpacity>
    );
};

export default CountryCodeSelector;