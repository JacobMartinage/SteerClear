import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DialogInput from 'react-native-dialog-input';
import { sendPasswordReset, deleteAccount, addUsername } from '../utils/auth';
import GroupWalk from '../utils/group_walk'; 
import * as Location from 'expo-location';

const OptionsModal = ({ visible, onClose, logOutAccount }) => {
  // Username editing state
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  
  // Store location in state
  const [userLocation, setUserLocation] = useState(null);

  // 1) Place the useEffect at the top level of the component
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Allow location access to use this feature.');
          return;
        }
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation(loc.coords);
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };
    fetchUserLocation();
  }, []);

  // 2) Reference userLocation in your event handler
  const handleCreateGroup = async () => {
    try {
      if (!userLocation) {
        Alert.alert('No location available yet', 'Please wait for location to be determined.');
        return;
      }

      const { latitude, longitude } = userLocation;

      Alert.prompt(
        'Create Group',
        'Enter a group name:',
        async (newName) => {
          if (!newName) return;
          console.log("Group name:", newName);

          const size = 10; 
          console.log("vals", newName, size, latitude, longitude);

          const response = await GroupWalk.createGroup(newName, size, latitude, longitude);
          console.log("After createGroup call:", response);

          if (response) {
            Alert.alert('Success', `Group "${newName}" created successfully.`);
          } else {
            Alert.alert('Error', 'Failed to create the group.');
          }
        }
      );
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Something went wrong while creating the group.');
    }
  };

  const handleUserName = () => {
    setIsDialogVisible(true);
  };

  const handlePasswordReset = () => {
    Alert.alert(
      'Password Reset',
      'Are you sure you want to reset your password?',
      [
        { text: 'Cancel', onPress: () => console.log('Reset cancelled'), style: 'cancel' },
        { text: 'OK', onPress: () => sendPasswordReset() },
      ],
      { cancelable: false }
    );
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account?',
      [
        { text: 'Cancel', onPress: () => console.log('Deletion cancelled'), style: 'cancel' },
        { 
          text: 'OK',
          onPress: () => {
            logOutAccount();
            deleteAccount();
          }
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.optionsModalCont}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={logOutAccount}>
          <Text style={styles.optionText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCreateGroup}>
          <Text style={styles.optionText}>Group Walk</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleUserName}>
          <Text style={styles.optionText}>Edit Username</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePasswordReset}>
          <Text style={styles.optionText}>Password Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeletePress}>
          <Text style={styles.optionText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <DialogInput
        isDialogVisible={isDialogVisible}
        title="Edit Username"
        message="Enter your new username"
        hintInput="New Username"
        submitInput={(inputText) => {
          addUsername(inputText);
          setIsDialogVisible(false);
        }}
        closeDialog={() => setIsDialogVisible(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  optionsModalCont: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  optionText: {
    padding: 10,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 10,
    backgroundColor: 'blue',
    marginBottom: 10,
    textAlign: 'center',
    width: 200,
  },
});

export default OptionsModal;
