import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location'; // ✅ Corrected import



Mapbox.setAccessToken('sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg');

const App = () => {

    // ✅ User Location State
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
                <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />
            ) : location ? (
                <Mapbox.MapView style={styles.map}>
                    {/* ✅ Camera follows user location */}
                    <Mapbox.Camera 
                        zoomLevel={14} 
                        centerCoordinate={[location.longitude, location.latitude]}
                        animationMode="easeTo" // ✅ Smoother zoom animation
                        animationDuration={2000}
                    />

                    {/* ✅ Show user marker */}
                    <Mapbox.PointAnnotation
                        id="userLocation"
                        coordinate={[location.longitude, location.latitude]}
                    >
                        <View style={styles.marker} />
                    </Mapbox.PointAnnotation>
                </Mapbox.MapView>
            ) : (
                <Text>No Location Data</Text>
            )}
        </View>
    );
};

export default App;

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    marker: {
        height: 20,
        width: 20,
        backgroundColor: 'blue',
        borderRadius: 10,
    },
});
