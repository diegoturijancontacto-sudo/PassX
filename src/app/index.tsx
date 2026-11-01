import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import WalletCard from '../components/WalletCard';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <WalletCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040810',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
