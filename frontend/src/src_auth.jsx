import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from './firebaseConfig';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({children}){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, u=>{
      setUser(u || null);
      setLoading(false);
    });
    return ()=>unsub();
  },[]);
  return <AuthContext.Provider value={{user, loading}}>{children}</AuthContext.Provider>
}
