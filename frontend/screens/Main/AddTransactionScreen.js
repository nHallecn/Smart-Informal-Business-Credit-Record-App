<<<<<<< Updated upstream
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Picker } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { addTransaction } from '../../utils/database';
import useAuth from '../../hooks/useAuth';
=======
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, StyleSheet, Alert, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../../components/CustomButton';
import { addTransaction } from '../../utils/database';
import useAuth from '../../hooks/useAuth';
>>>>>>> Stashed changes

const AddTransactionScreen = ({ navigation }) => {
  const { userId } = useAuth();
  const [type, setType] = useState('sale');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mobileMoneyRef, setMobileMoneyRef] = useState('');
  const [description, setDescription] = useState('');

  const isMobileMoney =
    type === 'mobile_money_in' ||
    type === 'mobile_money_out' ||
    paymentMethod === 'mtn_momo' ||
    paymentMethod === 'orange_money' ||
    paymentMethod === 'mobile_money';

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
      description: description.trim() || null,
      paymentMethod,
      mobileMoneyRef: mobileMoneyRef.trim() || null,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Add New Transaction</Text>

      <Text style={styles.label}>Type</Text>
      <Picker
        selectedValue={type}
        style={styles.picker}
        onValueChange={(itemValue) => setType(itemValue)}
      >
        <Picker.Item label="Sale" value="sale" />
        <Picker.Item label="Expense" value="expense" />
        <Picker.Item label="Mobile Money In" value="mobile_money_in" />
        <Picker.Item label="Mobile Money Out" value="mobile_money_out" />
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
        <Picker.Item label="MTN MoMo" value="mtn_momo" />
        <Picker.Item label="Orange Money" value="orange_money" />
        <Picker.Item label="Other Mobile Money" value="mobile_money" />
        <Picker.Item label="Bank Transfer" value="bank_transfer" />
      </Picker>

      {isMobileMoney && (
        <View>
          <Text style={styles.label}>Mobile Money Reference</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., MOMO123456789"
            value={mobileMoneyRef}
            onChangeText={setMobileMoneyRef}
            autoCapitalize="characters"
          />
        </View>
      )}

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Optional details"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <CustomButton title="Add Transaction" onPress={handleAddTransaction} />
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
    paddingBottom: 36,
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
  notesInput: {
    minHeight: 86,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
});

export default AddTransactionScreen;
