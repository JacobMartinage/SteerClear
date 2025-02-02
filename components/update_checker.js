import React, { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import * as Updates from 'expo-updates';


    export const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Do you want to update now?',
          [
            {
              text: 'Yes',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                // Reload the app to apply the update
                Updates.reloadAsync();
              },
            },
            { text: 'No', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

