import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import api from '../../config/api';
import useAuth from '../../hooks/useAuth';
import CustomButton from '../../components/CustomButton';

const ReportsScreen = () => {
  const { userId } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [userId]);

  const fetchReports = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await api.get(`/reports/user/${userId}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Could not fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType) => {
    if (!userId) return;
    setGenerating(true);
    try {
      const response = await api.post('/reports/generate', { userId, reportType });
      Alert.alert('Success', response.data.message);
      // Refresh reports list after generation
      fetchReports();
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewReport = async (reportUrl) => {
    // In a real app, you'd likely open a PDF viewer or browser for the report URL
    // For this example, we'll just try to open it with Linking
    if (reportUrl) {
      const fullUrl = `http://YOUR_BACKEND_IP:3000${reportUrl}`; // Adjust if reports are served differently
      const supported = await Linking.canOpenURL(fullUrl );
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', `Don\'t know how to open this URL: ${fullUrl}`);
      }
    } else {
      Alert.alert('Error', 'Report URL is not available.');
    }
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.reportItem}>
      <View>
        <Text style={styles.reportType}>{item.type.toUpperCase()} Report</Text>
        <Text style={styles.reportDate}>Generated: {new Date(item.generatedAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity onPress={() => handleViewReport(item.url)} style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Financial Reports</Text>

      <View style={styles.generateButtonsContainer}>
        <CustomButton
          title={generating ? "Generating..." : "Generate Monthly Report"}
          onPress={() => handleGenerateReport('monthly')}
          disabled={generating}
          style={styles.generateButton}
        />
        <CustomButton
          title={generating ? "Generating..." : "Generate Weekly Report"}
          onPress={() => handleGenerateReport('weekly')}
          disabled={generating}
          style={styles.generateButton}
        />
      </View>

      <Text style={styles.sectionTitle}>Previous Reports</Text>
      {reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
        />
      ) : (
        <Text style={styles.noReportsText}>No reports generated yet.</Text>
      )}
    </View>
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
  generateButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  generateButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#2d3748',
  },
  reportItem: {
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
  reportType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noReportsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#718096',
  },
});

export default ReportsScreen;
