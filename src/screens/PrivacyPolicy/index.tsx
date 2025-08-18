import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader';
import CustomText from '../../components/CustomText';
import Section from '../../components/Section';
import globalStyles from '../../utilities/constants/globalStyles';

const PrivacyPolicy: React.FC = () => {
    return (
        <View style={globalStyles.mainContainer}>
            <HomeProfessionalHeader title="Privacy Policy" />
            <View style={globalStyles.paddingContainer}>
                <ScrollView
                    showsVerticalScrollIndicator={true}
                >
                    <View style={styles.contentWrapper}>
                        <CustomText style={globalStyles.messageTxt}>
                            <CustomText style={globalStyles.statusText}>Last Updated: 3/30/2025</CustomText>
                            {'\n'}
                            Your privacy matters to us. This policy explains how we collect, use, and protect your data.
                        </CustomText>

                        <Section
                            title="1. Information We Collect"
                            bullets={[
                                {
                                    label: 'Personal Data:',
                                    text: 'Name, email, phone number, and payment details.',
                                },
                                {
                                    label: 'Usage Data:',
                                    text: 'App interactions, device information, and IP address.',
                                },
                            ]}
                        />

                        <Section
                            title="2. How We Use Your Data"
                            bullets={[
                                { text: 'To provide and improve Finsusu services.' },
                                { text: 'For account verification, security, and customer support.' },
                                { text: 'To process payments and withdrawals securely.' },
                            ]}
                        />

                        <Section
                            title="3. Data Sharing & Security"
                            bullets={[
                                { text: 'We do not sell user data.' },
                                {
                                    text: 'Data is shared only with payment processors and legal authorities if required.',
                                },
                                { text: 'We use encryption to protect user information.' },
                            ]}
                        />

                        <Section
                            title="4. Your Rights"
                            bullets={[
                                { text: 'Access, update, or delete your data anytime.' },
                                { text: 'Opt out of marketing communications.' },
                            ]}
                        />

                        <Section
                            title="5. Policy Updates"
                            bullets={[
                                { text: 'Changes will be notified within the app.' },
                                {
                                    text: 'For any questions, contact ',
                                    append: 'support@finsusu.com',
                                    isLink: true,
                                },
                            ]}
                        />

                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({


    contentWrapper: {
        // paddingBottom: 32,
    },

});

export default PrivacyPolicy;