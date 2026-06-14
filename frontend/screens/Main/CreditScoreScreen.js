import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import api from '../../config/api';
import useAuth from '../../hooks/useAuth';

const CreditScoreScreen = () => {
  const { userId } = useAuth();
  const [creditScore, setCreditScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreditScore = async () => {
      try {
        const response = await api.get(`/scores/user/${userId}`);
        setCreditScore(response.data);
      } catch (error) {
        console.error('Error fetching credit score:', error);
        Alert.alert('Error', 'Could not fetch credit score.');
      } finally {
        setLoading(false);
      }
    };

    fetchCreditScore();
  }, [userId]);

  const factors = creditScore?.factors || {};
  const components = factors.components || [];
  const strengths = factors.strengths || [];
  const risks = factors.risks || [];
  const nextActions = factors.nextActions || [];
  const money = (value) => `$${Number(value || 0).toFixed(2)}`;
  const percent = (value) => (value === null || value === undefined ? 'Not enough data' : `${Math.round(value * 100)}%`);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  if (!creditScore) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noDataText}>No credit score available yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Your Credit Score</Text>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreValue}>{creditScore.score_value}</Text>
        <Text style={styles.scoreLabel}>Score</Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net Profit</Text>
          <Text style={styles.summaryValue}>{money(factors.netProfit)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Records</Text>
          <Text style={styles.summaryValue}>{factors.transactionCount || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Record Days</Text>
          <Text style={styles.summaryValue}>{factors.consistencyDays || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expense Ratio</Text>
          <Text style={styles.summaryValue}>{percent(factors.expenseRatio)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Score Breakdown</Text>
      {components.map((component) => (
        <View key={component.key} style={styles.factorItem}>
          <View style={styles.factorTextBlock}>
            <Text style={styles.factorKey}>{component.label}</Text>
            <Text style={styles.factorDescription}>{component.description}</Text>
          </View>
          <Text style={[styles.pointsValue, component.points >= 0 ? styles.positivePoints : styles.negativePoints]}>
            {component.points >= 0 ? '+' : ''}{component.points}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>What Helps</Text>
      {(strengths.length > 0 ? strengths : ['Add more records to reveal your business strengths.']).map((item) => (
        <View key={item} style={styles.messageItem}>
          <Text style={styles.messageText}>{item}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>What Needs Attention</Text>
      {(risks.length > 0 ? risks : ['No major risk signals from the current records.']).map((item) => (
        <View key={item} style={[styles.messageItem, styles.riskItem]}>
          <Text style={styles.messageText}>{item}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Next Actions</Text>
      {nextActions.map((item) => (
        <View key={item} style={[styles.messageItem, styles.actionItem]}>
          <Text style={styles.messageText}>{item}</Text>
        </View>
      ))}

      <Text style={styles.infoText}>Your score is calculated based on your transaction history and consistency.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d3748',
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: '#4a5568',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#cbd5e0',
    fontSize: 18,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    color: '#2d3748',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    width: '48%',
    minHeight: 74,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  factorTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  factorKey: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  factorDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positivePoints: {
    color: '#047857',
  },
  negativePoints: {
    color: '#b91c1c',
  },
  messageItem: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 10,
  },
  riskItem: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  actionItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2d3748',
  },
  infoText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#718096',
  },
});

export default CreditScoreScreen;
