import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomButton from '../../components/CustomButton';
import useAuth from '../../hooks/useAuth';

const ProfileScreen = () => {
  const { userId, userRole, signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => signOut() },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{userId}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{userRole}</Text>
      </View>

      {/* Add more profile details here if available, e.g., username, phone number */}

      <CustomButton
        title="Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
        textStyle={styles.logoutButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2d3748',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#2d3748',
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#fff',
  },
});

export default ProfileScreen;
