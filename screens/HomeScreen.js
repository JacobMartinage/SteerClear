import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { logOutAccount } from '../utils/auth';
import { Ionicons } from '@expo/vector-icons';

// ✅ Set Mapbox Access Token
Mapbox.setAccessToken('sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg');

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [customReport, setCustomReport] = useState('');

  const presetReports = [
    "Suspicious activity",
    "Unsafe area",
    "Crime witnessed",
    "Police presence",
    "Harassment",
  ];

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

  function submitReport(report) {
    Alert.alert("Report Submitted", `You reported: ${report}`);
    setReportModalVisible(false);
    setCustomReport('');
  }

  function triggerSOS() {
    Alert.alert(
      "SOS Activated",
      "Emergency services and  trusted contacts will be notified!",
      [{ text: "OK", onPress: () => console.log("SOS Triggered!") }]
    );
    // 🔴 TODO: Extend this to send messages, call emergency services, or share location
  }

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

          {/* ✅ Small Logout Button in Top Right */}
          <TouchableOpacity style={styles.logoutButton} onPress={logOutAccount}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>

          {/* ✅ Floating Report Button in Bottom Right */}
          <TouchableOpacity style={styles.reportButton} onPress={() => setReportModalVisible(true)}>
            <Ionicons name="alert-circle-outline" size={28} color="white" />
          </TouchableOpacity>

          {/* ✅ Floating SOS Button in Bottom Left (Long Press Required) */}
          <TouchableOpacity style={styles.sosButton} onLongPress={triggerSOS}>
            <Ionicons name="alert" size={28} color="white" />
          </TouchableOpacity>

          {/* ✅ Report Modal */}
          <Modal visible={reportModalVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Report an Issue</Text>

                {/* Preset Report Options */}
                <FlatList
                  data={presetReports}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.reportOption} onPress={() => submitReport(item)}>
                      <Text style={styles.reportText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                />

                {/* Custom Report Input */}
                <TextInput
                  style={styles.input}
                  placeholder="Describe the issue..."
                  value={customReport}
                  onChangeText={setCustomReport}
                />

                {/* Modal Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setReportModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={() => customReport ? submitReport(customReport) : Alert.alert("Enter a description")}
                  >
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  reportButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  sosButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reportOption: {
    width: '100%',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  reportText: {
    fontSize: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

