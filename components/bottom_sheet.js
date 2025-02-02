// bottom_sheet.js

import 'react-native-get-random-values';
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import * as Location from 'expo-location';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_PLACES_API_KEY } from '@env';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// 1) Import your new getDirections from routing.js
import { getDirections } from '../utils/routing'; // adjust path as needed

const Bottomcomp = ({ onAddressSelected = () => {}, location, setRoute }) => {
  const bottomSheetModalRef = useRef(null);
  const [destination, setDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Optionally fetch user location here if not passed from HomeScreen
  useEffect(() => {
    const fetchUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use this feature.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(loc.coords);
    };
    fetchUserLocation();
  }, []);

  // Show bottom sheet when the component mounts
  const handlePresentModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    handlePresentModal();
  }, [handlePresentModal]);

  // 2) Trigger the route creation (with avoid) when "Get Directions" is pressed
  const handleGetDirections = async () => {
    if (!destination) {
      Alert.alert('Enter a location');
      return;
    }

    bottomSheetModalRef.current?.collapse(); // collapse bottom sheet

    try {
      // 3) Geocode the address via Google
      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const geoData = await geoResponse.json();
      if (!geoData.results || geoData.results.length === 0) {
        Alert.alert('Location not found');
        return;
      }

      const { lat, lng } = geoData.results[0].geometry.location;

      // 4) Call custom getDirections with "driving" + exclude points
      //    pass userLocation or fallback to `location` prop
      await getDirections(
        userLocation || location,
        [lng, lat],
        setRoute
      );
    } catch (error) {
      Alert.alert('Error fetching location', error.message);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['30%', '90%']}
        index={0}
        enableDismissOnClose={false}
        enablePanDownToClose={false}
        topInset={10}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
              placeholder="Search"
              query={{
                key: GOOGLE_PLACES_API_KEY,
                language: 'en',
              }}
              fetchDetails={true}
              onPress={(data, details = null) => {
                if (details && details.geometry && details.geometry.location) {
                  const formattedAddress = details.formatted_address;
                  setDestination(formattedAddress);
                  onAddressSelected({
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                    name: formattedAddress,
                  });
                } else {
                  Alert.alert('Error', 'Location details not available');
                }
              }}
              onFail={(error) => console.error(error)}
              styles={{
                textInputContainer: {
                  width: '100%',
                  backgroundColor: 'white',
                  borderRadius: 5,
                },
                textInput: {
                  height: 40,
                  borderRadius: 5,
                  fontSize: 16,
                  paddingHorizontal: 10,
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                listView: {
                  width: '100%',
                },
              }}
              textInputProps={{
                onFocus: () => bottomSheetModalRef.current?.expand(),
              }}

            />
          </View>
          <TouchableOpacity style={styles.floatingButton} onPress={handleGetDirections}>
            <Text style={styles.buttonText}>Get Directions</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  autocompleteContainer: {
    flex: 1,
    padding: 10,
    width: '100%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Bottomcomp;
