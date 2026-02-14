import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/Main/DashboardScreen';
import AddTransactionScreen from '../screens/Main/AddTransactionScreen';
import CreditScoreScreen from '../screens/Main/CreditScoreScreen';
import ReportsScreen from '../screens/Main/ReportsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';

const AppStack = createStackNavigator();

const AppNavigator = () => {
  return (
    <AppStack.Navigator initialRouteName="Dashboard">
      <AppStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'My Business' }} />
      <AppStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
      <AppStack.Screen name="CreditScore" component={CreditScoreScreen} options={{ title: 'Credit Score' }} />
      <AppStack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <AppStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </AppStack.Navigator>
  );
};

export default AppNavigator;
