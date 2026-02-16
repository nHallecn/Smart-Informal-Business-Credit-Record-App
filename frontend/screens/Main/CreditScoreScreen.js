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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Credit Score</Text>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreValue}>{creditScore.score_value}</Text>
        <Text style={styles.scoreLabel}>Score</Text>
      </View>

      <Text style={styles.sectionTitle}>Factors Influencing Your Score</Text>
      {creditScore.factors && Object.entries(creditScore.factors).map(([key, value]) => (
        <View key={key} style={styles.factorItem}>
          <Text style={styles.factorKey}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</Text>
          <Text style={styles.factorValue}>{typeof value === 'number' ? value.toFixed(2) : value}</Text>
        </View>
      ))}

      <Text style={styles.infoText}>Your score is calculated based on your transaction history and consistency.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7fafc',
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d3748',
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  factorKey: {
    fontSize: 16,
    color: '#4a5568',
  },
  factorValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
