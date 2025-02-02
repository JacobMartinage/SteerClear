import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import Database from '../utils/database';

const SafetyModal = ({ visible, onClose, location, presetSafety }) => {
  const [customReport, setCustomReport] = useState('');

  async function submitSafeReport(report) {
    if (!report) {
      Alert.alert('Error', 'Please enter or select a report.');
      return;
    }

    const now = new Date();
    const time = now.toISOString().split('T')[1].split('.')[0];
    const date = now.toISOString().split('T')[0];

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      Alert.alert('Error', 'Unable to get user information.');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available.');
      return;
    }

    const response = await Database.insertSafetyRecord(
      time,
      date,
      report,
      location.latitude,
      location.longitude,
      user.email
    );

    if (response) {
      Alert.alert('Report Submitted', `You reported: ${report}`);
    } else {
      Alert.alert('Error', 'Failed to submit the report.');
    }

    setCustomReport('');
    onClose();
  }



  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Why is this safe?</Text>

          <FlatList
            data={presetSafety}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.reportOption} onPress={() => submitSafeReport(item)}>
                <Text style={styles.reportText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />

          <TextInput
            style={styles.input}
            placeholder="How safe is it"
            value={customReport}
            onChangeText={setCustomReport}
          />

          <TouchableOpacity style={styles.submitButton} onPress={() => submitSafeReport(customReport)}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  reportOption: {
    width: '100%',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center'
  },
  reportText: {
    fontSize: 16
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default SafetyModal;
