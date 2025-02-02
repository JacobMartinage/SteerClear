import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { sendPasswordReset, deleteAccount } from '../utils/auth';

const OptionsModal = ({ visible, onClose, logOutAccount }) => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const handleUserName = () => {
    setIsDialogVisible(true);
    console.log(isDialogVisible);
  };

  const handlePasswordReset = () => {
    Alert.alert(
      'Password Reset',
      'Are you sure you want to reset your password?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Reset cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => sendPasswordReset(),
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
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
        <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20 }} onPress={onClose}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={logOutAccount}>
          <Text style={styles.placeho}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePasswordReset}>
          <Text style={styles.placeho}>Group Walk</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleUserName}>
          <Text style={styles.placeho}>Edit Username</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePasswordReset}>
          <Text style={styles.placeho}>Password Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeletePress}>
          <Text style={styles.placeho}>Delete Account</Text>
        </TouchableOpacity>
      </View>
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
  placeho: {padding: 10, fontSize: 30,  color: 'black', fontWeight: 'bold', borderRadius: 50, backgroundColor: 'blue',marginBottom: 10  },

});

export default OptionsModal;
