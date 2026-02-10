import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TransactionItem = ({ transaction }) => {
  const isSale = transaction.type === 'sale';
  const amountColor = isSale ? '#28a745' : '#dc3545';

  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text style={styles.date}>{new Date(transaction.date).toLocaleDateString()}</Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {isSale ? '+' : '-'}${transaction.amount.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  detailsContainer: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionItem;
