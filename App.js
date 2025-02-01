import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { createClient, Session } from '@supabase/supabase-js'; // Import required Supabase modules

// ✅ Initialize Supabase
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

Mapbox.setAccessToken('sk.eyJ1IjoiamFxdWliaXMiLCJhIjoiY202bWZvODdjMGtmeTJtcHl1NnB5bXA1MiJ9.87f4lSh43tG1Qxvaus4K8A');

const App = () => {
    // ✅ Supabase auth session state 
    const [session, setSession] = useState(null);

    useEffect(() => {
        // ✅ Fetch initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // ✅ Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <View style={styles.page}>
            <View style={styles.container}>
                <Mapbox.MapView style={styles.map} />
                {session ? (
                    <Text className="text-white text-lg font-bold">Welcome, User!</Text>
                ) : (
                    <Text className="text-red-500 text-lg">Not Logged In</Text>
                )}
            </View>
        </View>
    );
};

export default App;

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        height: 300,
        width: 300,
    },
    map: {
        flex: 1
    }
});
