// src/app/ClientProviders.tsx

"use client";

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ActivityTracker from './components/ActivityTracker';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  isLoggedIn?: boolean;
  user?: User | null;
  token?: string | null;
  login?: (token: string, userData: User) => void;
  logout?: () => void;
  checkLoginStatus?: () => void;
  getAuthHeader?: () => Record<string, string>;
  resetLogoutTimer?: () => void;
}

export default function AutoLogoutHandler() {

  const auth = useAuth() ?? {} as AuthContextType;
  
  if (auth.isLoggedIn) {
    return <ActivityTracker>{null}</ActivityTracker>;
  }
  
  return null;
}