import { StyleSheet, View } from 'react-native';
import React from 'react';
import Colors from '../../utilities/constants/colors';

const SubscritionSkeleton = () => (
  <View style={styles.skeletonContainer}>
    {/* Tab Skeleton */}
    <View style={styles.tabSkeleton} />

    {/* Main Content Skeleton */}
    <View style={styles.contentSkeleton}>
      <View style={styles.iconSkeleton} />
      <View style={styles.titleSkeleton} />
      <View style={styles.descriptionSkeleton} />

      {/* Pricing Card Skeleton */}
      <View style={styles.pricingCardSkeleton}>
        <View style={styles.serviceLabelSkeleton} />
        <View style={styles.priceSkeleton} />
      </View>

      {/* Button Skeleton */}
      <View style={styles.buttonSkeleton} />

      {/* Billing Info Skeleton */}
      <View style={styles.billingTitleSkeleton} />
      <View style={styles.billingTextSkeleton} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeletonContainer: {
    padding: 15,
  },
  tabSkeleton: {
    height: 50,
    backgroundColor: Colors.gray,
    borderRadius: 8,
    marginBottom: 20,
  },
  contentSkeleton: {
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray,
    marginBottom: 15,
  },
  titleSkeleton: {
    width: 200,
    height: 25,
    backgroundColor: Colors.gray,
    marginBottom: 10,
    borderRadius: 4,
  },
  descriptionSkeleton: {
    width: '80%',
    height: 15,
    backgroundColor: Colors.gray,
    marginBottom: 25,
    borderRadius: 4,
  },
  pricingCardSkeleton: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  serviceLabelSkeleton: {
    width: 120,
    height: 20,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    marginBottom: 15,
  },
  priceSkeleton: {
    width: 100,
    height: 30,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 30,
  },
  buttonSkeleton: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.gray,
    borderRadius: 8,
    marginBottom: 25,
  },
  billingTitleSkeleton: {
    width: 180,
    height: 20,
    backgroundColor: Colors.gray,
    borderRadius: 4,
    marginBottom: 10,
  },
  billingTextSkeleton: {
    width: '90%',
    height: 15,
    backgroundColor: Colors.gray,
    borderRadius: 4,
  },
});

export default SubscritionSkeleton;

