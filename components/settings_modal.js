import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DialogInput from 'react-native-dialog-input'; // Ensure you have this package installed
import { sendPasswordReset, deleteAccount, addUsername } from '../utils/auth';
import GroupWalk from '../utils/group_walk'; 
import * as Location from 'expo-location';
import { checkForUpdates } from './update_checker';

const OptionsModal = ({ visible, onClose, logOutAccount }) => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const handleUserName = () => {
    setIsDialogVisible(true);
  };
  

  const handleCreateGroup = async () => {
    try {
      // Request user's location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location permissions to create a group.');
        return;
      }
      // Prompt for group name
      Alert.prompt(
        'Create Group',
        'Enter a group name:',
        async (newName) => {
            console.log(newName)

          if (!newName) return;
          console.log(newName)


          const size = 10; 
          const response = await GroupWalk.createGroup(newName, size);
          console.log("a")

          if (response) {
            Alert.alert('Success', `Group "${newName}" created successfully.`);
            GroupWalk.createGroup(newName, size);
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
        { text: 'OK', onPress: () => { logOutAccount(); deleteAccount(); } },
      ],
      { cancelable: false }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.optionsModalCont}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={30} color="white" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  closeButton: {
    position: 'absolute',
    color: 'white',
    top: 40,
    right: 20,
  },
  optionText: {
    padding: 10,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 10,
    backgroundColor: 'blue',
    marginBottom: 25,
    textAlign: 'center',
    width: 225,
  },
});

export default OptionsModal;
