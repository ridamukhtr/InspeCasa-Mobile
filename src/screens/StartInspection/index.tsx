import { View } from 'react-native'
import React from 'react'
import HomeProfessionalHeader from '../../components/HomeProfessionalHeader'
import globalStyles from '../../utilities/constants/globalStyles'
import HomeUserCard from '../../components/HomeUserCard'
import { useRoute } from '@react-navigation/native'

const StartInspection = () => {
    const route = useRoute();
    const { item } = route.params || {};

    return (
        <View style={globalStyles.mainContainer}>
            <HomeProfessionalHeader title="Assigned Property Details" backIcon={false} />
            <View style={globalStyles.paddingContainer}>
                <HomeUserCard item={item} />
            </View>
        </View>
    )
}

export default StartInspection
