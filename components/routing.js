import { Alert } from 'react-native';
import IncidenceFilter from './incidenceFilter';

/**
 * Calculate the midpoint between the user and destination
 */
function getMidpoint(coord1, coord2) {
    return [
        (coord1[0] + coord2[0]) / 2,
        (coord1[1] + coord2[1]) / 2
    ];
}

/**
 * Fetch incidents near the midpoint
 */
async function getIncidentsNearMidpoint(userLocation, destinationCoords) {
    const midpoint = getMidpoint([userLocation.longitude, userLocation.latitude], destinationCoords);
    const searchRadius = IncidenceFilter.calcDistanceBetweenCoords(
        userLocation.latitude, userLocation.longitude,
        midpoint[1], midpoint[0]
    ) * 1.2; // Slightly larger radius

    const allIncidents = await IncidenceFilter.getFilteredIncidences();
    return allIncidents.filter(incident => 
        IncidenceFilter.calcDistanceBetweenCoords(
            incident.lat, incident.long,
            midpoint[1], midpoint[0]
        ) <= searchRadius
    );
}

/**
 * Get directions from Mapbox API with avoidance points
 */
export async function getDirections(userLocation, destinationCoords, setRoute) {
    if (!userLocation) {
        Alert.alert("Current location not available");
        return;
    }

    try {
        const avoidanceIncidents = await getIncidentsNearMidpoint(userLocation, destinationCoords);
        const avoidCoords = avoidanceIncidents.map(incident => `${incident.long},${incident.lat}`).join(';');

        const avoidParam = avoidCoords ? `&avoid=${avoidCoords}` : '';

        const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation.longitude},${userLocation.latitude};${destinationCoords[0]},${destinationCoords[1]}?geometries=geojson${avoidParam}&access_token=sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWp6Z2ZzMGtraDJrcHoxNjdrbm9qdSJ9.fix3XfnvCj6cqlj6D3vFpg`
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
