
class GroupWalk {

    static async createGroup() {
        const { data, error } = await supabase.from('groups').insert([{}])
        if (error) console.error('Error fetching profiles:', error);
        return data;
    }
    
}