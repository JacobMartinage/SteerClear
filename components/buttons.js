import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logOutAccount } from '../utils/auth';
import Database from "../utils/database";
import { supabase } from "../lib/supabase";

const Buttons = ({ recenterOnUser, triggerSOS, setReportModalVisible, setSafeModalVisible, setOptionsModal, location, setFollowUser }) => {
  function handleSOS() {
    Alert.alert("SOS Activated", "Emergency services or contacts will be notified!");
    triggerSOS();
  }

  async function submitReport(report) {
    if (!report) {
      Alert.alert("Error", "Please enter or select a report.");
      return;
    }
    
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toISOString().split('T')[0];
    
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      Alert.alert("Error", "Unable to get user information.");
      return;
    }
    
    if (!location) {
      Alert.alert("Error", "Location not available.");
      return;
    }
    
    const response = await Database.insertIncident(
      time, 
      date, 
      report, 
      location.latitude, 
      location.longitude, 
      user.email
    );
    
    if (response) {
      Alert.alert("Report Submitted", `You reported: ${report}`);
    } else {
      Alert.alert("Error", "Failed to submit the report.");
    }
  }

  function handleLogout() {
    logOutAccount();
  }

  function handleRecenter() {
    if (location) {
      setFollowUser(true);
      setTimeout(() => setFollowUser(false), 2000);
    } else {
      Alert.alert("Error", "Current location not available.");
    }
  }

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.optionsButton} onPress={() => setOptionsModal(true)}>
        <Ionicons name="options" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.sosButton} onLongPress={handleSOS}>
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.reportButton} onPress={() => setReportModalVisible(true)}>
        <Ionicons name="alert-circle-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.safeButton} onPress={() => setSafeModalVisible(true)}>
        <Ionicons name="lock-closed" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 150, // Raised higher on screen
    alignItems: 'flex-end',
  },
  optionsButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'gray',
    padding: 15,
    borderRadius: 50,
  },
  recenterButton: {
    backgroundColor: '#4287f5',
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
  },
  sosButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
  },
  sosText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
  },
  safeButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
    marginTop: 10,
  },
});

export default Buttons;
