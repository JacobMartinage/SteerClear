import { supabase } from '../lib/supabase';

     // get list of existing active groups
     export async function getColleges() {
        const { data, error } = await supabase.from('colleges').select()
        if (error) console.error('Error fetching groups:', error);
        return data;
    }

     // get list of existing active groups
     export async function getCollegesNames() {
        const { data, error } = await supabase.from('colleges').select('name')
        if (error) console.error('Error fetching groups:', error);
        return data;
    }

     // get list of existing active groups
     export async function addCollege(collegename) {
        username = await getUsername;
        const { data, error } = await supabase.from('profiles').update([{college: collegename}]).eq('username', username)
        if (error) console.error('Error fetching groups:', error);
        return data;
    }

     // Parse resources from JSON to make them easy to use in components
     export async function  parseCollegeResources(resourcesJson) {
        return resourcesJson.resources.map(resource => ({
            name: resource.name,
            description: resource.description,
            contact: resource.contact,
            services: resource.services
        }));
    }




