import { Alert } from 'react-native';
import IncidenceFilter from '../utils/incidence_filter';

/**
 * Convert array of incidents to comma-separated point(...) for exclude
 */
function buildExcludePoints(incidents) {
  if (!incidents || incidents.length === 0) return '';
  return incidents.map(inc => `point(${inc.long} ${inc.lat})`).join(',');
}

/**
 * Calculate midpoint between two coordinates
 */
function getMidpoint(coord1, coord2) {
  return [(coord1[0] + coord2[0]) / 2, (coord1[1] + coord2[1]) / 2];
}

/**
 * Filter & sort incidents near midpoint, return top 50
 */
async function getIncidentsNearMidpoint(userLocation, destinationCoords) {
  const midpoint = getMidpoint([userLocation.longitude, userLocation.latitude], destinationCoords);

  const distanceUM = IncidenceFilter.calcDistanceBetweenCoords(
    userLocation.latitude, userLocation.longitude,
    midpoint[1], midpoint[0]
  );
  const searchRadius = distanceUM * 1.5;

  const allIncidents = await IncidenceFilter.getFilteredIncidences();

  let nearbyIncidents = allIncidents.filter(incident => {
    const dist = IncidenceFilter.calcDistanceBetweenCoords(
      incident.lat, incident.long,
      midpoint[1], midpoint[0]
    );
    return dist <= searchRadius;
  });

  nearbyIncidents.sort((a, b) => {
    const distA = IncidenceFilter.calcDistanceBetweenCoords(a.lat, a.long, midpoint[1], midpoint[0]);
    const distB = IncidenceFilter.calcDistanceBetweenCoords(b.lat, b.long, midpoint[1], midpoint[0]);
    return distA - distB;
  });

  return nearbyIncidents.slice(0, 50);
}

/**
 * Fetch and process directions from Mapbox
 */
export async function getDirections(userLocation, destinationCoords, setRoute, setSteps) {
  if (!userLocation) {
    Alert.alert("Current location not available");
    return;
  }

  try {
    const avoidanceIncidents = await getIncidentsNearMidpoint(userLocation, destinationCoords);
    const excludePoints = buildExcludePoints(avoidanceIncidents);
    let baseExcludes = 'motorway,toll';

    if (excludePoints) {
      baseExcludes += `,${excludePoints}`;
    }

    const MAPBOX_ACCESS_TOKEN = 'sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg';
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${destinationCoords[0]},${destinationCoords[1]}?geometries=geojson&steps=true&banner_instructions=true&access_token=${MAPBOX_ACCESS_TOKEN}&exclude=${baseExcludes}`;

    console.log("Fetching directions with excludes: ", baseExcludes);
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      Alert.alert("No route found");
      return;
    }

    const routeGeometry = data.routes[0].geometry;
    const steps = data.routes[0].legs[0].steps;
    setRoute(routeGeometry);
    setSteps(steps);

  } catch (error) {
    Alert.alert("Error fetching directions", error.message);
  }
}
