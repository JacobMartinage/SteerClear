import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState } from 'react-native'
import { supabase } from '../lib/supabase'



export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  async function logOutAccount() {
    setLoading(true)
    const { error } = await supabase.auth.signOut()

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  
  async function deleteAccount() {
    setLoading(true)
    const { error } = await supabase.functions.invoke('delete-user');
    // then need to go to home page

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  // for a given email 
  async function sendPasswordReset(emailReset) {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(emailReset)

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

}