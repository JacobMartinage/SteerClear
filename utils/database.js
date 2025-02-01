
class Database {
    
    /**
     * Get all safety records
     * @returns {Promise<any[]>} A promise that resolves to an array of safety records
     */
    static async getAllSafetyRecords() {
      const { data, error } = await supabase.from('safety').select('*');
      if (error) console.error('Error fetching safety records:', error);
      return data;
    }
  
    /**
     * Get safety records by account
     * @param {string} account The account to filter by
     * @returns {Promise<any[]>} A promise that resolves to an array of safety records
     */
    static async getSafetyRecordsByAccount(account) {
      const { data, error } = await supabase.from('safety').select('*').eq('account', account);
      if (error) console.error('Error fetching safety records for account:', error);
      return data;
    }
  
    /**
     * Get all safe areas
     * @returns {Promise<any[]>} A promise that resolves to an array of safe areas
     */
    static async getAllSafeAreas() {
      const { data, error } = await supabase.from('safe_areas').select('*');
      if (error) console.error('Error fetching safe areas:', error);
      return data;
    }
  
    /**
     * Get all profiles
     * @returns {Promise<any[]>} A promise that resolves to an array of profiles
     */
    static async getAllProfiles() {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) console.error('Error fetching profiles:', error);
      return data;
    }
  
    /**
     * Get profile by username
     * @param {string} username The username to filter by
     * @returns {Promise<any>} A promise that resolves to a single profile
     */
    static async getProfileByUsername(username) {
      const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();
      if (error) console.error('Error fetching profile:', error);
      return data;
    }
  
    /**
     * Get all groups
     * @returns {Promise<any[]>} A promise that resolves to an array of groups
     */
    static async getAllGroups() {
      const { data, error } = await supabase.from('groups').select('*');
      if (error) console.error('Error fetching groups:', error);
      return data;
    }
  
    /**
     * Get group by name
     * @param {string} groupName The name to filter by
     * @returns {Promise<any>} A promise that resolves to a single group
     */
    static async getGroupByName(groupName) {
      const { data, error } = await supabase.from('groups').select('*').eq('name', groupName).single();
      if (error) console.error('Error fetching group:', error);
      return data;
    }
  
    /**
     * Get all incidents
     * @returns {Promise<any[]>} A promise that resolves to an array of incidents
     */
    static async getAllIncidents() {
      const { data, error } = await supabase.from('incidents').select('*');
      if (error) console.error('Error fetching incidents:', error);
      return data;
    }
  
    /**
     * Get incidents by threat level
     * @param {string} level The threat level to filter by
     * @returns {Promise<any[]>} A promise that resolves to an array of incidents
     */
    static async getIncidentsByThreatLevel(level) {
      const { data, error } = await supabase.from('incidents').select('*').eq('threat_level', level);
      if (error) console.error('Error fetching incidents by threat level:', error);
      return data;
    }
  
    /**
     * Get user's group information
     * @param {string} username The username to filter by
     * @returns {Promise<any>} A promise that resolves to a single group
     */
    static async getUserGroup(username) {
      const { data, error } = await supabase.from('profiles').select('group').eq('username', username).single();
      if (error) console.error('Error fetching user group:', error);
      return data;
    }
  
    /**
     * Insert a new safety record
     * @param {string} time The time of the safety record
     * @param {string} date The date of the safety record
     * @param {number} lat The latitude of the safety record
     * @param {number} long The longitude of the safety record
     * @param {string} safetyLevel The safety level of the safety record
     * @param {string} description The description of the safety record
     * @param {string} account The account to associate with the safety record
     * @returns {Promise<any>} A promise that resolves to the inserted safety record
     */
    static async insertSafetyRecord(time, date, lat, long, safetyLevel, description, account) {
      const { data, error } = await supabase.from('safety').insert([
        { time, date, lat, long, safety_level: safetyLevel, description, account }
      ]);
      if (error) console.error('Error inserting safety record:', error);
      return data;
    }
  
    /**
     * Insert a new safe area
     * @param {number} lat The latitude of the safe area
     * @param {number} long The longitude of the safe area
     * @param {string} description The description of the safe area
     * @param {string} account The account to associate with the safe area
     * @param {number} radius The radius of the safe area
     * @param {string} type The type of the safe area
     * @returns {Promise<any>} A promise that resolves to the inserted safe area
     */
    static async insertSafeArea(lat, long, description, account, radius, type) {
      const { data, error } = await supabase.from('safe_areas').insert([
        { lat, long, description, account, radius, type }
      ]);
      if (error) console.error('Error inserting safe area:', error);
      return data;
    }
  
    /**
     * Insert a new profile
     * @param {number} currentLat The current latitude of the profile
     * @param {number} currentLong The current longitude of the profile
     * @param {string} username The username of the profile
     * @param {string} group The group of the profile
     * @returns {Promise<any>} A promise that resolves to the inserted profile
     */
    static async insertProfile(currentLat, currentLong, username, group) {
      const { data, error } = await supabase.from('profiles').insert([
        { current_location_lat: currentLat, current_location_long: currentLong, username, group, id: crypto.randomUUID() }
      ]);
      if (error) console.error('Error inserting profile:', error);
      return data;
    }
  
    /**
     * Insert a new group
     * @param {string} name The name of the group
     * @param {number} size The size of the group
     * @param {string} createdBy The creator of the group
     * @param {string} owner The owner of the group
     * @returns {Promise<any>} A promise that resolves to the inserted group
     */
    static async insertGroup(name, size, createdBy, owner) {
      const { data, error } = await supabase.from('groups').insert([
        { name, size, created_by: createdBy, owner }
      ]);
      if (error) console.error('Error inserting group:', error);
      return data;
    }
  
    /**
     * Insert a new incident
     * @param {string} time The time of the incident
     * @param {string} date The date of the incident
     * @param {string} description The description of the incident
     * @param {string} threatLevel The threat level of the incident
     * @param {number} lat The latitude of the incident
     * @param {number} long The longitude of the incident
     * @param {string} account The account to associate with the incident
     * @returns {Promise<any>} A promise that resolves to the inserted incident
     */
    static async insertIncident(time, date, description, threatLevel, lat, long, account) {
      const { data, error } = await supabase.from('incidents').insert([
        { time, date, description, threat_level: threatLevel, lat, long, account }
      ]);
      if (error) console.error('Error inserting incident:', error);
      return data;
    }
  }
  
  export default Database;