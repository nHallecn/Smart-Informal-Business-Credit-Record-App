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
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0,
    averageTransaction: 0,
    creditScore: 0,
    topCategory: null,
    recentTrend: { recentSales: 0, recentExpenses: 0, recentNetProfit: 0 },
    insight: 'Record transactions to start building business insights.',
  });
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

  const money = (value) => `$${Number(value || 0).toFixed(2)}`;
  const netProfitColor = stats.netProfit >= 0 ? '#047857' : '#b91c1c';

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
          <Text style={styles.statValue}>{money(stats.totalSales)}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fff5f5' }]}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>{money(stats.totalExpenses)}</Text>
        </View>
      </View>

      <View style={styles.insightPanel}>
        <View style={styles.insightHeader}>
          <View>
            <Text style={styles.panelLabel}>Net Profit</Text>
            <Text style={[styles.netProfitValue, { color: netProfitColor }]}>{money(stats.netProfit)}</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countValue}>{stats.transactionCount}</Text>
            <Text style={styles.countLabel}>Records</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Average Entry</Text>
            <Text style={styles.metricValue}>{money(stats.averageTransaction)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Top Category</Text>
            <Text style={styles.metricValue}>{stats.topCategory?.category || 'None yet'}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>30-Day Sales</Text>
            <Text style={styles.metricValue}>{money(stats.recentTrend?.recentSales)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>30-Day Expenses</Text>
            <Text style={styles.metricValue}>{money(stats.recentTrend?.recentExpenses)}</Text>
          </View>
        </View>

        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationLabel}>Insight</Text>
          <Text style={styles.recommendationText}>{stats.insight}</Text>
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
  insightPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  panelLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  netProfitValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  countBadge: {
    minWidth: 74,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
  },
  countValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3730a3',
  },
  countLabel: {
    fontSize: 11,
    color: '#475569',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    minHeight: 70,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  recommendationBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0e7490',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#164e63',
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
