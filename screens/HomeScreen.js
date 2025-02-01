import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { logOutAccount } from '../utils/auth'; // ✅ Import logout function

// ✅ Set Mapbox Access Token
Mapbox.setAccessToken('sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg');

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Allow location access to use this feature.');
          setLoading(false);
          return;
        }

        let userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation.coords);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get location.');
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : location ? (
        <>
          <Mapbox.MapView style={styles.map}>
            {/* ✅ Camera follows user location */}
            <Mapbox.Camera
              zoomLevel={14}
              centerCoordinate={[location.longitude, location.latitude]}
              animationMode="easeTo"
              animationDuration={1000}
            />

            {/* ✅ Show user marker */}
            <Mapbox.PointAnnotation
              id="userLocation"
              coordinate={[location.longitude, location.latitude]}
            >
              <View style={styles.marker} />
            </Mapbox.PointAnnotation>
          </Mapbox.MapView>

          {/* ✅ Logout Button */}
          <View style={styles.logoutContainer}>
            <Button title="Logout" onPress={logOutAccount} color="red" />
          </View>
        </>
      ) : (
        <Text style={styles.text}>No Location Data</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    height: 20,
    width: 20,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
