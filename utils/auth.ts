import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

// ✅ Sign In Function
export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

// ✅ Sign Up Function
export async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password});
  if (error) throw error;
}

// ✅ Password Reset Function
export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

// ✅ Logout Function
export async function logOutAccount() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getAccountID() {
  const res = (await supabase.auth.getUser()).data.user.id

  return res;

}

export async function addUsername(newUsername: string) {
  const currUser = await getAccountID();
  const { error } = await supabase.from('profiles').update({username: newUsername}).eq('id', currUser);
}
