import React from 'react'
import { Image, StyleSheet, TextInput, View } from 'react-native'
import Colors from '../utilities/constants/colors'
import CustomTextField from './CustomTextField'
import globalStyles from '../utilities/constants/globalStyles'
import { Address, Search } from '../assets/icons'

const SearchInput = () => {
    return (
        <View style={globalStyles.container}>
            <CustomTextField leftContainer={<Search />} placeholder='Search' />
        </View>
    )
}

const styles = StyleSheet.create({
    searchInput: {
        width: 400,
        borderWidth: 1,
        borderColor: "#9e9898",
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 30,
        fontSize: 18
    },
    searchIcon: {
        height: 20,
        width: 20,
        position: "absolute",
        left: 32
    }
})

export default SearchInput
