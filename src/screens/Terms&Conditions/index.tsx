import React from 'react'
import { ScrollView, View } from 'react-native'
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader'
import CustomText from '../../components/CustomText'
import globalStyles from '../../utilities/constants/globalStyles'
import ButtonPrimary from '../../components/ButtonPrimary'
import useAgreeTerms from '../../services/hooks/useCustomHooks'
import CheckBox from '@react-native-community/checkbox'

const TermsAndCondition = () => {
    const { agreeTerms, toggleCheckbox, } = useAgreeTerms();

    return (
        <View style={globalStyles.mainContainer}>
            <HomeProfessionalHeader title={'Terms and Condition'} backIcon={false} />
            <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                <View style={[globalStyles.paddingContainer, {}]}>
                    <CustomText >
                        The Terms & Conditions screen serves as a crucial component of the app’s onboarding or setup process.
                        It is thoughtfully designed to communicate all the essential legal agreements that a user must understand and accept before proceeding further.
                        When users land on this screen, they are greeted with a clean interface featuring a prominent title — “Terms & Conditions” — followed by a scrollable text area that contains detailed legal content.
                        This content may include the app’s privacy policy, data usage terms, user responsibilities, content ownership rights, limitations of liability, account guidelines, and any other important legal disclaimers.
                        The text is presented in a structured format, often divided into headings and subpoints to make it easier for users to read and understand.
                        The purpose of this screen is to ensure transparency and build trust by clearly stating how the app will function, how user data will be handled, and what rules the users are expected to follow.
                        It also helps to protect the app provider from legal disputes by documenting that the user has been shown the terms and agreed to them.
                        To ensure active user consent, the screen includes a checkbox labeled “I have read and agree to the Terms & Conditions.”
                        This checkbox must be selected before the user is allowed to continue.
                        Once the checkbox is selected, the primary button labeled “Accept & Continue” becomes active, allowing the user to proceed to the next step, such as profile setup or dashboard access.
                        There's also a secondary button labeled “Decline,” which users can tap if they do not wish to agree. This action typically takes them back to the previous screen or exits the app, depending on the flow logic.
                        Both buttons are designed with clear visual hierarchy to guide the user intuitively.
                    </CustomText>

                    <View style={globalStyles.checkboxContainer}>
                        <CheckBox
                            value={agreeTerms}
                            onValueChange={toggleCheckbox}
                            tintColors={{ true: '#008080', false: '#aaa' }}
                        />
                        <CustomText style={globalStyles.checkBoxText}>
                            {`I have read and agree to the `}
                        </CustomText>
                        <CustomText style={globalStyles.blueText}>
                            Terms & Conditions.
                        </CustomText>
                    </View>
                    <ButtonPrimary text={'I agree'} onPress={toggleCheckbox}
                    />
                </View>
            </ScrollView>
        </View>
    )
}

export default TermsAndCondition
