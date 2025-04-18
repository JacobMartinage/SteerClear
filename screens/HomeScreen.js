import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList, Linking } from 'react-native';
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
  const [emergencyContact, setEmergencyContact] = useState(false)


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

  async function fetchEmergencyContact() {
    try {
        const data = await Database.getEmergencyContact();
        if (data && data.length > 0) {
            setEmergencyContact(data);
        } else {
            Alert.alert("No contact found", "Please update your emergency contact.");
        }
    } catch (error) {
        console.error("Error fetching emergency contact:", error);
        Alert.alert("Error", "Failed to retrieve emergency contact.");
    }
}

const sendText = async () => {
  await fetchEmergencyContact(); // Fetch the contact first

  if (emergencyContact && emergencyContact.length > 0) {
    const phoneNumber = emergencyContact[0].emergency_contact; // Extract the phone number
    console.log("Sending SMS to:", phoneNumber);

    if (phoneNumber) {
      const url = `sms:${phoneNumber}`;
      Linking.openURL(url).catch(() =>
        Alert.alert("Error", "Could not send the message")
      );
    } else {
      Alert.alert("Error", "No valid emergency contact available");
    }
  } else {
    Alert.alert("Error", "No emergency contact available");
  }
};


  //heatmap state
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    updateHeatmap(setGeojson);
  }, []);

  async function handleUpdateEmergencyContact(newContact) {
    try {
        const data =  Database.updateEmergencyContact(newContact);
        console.log(data)
        console.log(newContact)
        if (data) {
            Alert.alert("Success", "Emergency contact updated successfully!");
        } else {
            Alert.alert("Error", "Failed to update emergency contact.");
        }
    } catch (error) {
        console.error("Error updating emergency contact:", error);
        Alert.alert("Error", "An unexpected error occurred.");
    }
}


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



  useEffect(() => {
    console.log("Updated steps in HomeScreen:", steps);
  }, [steps]);
  
  useEffect(() => {
    if (steps.length > 0) {
      setStepsModalVisible(true); // Show modal when steps are received
    }
    else {
      setStepsModalVisible(false);
    }
  }, [steps]);


  // add markers to this to then display them 
  const [markers, setMarkers] = useState([
    // sample { id: "1", title: "Marker 1", coordinates: [-74.006, 40.7128] }, // New York
    //{ id: "2", title: "Marker 2", coordinates: [-118.2437, 34.0522] }, // Los Angeles
  ]);

  function handleLongPress(event) {
    const [longitude, latitude] = event.geometry.coordinates;
    setMarkers((prevMarkers) => [...prevMarkers, { id: Date.now().toString(), coordinates: [longitude, latitude] }]);
  }

  // Function to remove a marker on hold
  function handleMarkerPress(id) {
    setMarkers((prevMarkers) => prevMarkers.filter(marker => marker.id !== id));
  }


  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : location ? (
        <>
          {stepsModalVisible && (
          <View style={styles.topModalOverlay} >
            <View style={styles.topModalContent}>
              
              <View style={styles.titleRow}>
                <Text style={styles.modalTitle}>Turn-by-Turn Directions</Text>
                <TouchableOpacity
                  style={styles.closeIconContainer}
                  onPress={() => {
                    setStepsModalVisible(false);
                    setRoute(null);
                  }}
                  >
                
                  <Ionicons name="close" size={25} color="white" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={steps}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                snapToInterval={368}
                decelerationRate="fast"
                snapToAlignment="start"
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.stepItem}>
                    {/* Left arrow */}
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color="white"
                      style={styles.arrowIcon}
                    />

                    {/* Instruction text */}
                    <Text style={styles.stepText}>
                      {item.maneuver?.instruction || 'No instruction'}
                    </Text>

                    {/* Right arrow */}
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="white"
                      style={styles.arrowIcon}
                    />
                  </View>
                )}
              />
            </View>
          </View>
        )}


          <Mapbox.MapView style={styles.map} onLongPress={handleLongPress}>
            <Mapbox.Camera
              zoomLevel={14}
              centerCoordinate={[location.longitude, location.latitude]}
              followUserLocation={followUser} //allows use of recenter button
              followUserMode="normal"
              animationMode="easeTo"
              animationDuration={1000}
            />

            {markers.map((marker) => (
              <Mapbox.PointAnnotation
                key={marker.id}
                id={marker.id}
                coordinate={marker.coordinates}
                onSelected={() => handleMarkerPress(marker.id)}
              >
                <View style={styles.redMarker} />
              </Mapbox.PointAnnotation>
            ))}
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

            <TouchableOpacity 
    style={styles.sosButton} 
    onLongPress={async () => {
        await handleUpdateEmergencyContact("703-581-2790"); // Step 1: Update contact
        await fetchEmergencyContact(); // Step 2: Fetch updated contact
        await sendText(); 
    }}
>
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

  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  topModalOverlay: {
    position: 'absolute',
    top: -20, 
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'transparent',
    zIndex: 999,
    pointerEvents: 'box-none',
    // pointerEvents="box-none" is set inline
  },
  
  topModalContent: {
    // remove flex: 1
    alignSelf: 'center',
    width: '100%',
    height: 150, // or 100% of the parent if you want the entire 150px
    backgroundColor: 'rgba(0,120,255,0.9)',
    borderRadius: 10,
    zIndex: 9999,     
    pointerEvents: 'auto',  
  },
  
  /** A new container to hold the title and the close icon side by side */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 50, // or whatever vertical spacing you need
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center', // remove if you want it left-aligned
    // remove large marginTop if you are using titleRow margin
  },
  
  closeIconContainer: {
    // Remove absolute positioning
    padding: 8,
  },
  
  stepItem: {
    width: 350,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginLeft: 10,
    marginRight: 10,
  },

  
  stepText: {
    fontSize: 16,
    textAlign: 'center',
    flexShrink: 1,
    color: 'white',
    fontWeight: 'bold',
  },
  
  closeButton: {
    marginTop:0,
    padding: 0,
    backgroundColor: '#ccc',
    borderRadius: 4,
    alignSelf: 'center',
  },
  redMarker: {
    height: 20,
    width: 20,
    backgroundColor: 'red',
    borderRadius: 10,
  },

});