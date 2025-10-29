

import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const API_BASE_URL = "https://shadii-com.onrender.com";

  // ---------------- STATES ----------------
  const [currentuser, setCurrentuser] = useState(null);
  const [signupData, setSignupData] = useState(null);
  const [loginData, setLoginData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchedUser, setFetchedUser] = useState(null);

  const isLoggedIn = !!currentuser;

  // ---------------- RESTORE SESSION ----------------
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        const savedSignup = localStorage.getItem("signupData");
        const savedLogin = localStorage.getItem("loginData");

        if (savedUser) setCurrentuser(JSON.parse(savedUser));
        if (savedSignup) setSignupData(JSON.parse(savedSignup));
        if (savedLogin) setLoginData(JSON.parse(savedLogin));

        // Verify with server
        const res = await axios.get(`${API_BASE_URL}/api/user/me`, {
          withCredentials: true,
          timeout: 5000,
        });

        if (res.data?.success && res.data.user) {
          setCurrentuser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          setCurrentuser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.warn("Session restore: using local data only");
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  // ---------------- LOGIN ----------------
 const AuthLogin = async (formData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/user/login`, formData, {
      withCredentials: true,
    });

    console.log("📨 Login API Response:", res.data);

    if (res.data?.success) {
      // ✅ FIXED: Safely access user data with proper fallbacks
      const userData = res.data.data?.user || res.data.user || res.data.data;
      
      // ✅ CRITICAL: Check if userData exists before using it
      if (userData) {
        setCurrentuser(userData);
        setLoginData(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("loginData", JSON.stringify(userData));

        if (res.data.token || res.data.data?.token) {
          localStorage.setItem("token", res.data.token || res.data.data.token);
        }

        console.log("✅ Login successful:", userData.email || 'User logged in');
        return { success: true, data: res.data, user: userData };
      } else {
        // Handle case where user data is missing but login was successful
        console.warn("⚠️ Login successful but user data missing");
        return {
          success: true,
          user: null,
          message: res.data.message || "Login completed"
        };
      }
    }

    throw new Error(res.data?.message || "Login failed");
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    clearStorage();
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Login failed"
    };
  }
};

  // ---------------- SIGNUP ----------------
  const AuthSignup = async (formData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/signup`, formData, {
        withCredentials: true,
      });

      console.log("📨 Signup API Response:", res.data);

      if (res.data?.success) {
        const userData = res.data.data?.user || res.data.user || res.data.data;

        if (!userData) {
          console.warn("⚠️ Signup successful but user data missing");
          return {
            success: true,
            user: null,
            message: res.data.message || "Signup completed - please login"
          };
        }

        setCurrentuser(userData);
        setSignupData(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("signupData", JSON.stringify(userData));

        if (res.data.token || res.data.data?.token) {
          localStorage.setItem("token", res.data.token || res.data.data.token);
        }

        console.log("✅ Signup successful:", userData.email || 'User created');
        return {
          success: true,
          user: userData,
          message: res.data.message || "Signup successful"
        };
      }

      throw new Error(res.data?.message || "Signup failed");
    } catch (error) {
      console.error("❌ Signup error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Signup failed",
        user: null,
      };
    }
  };

  // ---------------- LOGOUT ----------------
  const AuthLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/user/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    } finally {
      clearStorage();
      console.log("🚪 User logged out and data cleared");
    }
  };

  // ---------------- PROFILE UPDATE ----------------
  const updateProfile = async (updatedData) => {
    try {
      // console.log("💾 Updating profile with data:", updatedData);

      const res = await axios.put(
        `${API_BASE_URL}/api/user/update`,
        updatedData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("📨 Update profile response:", res.data);

      if (res.data?.success) {
        const updatedUser = res.data.data?.user || res.data.user;

        if (!updatedUser) {
          throw new Error("No user data returned after update");
        }

        setCurrentuser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        if (loginData) {
          setLoginData(updatedUser);
          localStorage.setItem("loginData", JSON.stringify(updatedUser));
        } else if (signupData) {
          setSignupData(updatedUser);
          localStorage.setItem("signupData", JSON.stringify(updatedUser));
        }

        console.log("✅ Profile updated successfully:", updatedUser.email);
        return {
          success: true,
          data: updatedUser,
          message: "Profile updated successfully"
        };
      }

      throw new Error(res.data?.message || "Profile update failed");
    } catch (error) {
      console.error("❌ Profile update error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Profile update failed";
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // ---------------- GET USER BY ID ----------------
  const getUserByID = async (userId) => {
    try {
      if (!userId) {
        console.error("❌ getUserByID: User ID is missing");
        return {
          success: false,
          message: "User ID is required"
        };
      }

      console.log("🔄 Fetching user data for ID:", userId);

      const res = await axios.get(`${API_BASE_URL}/api/user/${userId}`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      console.log("📨 getUserByID response:", res.data);

      if (res.data?.success) {
        const user = res.data.data?.user || res.data.user;

        if (!user) {
          console.warn("⚠️ getUserByID: User data missing in response");
          return {
            success: false,
            message: "User data not found"
          };
        }

        setFetchedUser(user);
        console.log("✅ User data fetched successfully:", user.email);

        return {
          success: true,
          data: user,
          message: "User data fetched successfully"
        };
      }

      throw new Error(res.data?.message || "Failed to fetch user data");
    } catch (error) {
      console.error("❌ getUserByID error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user data";
      return {
        success: false,
        message: errorMessage
      };
    }
  };




  // ---------------- HELPERS ----------------
  const clearStorage = () => {
    setCurrentuser(null);
    setSignupData(null);
    setLoginData(null);
    setFetchedUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("signupData");
    localStorage.removeItem("loginData");
    localStorage.removeItem("token");
  };

  // ---------------- CONTEXT VALUE ----------------
  const value = {
    // States
    currentuser,
    signupData,
    loginData,
    isLoggedIn,
    loading,
    getuserbyid: fetchedUser,

    // Methods
    AuthSignup,
    AuthLogin,
    AuthLogout,
    updateProfile,
    getUserByID,

    // Aliases
    signup: AuthSignup,
    login: AuthLogin,
    logout: AuthLogout,
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

