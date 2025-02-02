import Database from "./database";

class IncidenceFilter {

    static async getFilteredIncidences() {
        const incidents = await Database.getIncidentsOrderThreat();
        if (!incidents || incidents.length === 0) return [];

        const filteredIncidents = [];
        const seen = new Set();

        for (let i = 0; i < incidents.length; i++) {
            const { lat: lat1, long: long1 } = incidents[i];
            let isDuplicate = false;

            for (let j = 0; j < filteredIncidents.length; j++) {
                const { lat: lat2, long: long2 } = filteredIncidents[j];

                const distance = this.calcDistanceBetweenCoords(lat1, long1, lat2, long2);
                
                if (distance <= 100) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                filteredIncidents.push(incidents[i]);

                if (filteredIncidents.length === 50) {
                    break; // Exit loop once we hit 50 entries
                }
            }
        }

        return filteredIncidents;
    }

    static calcDistanceBetweenCoords(lat1, long1, lat2, long2) {
        const toRadians = (degree) => degree * (Math.PI / 180);
    
        const R = 6371; // Radius of Earth in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLong = toRadians(long2 - long1);
    
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
    
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
        return R * c * 1000 * 3.28084; // Distance in feet
    }
}

export default IncidenceFilter;
