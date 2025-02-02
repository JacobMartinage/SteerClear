// routing.js

import { Alert } from 'react-native';
import IncidenceFilter from './incidence_filter';

// Convert array of incidents to comma-separated point(...) for exclude
function buildExcludePoints(incidents) {
  // e.g. "point(-73.992 40.764),point(-74.001 40.756)"
  return incidents
    .map(inc => `point(${inc.long} ${inc.lat})`)
    .join(',');
}

/** Calculate midpoint of two coords: [lon, lat] and [lon, lat] */
function getMidpoint(coord1, coord2) {
  return [
    (coord1[0] + coord2[0]) / 2,
    (coord1[1] + coord2[1]) / 2
  ];
}

/** 
 * Filter incidents near midpoint within 1.25× user→midpoint distance 
 */
async function getIncidentsNearMidpoint(userLocation, destinationCoords) {
  // midpoint of user and destination (both are [lon, lat] in usage)
  const midpoint = getMidpoint(
    [userLocation.longitude, userLocation.latitude],
    destinationCoords
  );

  // distance from user -> midpoint in feet
  const distanceUM = IncidenceFilter.calcDistanceBetweenCoords(
    userLocation.latitude, userLocation.longitude,
    midpoint[1], midpoint[0]
  );
  const searchRadius = distanceUM * 1.25; 

  const allIncidents = await IncidenceFilter.getFilteredIncidences();

  return allIncidents.filter(incident => {
    const dist = IncidenceFilter.calcDistanceBetweenCoords(
      incident.lat, incident.long,
      midpoint[1], midpoint[0]
    );
    return dist <= searchRadius; // in feet
  });
}

/**
 * getDirections
 * -------------
 * 1) Finds top-50 incidents near midpoint
 * 2) Builds exclude string: "motorway,toll,point(...)"
 * 3) Calls mapbox driving directions (BETA exclude points)
 * 4) Sets route in state (for <Mapbox.ShapeSource/>).
 */
export async function getDirections(userLocation, destinationCoords, setRoute) {
  if (!userLocation) {
    Alert.alert("Current location not available");
    return;
  }

  try {
    //get incidents in the surrounding area
    const avoidanceIncidents = await getIncidentsNearMidpoint(
      userLocation,
      destinationCoords
    );

    //convert to point format
    const excludePoints = buildExcludePoints(avoidanceIncidents);

    //mapbox api only allows exclude points on driving directions, so we're using driving directions and then avoiding motorways and tolls
    let baseExcludes = "motorway,toll";  
    if (excludePoints) {
      baseExcludes += `,${excludePoints}`;
    }

    console.log("Excludes: ", baseExcludes);
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/` +
      `${userLocation.longitude},${userLocation.latitude};${destinationCoords[0]},${destinationCoords[1]}` +
      `?geometries=geojson` +
      `&exclude=${baseExcludes}` +
      `&overview=full` +
      `&access_token=sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg`
    );

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      Alert.alert("No route found");
      return;
    }

    // 5) set the route geometry in state
    setRoute(data.routes[0].geometry);

  } catch (error) {
    Alert.alert("Error fetching directions", error.message);
  }
}
