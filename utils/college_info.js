
class CollegeInfo {

     // get list of existing active groups
     static async getColleges() {
        const { data, error } = await supabase.from('colleges').select('name')
        if (error) console.error('Error fetching groups:', error);
        return data;
    }


}