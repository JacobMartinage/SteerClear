import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { logOutAccount } from '../utils/auth';
import { Ionicons } from '@expo/vector-icons';
import Database from "../utils/database";
import { supabase } from "../lib/supabase";
import Bottomcomp from '../components/bottom_sheet';
import { fetchHeatmapData, convertToGeoJSON, getHeatmapStyle, updateHeatmap } from '../components/heatmap';

//set token
Mapbox.setAccessToken('sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg');


export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [customReport, setCustomReport] = useState('');
  const [safeModalVisible, setSafeModalVisible] = useState(false);

  const presetReports = [
    "I felt unsafe",
    "Suspicious Activity",
    "Violent Crime witnessed",
    "Theft or Robbery",
    "Harassment",
  ];

  //heatmap state
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    updateHeatmap(setGeojson);
  }, []);

  // start getting location
  useEffect(() => {
    let subscription;
  
    const startTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Allow location access to use this feature.');
          setLoading(false);
          return;
        }
  
        // Start watching location changes
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000, // Update every 2 seconds
            distanceInterval: 5, // Update if user moves 5 meters
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
    };
  
    startTracking();
  
    return () => {
      if (subscription) {
        subscription.remove(); // Cleanup the subscription when unmounting
      }
    };
  }, []);
  

  async function fetchDestinationCoordinates() {
    if (!destination) {
      Alert.alert("Enter a location");
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg`
      );
      const data = await response.json();
      if (data.features.length === 0) {
        Alert.alert("Location not found");
        return;
      }
      const [longitude, latitude] = data.features[0].center;
      getDirections([longitude, latitude]);
    } catch (error) {
      Alert.alert("Error fetching location", error.message);
    }
  }

  async function getDirections(destinationCoords) {
    if (!location) {
      Alert.alert("Current location not available");
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${location.longitude},${location.latitude};${destinationCoords[0]},${destinationCoords[1]}?geometries=geojson&access_token=sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg`
      );
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        Alert.alert("No route found");
        return;
      }
      setRoute(data.routes[0].geometry);
    } catch (error) {
      Alert.alert("Error fetching directions", error.message);
    }
  }

  async function submitReport(report) {
    if (!report) {
      Alert.alert("Error", "Please enter or select a report.");
      return;
    }
  
    //get current time & date
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toISOString().split('T')[0]; 
  
    //get current user
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      Alert.alert("Error", "Unable to get user information.");
      return;
    }
  
    //check location
    if (!location) {
      Alert.alert("Error", "Location not available.");
      return;
    }
  
    //insert into Supabase
    const response = await Database.insertIncident(
      time, 
      date, 
      report, 
      location.latitude, 
      location.longitude, 
      user.email
    );
  
    if (response) {
      Alert.alert("Report Submitted", `You reported: ${report}`);
    } else {
      Alert.alert("Error", "Failed to submit the report.");
    }
  
    //close modal
    setReportModalVisible(false);
    setCustomReport('');
  }

  async function submiteSafeReport(report) {
    if (!report) {
      
      Alert.alert("Error", "Please enter or select a report.");
      return;
    }
  
    //get current time & date
    const now = new Date();
    const time = now.toISOString().split('T')[1].split('.')[0];
    const date = now.toISOString().split('T')[0]; 
    console.log(time)
    console.log(date)
  
    //get current user
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      Alert.alert("Error", "Unable to get user information.");
      return;
    }
  
    //check location
    if (!location) {
      Alert.alert("Error", "Location not available.");
      return;
    }
  
    //insert into Supabase
    const response = await Database.insertSafetyRecord(
      time, 
      date, 
      report, 
      location.latitude, 
      location.longitude, 
      user.email
    );
  
    if (response) {
      Alert.alert("Report Submitted", `You reported: ${report}`);
    } else {
      Alert.alert("Error", "Failed to submit the report.");
    }
  
    //close modal
    setSafeModalVisible(false);
    setCustomReport('');
  }


  function triggerSOS() {
    Alert.alert("SOS Activated", "Emergency services or contacts will be notified!");
  }

  return (

    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : location ? (
        <>


          <Mapbox.MapView style={styles.map}>

            <Mapbox.Camera
                zoomLevel={14}
                centerCoordinate={[location.longitude, location.latitude]} // Default to SF if location isn't available
                followUserLocation={true} // Ensures the map follows user
                followUserMode="normal" // Keeps tracking the user
                animationMode="easeTo"
                animationDuration={1000}
              />
            <Mapbox.PointAnnotation id="userLocation" coordinate={[location.longitude, location.latitude]}>
              <View style={styles.marker} />
            </Mapbox.PointAnnotation>
            {geojson && (
              <Mapbox.ShapeSource id="heatmapSource" shape={geojson}>
                <Mapbox.HeatmapLayer
                  id="heatmapLayer"
                  sourceID="heatmapSource"
                  style={getHeatmapStyle()}
                />
              </Mapbox.ShapeSource>
            )}
            {route && (
              <Mapbox.ShapeSource id="routeSource" shape={{ type: 'LineString', coordinates: route.coordinates }}>
                <Mapbox.LineLayer id="routeLayer" style={{ lineColor: 'blue', lineWidth: 5 }} />
              </Mapbox.ShapeSource>
            )}

          </Mapbox.MapView>


          <View style = {styles.finalflex}>

          <TouchableOpacity style={styles.sosButton} onLongPress={triggerSOS}>
              <Text style = {styles.sosText}>SOS</Text>
              </TouchableOpacity>


            <TouchableOpacity style={styles.reportButton} onPress={() => setReportModalVisible(true)}>
              <Ionicons name="alert-circle-outline" size={24} color="white" />
            </TouchableOpacity>



            <TouchableOpacity style={styles.safeButton} onPress={() => setSafeModalVisible(true)}>
              <Ionicons name="lock-closed" size={24} color="white" />
            </TouchableOpacity>


            <TouchableOpacity style={styles.logoutButton} onPress={logOutAccount}>
              <Ionicons name="log-out-outline" size={20} color="white" />
            </TouchableOpacity>

          </View>

          

          <Bottomcomp/>
         





          {/* ✅ Report Modal */}
          <Modal visible={reportModalVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={() => setReportModalVisible(false)}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Report an Issue</Text>

                <FlatList
                  data={presetReports}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.reportOption} onPress={() => submitReport(item)}>
                      <Text style={styles.reportText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Describe the issue..."
                  value={customReport}
                  onChangeText={setCustomReport}
                />

                <TouchableOpacity style={styles.submitButton} onPress={() => submitReport(customReport)}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                
              </View>
            </View>
          </Modal>

          {/* safety modal */}
          <Modal visible={safeModalVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={() => setSafeModalVisible(false)}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Why is this safe?</Text>

                <TextInput
                  style={styles.input}
                  placeholder="How safe is it"
                  value={customReport}
                  onChangeText={setCustomReport}
                />

                <TouchableOpacity style={styles.submitButton} onPress={() => submiteSafeReport(customReport)}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                
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
//css pain
const styles = StyleSheet.create({
  loader: { flex: 1 },

  map: {  ...StyleSheet.absoluteFillObject, 

   },

  marker: { 
    height: 20, 
    width: 20, 
    backgroundColor: 'blue', 
    borderRadius: 10 
  },
  finalflex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 100,
    marginLeft: 10,
    marginRight: 10,

  },
  
  logoutButton: { 
    position: 'absolute',
    backgroundColor: 'red', 
    padding: 10, 
    borderRadius: 50,
    marginRight: 10,

  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
  safeButton: { 
    position: 'absolute',
    top:100,
    right:10,
    backgroundColor: 'blue', 
    padding: 15, 
    borderRadius: 50,
  },

  reportButton: { 
    position: 'absolute',
    top:160,
    right:10,
    backgroundColor: '#ff6347', 
    padding: 15, 
    borderRadius: 50 
  },
  

  sosButton: { 
    position: 'absolute',
    top:220,
    right:10,
    backgroundColor: 'red', 
    padding: 15, 
    borderRadius: 100
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },

  searchContainer: { 
    
    position: 'absolute', 
    top: 40, 
    left: 20, 
    right: 80, 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderRadius: 8, 
    padding: 10, 
    alignItems: 'center',
    elevation: 5 
  },

  searchInput: { 
    flex: 1, 
    height: 40, 
    fontSize: 16, 
    paddingHorizontal: 10 
  },

  searchButton: { 
    backgroundColor: '#007bff', 
    padding: 10, 
    borderRadius: 5 
  },

  text: { 
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 16 
  },


  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0)' 
  },

  modalContent: { 
    width: '80%', 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 10, 
    alignItems: 'center' 
  },

  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },

  reportOption: { 
    width: '100%', 
    padding: 10, 
    backgroundColor: '#f0f0f0', 
    marginVertical: 5, 
    borderRadius: 5, 
    alignItems: 'center' 
  },

  reportText: { 
    fontSize: 16 
  },

  input: { 
    width: '100%', 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5, 
    marginVertical: 10 
  },

  submitButton: { 
    backgroundColor: '#007bff', 
    padding: 10, 
    borderRadius: 5, 
    alignItems: 'center', 
    width: '100%' 
  },

  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  }
});
