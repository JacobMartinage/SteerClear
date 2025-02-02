import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DialogInput from 'react-native-dialog-input'; // Ensure you have this package installed
import { sendPasswordReset, deleteAccount, addUsername } from '../utils/auth';

const OptionsModal = ({ visible, onClose, logOutAccount }) => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

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
        { text: 'OK', onPress: () => { logOutAccount(); deleteAccount(); } },
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

        <TouchableOpacity onPress={handlePasswordReset}>
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
