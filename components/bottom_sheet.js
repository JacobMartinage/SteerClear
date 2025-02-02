import 'react-native-get-random-values';
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Button, Alert, TouchableOpacity, Text } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_PLACES_API_KEY } from '@env';

const api_key = GOOGLE_PLACES_API_KEY;
const MAPBOX_ACCESS_TOKEN = 'sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg';

const Bottomcomp = ({ onAddressSelected = () => {}, location, setRoute }) => {
  const bottomSheetModalRef = useRef(null);
  const [destination, setDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use this feature.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation(location.coords);
    };

    fetchUserLocation();
  }, []);

  const handlePresentModal = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
    }
  }, []);

  useEffect(() => {
    handlePresentModal();
  }, [handlePresentModal]);

  const handleGetDirections = async () => {
    // First collapse the bottom sheet
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.collapse();
    }

    // Then proceed with fetching directions
    if (!destination) {
      Alert.alert('Enter a location');
      return;
    }

    try {
      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${api_key}`
      );
      const geoData = await geoResponse.json();
      if (!geoData.results || geoData.results.length === 0) {
        Alert.alert('Location not found');
        return;
      }
      
      const { lat, lng } = geoData.results[0].geometry.location;
      getDirections([lng, lat]);
    } catch (error) {
      Alert.alert('Error fetching location', error.message);
    }
  };

  async function getDirections(destinationCoords) {
    const currentLocation = userLocation || location;
    if (!currentLocation) {
      Alert.alert('Current location not available');
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${currentLocation.longitude},${currentLocation.latitude};${destinationCoords[0]},${destinationCoords[1]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        Alert.alert('No route found');
        return;
      }
      setRoute(data.routes[0].geometry);
    } catch (error) {
      Alert.alert('Error fetching directions', error.message);
    }
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={['20%', '90%']}
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
                  key: api_key,
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
                styles={googlePlacesStyles}
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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  autocompleteContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ecf0f1',
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
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const googlePlacesStyles = {
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
    maxHeight: '20%',
    flexGrow: 1,
  },
};

export default Bottomcomp;