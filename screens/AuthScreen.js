import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { signInWithEmail, signUpWithEmail, sendPasswordReset, addUsername } from '../utils/auth';
import { CollegeInfo, getCollegesNames } from '../utils/college_info'

import DropDownPicker from 'react-native-dropdown-picker';


export default function AuthScreen() {
  
  const collegeNames = [
    "Virginia Polytechnic Institute",
    "University of Arizona",
    "University of Minnesota",
    "Case Western Reserve University"
];

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); 
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Virginia Polytechnic Institute and State University', value: 'virginia_tech' },
    { label: 'University of Arizona', value: 'university_of_arizona' },
    { label: 'University of Minnesota', value: 'university_of_minnesota' },
    { label: 'Case Western Reserve University', value: 'case_western' }
]);

  async function handleAuth() {
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password); 
        Alert.alert('Check your inbox for verification email!');
        await addUsername(username)
      }
    } catch (error) {
      Alert.alert(error.message);
    }
    setLoading(false);
  }

  async function handlePasswordReset() {
    if (!email) return Alert.alert("Enter your email first.");
    setLoading(true);
    try {
      await sendPasswordReset(email); 
      Alert.alert('Check your inbox for password reset link.');
    } catch (error) {
      Alert.alert(error.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      
      {/*  Show Username field only if signing up */}
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        
      ) }

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!isLogin && (
            <View style={{ padding: 20 }}>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Select a University"
            />
          </View>
      )}

      <Button title={loading ? "Loading..." : isLogin ? "Login" : "Sign Up"} onPress={handleAuth} disabled={loading} />
      <Text style={styles.link} onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
      </Text>
      <Text style={styles.link} onPress={handlePasswordReset}>
        Forgot Password?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  link: {
    marginTop: 10,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

