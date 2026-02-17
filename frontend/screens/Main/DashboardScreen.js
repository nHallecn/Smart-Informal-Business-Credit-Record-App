import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import CustomButton from '../../components/CustomButton';
import TransactionItem from '../../components/TransactionItem';
import api from '../../config/api';
import { getAllTransactions, getUnsyncedTransactions, markTransactionsAsSynced } from '../../utils/database';
import useAuth from '../../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const { userId, userToken } = useAuth();
  const [stats, setStats] = useState({ totalSales: 0, totalExpenses: 0, creditScore: 0 });
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!userId || !userToken) return;
    try {
      // Sync local data first
      await syncLocalData();

      // Fetch dashboard stats from backend
      const statsResponse = await api.get(`/dashboard/${userId}`);
      setStats(statsResponse.data);

      // Fetch all transactions from local DB (including newly synced ones)
      const localTransactions = await getAllTransactions(userId);
      setTransactions(localTransactions);

    } catch (error) {
      console.error("Error fetching dashboard data or syncing", error);
      Alert.alert('Error', 'Could not load dashboard data or sync transactions.');
    }
  }, [userId, userToken]);

  const syncLocalData = async () => {
    if (!userId) return;
    const unsynced = await getUnsyncedTransactions(userId);
    if (unsynced.length > 0) {
      try {
        const response = await api.post('/sync', { userId, transactions: unsynced });
        if (response.data.success) {
          await markTransactionsAsSynced(response.data.syncedIds);
          console.log('Local data synced successfully');
        }
      } catch (error) {
        console.error('Sync failed:', error.response?.data || error.message);
        Alert.alert('Sync Error', 'Failed to sync some transactions. They will be synced later.');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      setRefreshing(true);
      fetchDashboardData().then(() => setRefreshing(false));
    }, [fetchDashboardData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().then(() => setRefreshing(false));
  }, [fetchDashboardData]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Your Business Overview</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Credit Score</Text>
        <Text style={styles.scoreValue}>{stats.creditScore}</Text>
        <CustomButton
          title="View Details"
          onPress={() => navigation.navigate('CreditScore')}
          style={styles.smallButton}
          textStyle={styles.smallButtonText}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#e6fffa' }]}>
          <Text style={styles.statLabel}>Total Sales</Text>
          <Text style={styles.statValue}>${stats.totalSales.toFixed(2)}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fff5f5' }]}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>${stats.totalExpenses.toFixed(2)}</Text>
        </View>
      </View>

      <CustomButton
        title="+ Add New Transaction"
        onPress={() => navigation.navigate('AddTransaction')}
      />

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.length > 0 ? (
        transactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
      ) : (
        <Text style={styles.noTransactionsText}>No transactions recorded yet.</Text>
      )}

      <CustomButton
        title="View All Reports"
        onPress={() => navigation.navigate('Reports')}
        style={styles.secondaryButton}
        textStyle={styles.secondaryButtonText}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d3748',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#4a5568',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    color: '#cbd5e0',
    fontSize: 18,
    marginBottom: 5,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 52,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  smallButton: {
    backgroundColor: '#63b3ed',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  smallButtonText: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#4a5568',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#2d3748',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#2d3748',
  },
  noTransactionsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#718096',
  },
  secondaryButton: {
    backgroundColor: '#a0aec0',
    marginTop: 20,
  },
  secondaryButtonText: {
    color: '#fff',
  },
});

export default DashboardScreen;
