import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const id = await AsyncStorage.getItem('userId');
        const role = await AsyncStorage.getItem('userRole');
        setUserToken(token);
        setUserId(id);
        setUserRole(role);
      } catch (e) {
        console.error('Failed to load user from storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (token, id, role) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userId', id);
    await AsyncStorage.setItem('userRole', role);
    setUserToken(token);
    setUserId(id);
    setUserRole(role);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userRole');
    setUserToken(null);
    setUserId(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userId, userRole, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
