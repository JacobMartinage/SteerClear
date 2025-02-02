import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Start tracking user location
 */
export async function startTracking(setLocation, setLoading) {
    let subscription;

    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Allow location access to use this feature.');
            setLoading(false);
            return;
        }

        subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 5,
            },
            (newLocation) => {
                setLocation(newLocation.coords);
            }
        );
    } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get location.');
    } finally {
        setLoading(false);
    }

    return () => {
        if (subscription) {
            subscription.remove();
        }
    };
}
