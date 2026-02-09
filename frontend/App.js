import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
import { initDB } from './utils/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, AuthContext } from './context/AuthContext'; // Import AuthProvider and AuthContext
import { useContext } from 'react';

// Main App component wrapped with AuthProvider
export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  const { userToken, isLoading } = useContext(AuthContext); // Use AuthContext

  useEffect(() => {
    initDB(); // Initialize SQLite database
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken == null ? <AuthNavigator /> : <AppNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
