import { getUsername } from "./auth";

class GroupWalk {

    // create a new group in the groups table
    static async createGroup(newName, size) {
        username = await getUsername;
        const { data, error } = await supabase.from('groups').insert([{name: newName, size: size, owner: username, lat: Location.lat, long: Location.long}])
        if (error) console.error('Error inserting group:', error);

        await joinGroup();

        return data;
    }

    // delete a given group
    static async deleteGroup(oldName) {
        await supabase.from('groups').delete().eq('name', oldName);
    }

    // join a group - edits profiles
    static async joinGroup(group) {
        username = await getUsername;
        const { data, error } = await supabase.from('profiles').update([{group: group}]).eq('username', username)
        if (error) console.error('Failed to join a group:', error);
        return data;
    }

    // leave a group
    static async leaveGroup() {
        username = await getUsername;
        const { data, error } = await supabase.from('profiles').update([{group: null}]).eq('username', username)
        if (error) console.error('Failed to join a group:', error);
        return data;

    }

    // get list of existing active groups
    static async getActiveGroups() {
        const { data, error } = await supabase.from('groups').select('name', 'lat', 'long')
        if (error) console.error('Error fetching groups:', error);
        return data;
    }
    
}