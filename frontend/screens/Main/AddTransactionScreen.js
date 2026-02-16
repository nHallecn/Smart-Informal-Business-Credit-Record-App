import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Picker } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { addTransaction } from '../../utils/database';
import useAuth from '../../hooks/useAuth';

const AddTransactionScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const [type, setType] = useState('sale');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleAddTransaction = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Amount must be a number.');
      return;
    }

    const transactionData = {
      userId,
      type,
      amount: parseFloat(amount),
      category,
      paymentMethod,
      date: new Date().toISOString(),
    };

    try {
      await addTransaction(transactionData);
      Alert.alert('Success', 'Transaction added locally. It will sync when online.');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Transaction</Text>

      <Text style={styles.label}>Type</Text>
      <Picker
        selectedValue={type}
        style={styles.picker}
        onValueChange={(itemValue) => setType(itemValue)}
      >
        <Picker.Item label="Sale" value="sale" />
        <Picker.Item label="Expense" value="expense" />
      </Picker>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 1500.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Food, Transport, Goods"
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.label}>Payment Method</Text>
      <Picker
        selectedValue={paymentMethod}
        style={styles.picker}
        onValueChange={(itemValue) => setPaymentMethod(itemValue)}
      >
        <Picker.Item label="Cash" value="cash" />
        <Picker.Item label="Mobile Money" value="mobile_money" />
      </Picker>

      <CustomButton title="Add Transaction" onPress={handleAddTransaction} />
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
    marginBottom: 20,
    color: '#2d3748',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
});

export default AddTransactionScreen;
