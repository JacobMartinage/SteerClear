import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { signInWithEmail, signUpWithEmail, sendPasswordReset } from '../utils/auth'; // ✅ Import from auth.ts

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login & Signup

  async function handleAuth() {
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password); // ✅ Use function from auth.js
      } else {
        await signUpWithEmail(email, password); // ✅ Use function from auth.js
        Alert.alert('Check your inbox for verification email!');
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
      await sendPasswordReset(email); // ✅ Use function from auth.js
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
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
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
