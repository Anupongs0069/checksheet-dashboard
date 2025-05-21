// src/app/components/ActivityTracker.jsx
"use client";
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ActivityTracker = ({ children }) => {
  const auth = useAuth();

  const isLoggedIn = auth?.isLoggedIn;
  const resetLogoutTimer = auth?.resetLogoutTimer;

  useEffect(() => {

    if (!auth || !isLoggedIn) return;
    
    if (typeof resetLogoutTimer !== 'function') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetLogoutTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [auth, isLoggedIn, resetLogoutTimer]);

  return children;
};

export default ActivityTracker;