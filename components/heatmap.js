import { supabase } from '../lib/supabase';

/**
 * Fetch incidents for the heatmap from Supabase
 * @returns {Promise<Array>} Array of incident objects with lat, lng, and threat_level
 */
export async function fetchHeatmapData() {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('lat, long, threat_level');

    if (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }

    return data.map((incident) => ({
      coordinates: [incident.long, incident.lat],
      weight: incident.threat_level,
    }));
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return [];
  }
}

/**
 * Convert incident data to GeoJSON format
 * @param {Array} data Array of incident objects
 * @returns {Object} GeoJSON FeatureCollection
 */
export function convertToGeoJSON(data) {
  return {
    type: 'FeatureCollection',
    features: data.map((point) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: point.coordinates,
      },
      properties: {
        weight: point.weight, // Use this for heatmap intensity
      },
    })),
  };
}

/**
 * Get the heatmap style configuration
 * @returns {Object} Heatmap layer style configuration
 */
export function getHeatmapStyle() {
    return {
      heatmapWeight: [
        'interpolate',
        ['linear'],
        ['get', 'weight'], 
        0,
        0,
        10,
        1, //map weights from 0 to 1
      ],
      heatmapIntensity: [ //intensity of a single point at different zoom levels
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        10, 
        22,
        2, 
      ],
      heatmapRadius: [ //increase radius with zoom level (must be strictly increasing and starting pretty big to emphasize the danger)
        'interpolate',
        ['linear'],
        ['zoom'],
        10,
        20, 
        30,
        40,
        42,
        60, 
      ],
      heatmapOpacity: 0.6,
      heatmapColor: [ //blue to red gradient
        'interpolate',
        ['linear'],
        ['heatmap-density'], 
        0,
        'rgba(100, 231, 116, 0.2)',
        0.1,
        'rgb(103,169,207)',
        0.2,
        'rgb(209,229,240)',
        0.4,
        'rgb(253,219,199)',
        0.6,
        'rgb(239,138,98)',
        0.8,
        'rgb(178,24,43)',
        1,
        'rgb(94, 1, 29)', 
      ],
    };
  }
  

/**
 * Update heatmap data and GeoJSON source
 * @param {Function} setGeojson React state setter for GeoJSON
 */
export async function updateHeatmap(setGeojson) {
  try {
    const data = await fetchHeatmapData(); // Fetch incidents from Supabase
    const geoJSONData = convertToGeoJSON(data); // Convert incidents to GeoJSON
    setGeojson(geoJSONData); // Update state with new GeoJSON data
  } catch (error) {
    console.error('Error updating heatmap data:', error);
  }
}
