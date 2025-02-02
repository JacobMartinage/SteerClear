import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { logOutAccount } from '../utils/auth';
import { Ionicons } from '@expo/vector-icons';
import Database from "../utils/database";
import { supabase } from "../lib/supabase";
import Bottomcomp from '../components/bottom_sheet';
import { fetchHeatmapData, convertToGeoJSON, getHeatmapStyle, updateHeatmap } from '../components/heatmap';
import DialogInput from 'react-native-dialog-input';
import OptionsModal from '../components/settings_modal';
import ReportModal from '../components/reports_modal';
import SafetyModal from '../components/safety_modal';


//set token
Mapbox.setAccessToken('sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg');

export default function HomeScreen() {
  const camera = React.useRef(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [customReport, setCustomReport] = useState('');
  const [safeModalVisible, setSafeModalVisible] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [userName, setUserName] = React.useState('');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [steps, setSteps] = useState([]);
  const [stepsModalVisible, setStepsModalVisible] = useState(false);


  const presetReports = [
    "I Felt Unsafe",
    "Suspicious Activity",
    "Violent Crime witnessed",
    "Theft or Robbery",
    "Harassment",
    "Low Light Level",
  ];
  const presetSafety = [
    "Blue Lights",
    "Police",
    "Fire Department",
    "College Buildings",
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

  function recenterOnUser() {
    console.log("Recenter pressed", location);
    if (location) {
      setFollowUser(true);
      setTimeout(() => setFollowUser(false), 2000);
    } else {
      console.log("Missing location:", location);
    }
  }
  
  
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

  function triggerSOS() {
    Alert.alert('SOS Activated', 'Emergency services or contacts will be notified!');
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

  useEffect(() => {
    console.log("Updated steps in HomeScreen:", steps);
  }, [steps]);
  
  useEffect(() => {
    if (steps.length > 0) {
      setStepsModalVisible(true); // Show modal when steps are received
    }
  }, [steps]);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : location ? (
        <>
           {steps.length > 0 && (
            <FlatList
              data={steps}
              horizontal
              pagingEnabled
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.bannerItem}>
                  <Text style={styles.instructionText}>
                    {item.maneuver ? item.maneuver.instruction : "No instruction"}
                  </Text>
                </View>
              )}
              style={styles.bannerContainer}
            />
          )}

          <Mapbox.MapView style={styles.map}>
            <Mapbox.Camera
              zoomLevel={14}
              centerCoordinate={[location.longitude, location.latitude]}
              followUserLocation={followUser} //allows use of recenter button
              followUserMode="normal"
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
              <Mapbox.ShapeSource
                id="routeSource"
                shape={{ type: 'LineString', coordinates: route.coordinates }}
              >
                <Mapbox.LineLayer
                  id="routeLayer"
                  style={{ lineColor: 'blue', lineWidth: 5 }}
                />
              </Mapbox.ShapeSource>
            )}
          </Mapbox.MapView>

           {/* Steps Modal */}
           <Modal animationType="slide" transparent={true} visible={stepsModalVisible}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Turn-by-Turn Directions</Text>
                <FlatList
                  data={steps}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.stepItem}>
                      <Text style={styles.stepText}>{item.maneuver?.instruction || "No instruction"}</Text>
                    </View>
                  )}
                />
                <TouchableOpacity style={styles.closeButton} onPress={() => setStepsModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


          {/* Modals */}
          <OptionsModal visible={optionsModal} onClose={() => setOptionsModal(false)} logOutAccount={logOutAccount} />

          <ReportModal 
          visible={reportModalVisible} 
          onClose={() => setReportModalVisible(false)} 
          location={location} 
           presetReports={presetReports} />

            <SafetyModal 
              visible={safeModalVisible} 
              onClose={() => setSafeModalVisible(false)} 
              location={location} 
              presetSafety={presetSafety}/>


          <View style={styles.finalflex}>
            <TouchableOpacity style={styles.recenterButton} onPress={recenterOnUser}>
              <Ionicons name="locate" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sosButton} onLongPress={triggerSOS}>
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reportButton} onPress={() => setReportModalVisible(true) }>
              <Ionicons name="alert-circle-outline" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.safeButton} onPress={() => setSafeModalVisible(true)}>
              <Ionicons name="lock-closed" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionsbutton} onPress={() => setOptionsModal(true)}>
              <Ionicons name="options" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <Bottomcomp location={location} setRoute={setRoute} setSteps={setSteps} />


        </>
      ) : (
        <Text style={styles.text}>No Location Data</Text>
      )}
    </View>
  );
}

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
  recenterButton: { 
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#4287f5',
    padding: 15,
    borderRadius: 50,
  },

  optionsbutton: { 
    position: 'absolute',
    backgroundColor: 'gray', 
    padding: 10, 
    borderRadius: 50,
    marginRight: 10,
  },
  safeButton: { 
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'blue', 
    padding: 15, 
    borderRadius: 50,
  },
  reportButton: { 
    position: 'absolute',
    top: 160,
    right: 10,
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
  text: { 
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 16 
  },
  bannerContainer: {
    position: 'absolute',
    top: 50,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
  
  },

  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  }
});