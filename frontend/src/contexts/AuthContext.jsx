// ./src/contexts/AuthContext.jsx

"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const AuthContext = createContext(null);
const AUTO_LOGOUT_TIME = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const startLogoutTimer = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (logoutTimer) clearTimeout(logoutTimer);

    const timer = setTimeout(() => {
      logout();
      router.push("/main-menu/login");

      Swal.fire({
        title: 'Session Timeout',
        text: 'Your session has expired. Please log in again.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }, AUTO_LOGOUT_TIME);

    setLogoutTimer(timer);
  }, [logoutTimer, router]);

  const resetLogoutTimer = useCallback(() => {
    if (isLoggedIn) {
      startLogoutTimer();
    }
  }, [isLoggedIn, startLogoutTimer]);

  const checkLoginStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);

    try {
      const storedToken = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "null");

      if (storedToken && userData) {
        setIsLoggedIn(true);
        setUser(userData);
        setToken(storedToken);
        startLogoutTimer();
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
        if (logoutTimer) clearTimeout(logoutTimer);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logoutTimer, startLogoutTimer]);

  useEffect(() => {
    checkLoginStatus();
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  const login = (newToken, userData) => {
    if (!newToken || !userData) {
      console.error("Invalid login data:", { newToken: !!newToken, userData: !!userData });
      return;
    }
    console.log("Setting user data:", userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
    setToken(newToken);
    startLogoutTimer();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    if (logoutTimer) clearTimeout(logoutTimer);
    setLogoutTimer(null);
  };

  const getAuthHeader = useCallback(() => {
    const currentToken = token || localStorage.getItem("token");
    return currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        token,
        login,
        logout,
        checkLoginStatus,
        getAuthHeader,
        resetLogoutTimer,
        isAuthenticated: isLoggedIn,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);