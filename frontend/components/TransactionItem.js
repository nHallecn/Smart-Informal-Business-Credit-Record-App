import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

<<<<<<< Updated upstream
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
=======
const TransactionItem = ({ transaction }) => {
  const isSale = transaction.type === 'sale' || transaction.type === 'mobile_money_in';
  const amountColor = isSale ? '#28a745' : '#dc3545';
  const typeLabels = {
    sale: 'Sale',
    expense: 'Expense',
    mobile_money_in: 'Mobile Money In',
    mobile_money_out: 'Mobile Money Out',
  };
  const methodLabels = {
    cash: 'Cash',
    mtn_momo: 'MTN MoMo',
    orange_money: 'Orange Money',
    mobile_money: 'Mobile Money',
    bank_transfer: 'Bank Transfer',
  };
  const details = [
    typeLabels[transaction.type] || transaction.type,
    methodLabels[transaction.paymentMethod] || transaction.paymentMethod,
    transaction.mobileMoneyRef ? `Ref: ${transaction.mobileMoneyRef}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text style={styles.date}>{new Date(transaction.date).toLocaleDateString()}</Text>
        <Text style={styles.meta}>{details}</Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
>>>>>>> Stashed changes
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
  meta: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionItem;
