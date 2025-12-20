


import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import {
  User, Camera, MapPin, Briefcase, GraduationCap,
  Users, Heart, Star, Edit3, Save, X,
  Calendar, Phone, Mail, Shield, Globe,
  CheckCircle, AlertCircle, Upload,
  ArrowLeft, Award, Target, Zap,
  Eye, EyeOff, Trash2, Plus, Minus, ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../Context/Authcontext.js';

// Initial state template matching your schema
const initialState = {
  // Basic fields
  email: '',
  phone: '',
  profilePhoto: '',
  gallery: [],
  profileCompletion: 0,

  // Nested objects
  personalInfo: {
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    maritalStatus: 'never_married',
    height: { value: 0, unit: 'cm' },
    weight: 0,
    physicalStatus: 'normal',
    bloodGroup: '',
    aboutMe: ''
  },

  profileImage: '', // 🆕 Added for Profile Image tab

  religiousInfo: {
    religion: '',
    caste: '',
    subCaste: '',
    gotra: '',
    motherTongue: '',
    ethnicOrigin: '',
    horoscope: {
      hasHoroscope: false,
      rashi: '',
      nakshatra: '',
      manglik: false
    }
  },

  professionalInfo: {
    education: {
      highestDegree: '',
      field: '',
      institute: '',
      yearOfPassing: 0,
      educationLevel: ''
    },
    occupation: '',
    jobTitle: '',
    company: '',
    income: {
      annual: 0,
      currency: 'INR',
      display: true
    },
    workLocation: {
      city: '',
      state: '',
      country: ''
    }
  },

  familyInfo: {
    familyType: 'nuclear',
    familyStatus: 'middle',
    father: {
      occupation: '',
      isAlive: true
    },
    mother: {
      occupation: '',
      isAlive: true
    },
    siblings: {
      brothers: { total: 0, married: 0 },
      sisters: { total: 0, married: 0 }
    },
    nativePlace: {
      city: '',
      state: '',
      country: ''
    },
    livingWithParents: false,
    familyValues: []
  },

  lifestyleInfo: {
    diet: 'vegetarian',
    smoking: 'non_smoker',
    drinking: 'non_drinker',
    hobbies: [],
    interests: [],
    languages: []
  },

  location: {
    current: {
      country: '',
      state: '',
      city: '',
      zipCode: ''
    },
    permanent: {
      country: '',
      state: '',
      city: '',
      zipCode: ''
    },
    citizenship: 'Indian',
    residencyStatus: 'citizen'
  },

  partnerPreferences: {
    ageRange: { min: 0, max: 0 },
    heightRange: { min: 0, max: 0 },
    maritalStatus: [],
    religions: [],
    castes: [],
    education: {
      level: [],
      specific: []
    },
    occupations: [],
    incomeRange: { min: 0, max: 0 },
    location: {
      countries: [],
      states: [],
      cities: []
    },
    lifestyle: {
      diet: [],
      smoking: [],
      drinking: []
    }
  },

  privacySettings: {
    profileVisibility: 'public',
    showContactInfo: false,
    showIncome: true,
    showLastActive: true
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    getUserByID,
    currentuser,
    isLoggedIn,
    updateProfile,
    loading: authLoading
  } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(initialState);
  const [uploadingImage, setUploadingImage] = useState(false);

  console.log(currentuser);
  
  // Helper function for deep merging user data
  const deepMergeUserData = (fetchedData) => {
    if (!fetchedData) return initialState;

    return {
      ...initialState,
      ...fetchedData,
      personalInfo: {
        ...initialState.personalInfo,
        ...fetchedData.personalInfo,
        height: {
          ...initialState.personalInfo.height,
          ...fetchedData.personalInfo?.height
        }
      },
      religiousInfo: {
        ...initialState.religiousInfo,
        ...fetchedData.religiousInfo,
        horoscope: {
          ...initialState.religiousInfo.horoscope,
          ...fetchedData.religiousInfo?.horoscope
        }
      },
      professionalInfo: {
        ...initialState.professionalInfo,
        ...fetchedData.professionalInfo,
        education: {
          ...initialState.professionalInfo.education,
          ...fetchedData.professionalInfo?.education
        },
        income: {
          ...initialState.professionalInfo.income,
          ...fetchedData.professionalInfo?.income
        },
        workLocation: {
          ...initialState.professionalInfo.workLocation,
          ...fetchedData.professionalInfo?.workLocation
        }
      },
      familyInfo: {
        ...initialState.familyInfo,
        ...fetchedData.familyInfo,
        father: {
          ...initialState.familyInfo.father,
          ...fetchedData.familyInfo?.father
        },
        mother: {
          ...initialState.familyInfo.mother,
          ...fetchedData.familyInfo?.mother
        },
        siblings: {
          ...initialState.familyInfo.siblings,
          ...fetchedData.familyInfo?.siblings
        },
        nativePlace: {
          ...initialState.familyInfo.nativePlace,
          ...fetchedData.familyInfo?.nativePlace
        }
      },
      lifestyleInfo: {
        ...initialState.lifestyleInfo,
        ...fetchedData.lifestyleInfo
      },
      location: {
        ...initialState.location,
        ...fetchedData.location,
        current: {
          ...initialState.location.current,
          ...fetchedData.location?.current
        },
        permanent: {
          ...initialState.location.permanent,
          ...fetchedData.location?.permanent
        }
      },
      partnerPreferences: {
        ...initialState.partnerPreferences,
        ...fetchedData.partnerPreferences,
        ageRange: {
          ...initialState.partnerPreferences.ageRange,
          ...fetchedData.partnerPreferences?.ageRange
        },
        heightRange: {
          ...initialState.partnerPreferences.heightRange,
          ...fetchedData.partnerPreferences?.heightRange
        },
        education: {
          ...initialState.partnerPreferences.education,
          ...fetchedData.partnerPreferences?.education
        },
        incomeRange: {
          ...initialState.partnerPreferences.incomeRange,
          ...fetchedData.partnerPreferences?.incomeRange
        },
        location: {
          ...initialState.partnerPreferences.location,
          ...fetchedData.partnerPreferences?.location
        },
        lifestyle: {
          ...initialState.partnerPreferences.lifestyle,
          ...fetchedData.partnerPreferences?.lifestyle
        }
      },
      privacySettings: {
        ...initialState.privacySettings,
        ...fetchedData.privacySettings
      }
    };
  };

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const userId = currentuser?._id || currentuser?.id;

        if (!userId) {
          console.warn("No user ID available");
          setLoading(false);
          return;
        }

        console.log("🔄 Fetching user data for ID:", userId);

        const result = await getUserByID(userId);

        console.log("📨 getUserByID result:", result);

        if (result.success && result.data) {
          console.log("✅ User data fetched successfully:", result.data);
          const mergedData = deepMergeUserData(result.data);
          setUserData(mergedData);
        } else {
          console.warn("⚠️ Using currentuser as fallback");
          if (currentuser) {
            const mergedData = deepMergeUserData(currentuser);
            setUserData(mergedData);
          }
        }
      } catch (error) {
        console.error("❌ Error in fetchUserData:", error);
        if (currentuser) {
          const mergedData = deepMergeUserData(currentuser);
          setUserData(mergedData);
        }
        toast.error("Failed to load fresh profile data. Using cached data.");
      } finally {
        setLoading(false);
      }
    };

    if (currentuser && (currentuser._id || currentuser.id)) {
      fetchUserData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [currentuser]);

  // Handle array updates for multi-select fields
  const handleArrayUpdate = (section, field, value, operation) => {
    setUserData(prev => {
      const currentArray = prev[section]?.[field] || [];
      let newArray;

      if (operation === 'add') {
        newArray = [...currentArray, value];
      } else {
        newArray = currentArray.filter(item => item !== value);
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  // Handle nested array updates
  const handleNestedArrayUpdate = (section, subSection, field, value, operation) => {
    setUserData(prev => {
      const currentArray = prev[section]?.[subSection]?.[field] || [];
      let newArray;

      if (operation === 'add') {
        newArray = [...currentArray, value];
      } else {
        newArray = currentArray.filter(item => item !== value);
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: {
            ...prev[section]?.[subSection],
            [field]: newArray
          }
        }
      };
    });
  };

  // Profile image upload handler
  const handleProfileImageUpload = async (file) => {
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, JPG, and WEBP formats are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append('image', file);

      const userId = currentuser?._id;
      const token = localStorage.getItem('token') || currentuser?.token;

      console.log("🔍 DEBUG UPLOAD INFO:");
      console.log("📁 File:", file.name, file.size, file.type);
      console.log("👤 User ID:", userId);
      console.log("🔑 Token exists:", !!token);

      if (userId) formData.append('userId', userId);

      console.log("📤 Uploading profile image...");

      const response = await fetch('http://localhost:5000/api/user/upload-profile-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("📨 Response status:", response.status);

      const result = await response.json();
      console.log("📨 Upload result:", result);

      if (!response.ok) {
        throw new Error(result.message || `Upload failed with status: ${response.status}`);
      }

      if (result.success) {
        console.log("✅ Upload successful, updating state...");
        setUserData(prev => ({
          ...prev,
          profileImage: result.imageUrl,
          profilePhoto: result.imageUrl,
          personalInfo: {
            ...prev.personalInfo,
            profileImage: result.imageUrl
          }
        }));

        toast.success("Profile image uploaded successfully!");

        setTimeout(() => {
          console.log("💾 Auto-saving profile...");
          handleSave();
        }, 1000);

      } else {
        throw new Error(result.message || 'Upload failed - no success flag');
      }
    } catch (error) {
      console.error("❌ Profile image upload error:", error);
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast.error(`Failed to upload profile image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // File input change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    console.log(file);
    if (file && isEditing) {
      handleProfileImageUpload(file);
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      console.log("💾 Saving user data:", userData);

      const result = await updateProfile(userData);

      if (result.success) {
        toast.success("Profile updated successfully! ✅");
        setIsEditing(false);

        const userId = currentuser?._id || currentuser?.id;
        if (userId) {
          const freshData = await getUserByID(userId);
          if (freshData.success) {
            const mergedData = deepMergeUserData(freshData.data);
            setUserData(mergedData);
          }
        }
      } else {
        toast.error(result.message || "Profile update failed. 😥");
      }
    } catch (error) {
      console.error("❌ Profile Update Error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate profile completion percentage
  const calculateProgress = () => {
    const completionFields = [
      userData.email,
      userData.personalInfo?.firstName,
      userData.personalInfo?.lastName,
      userData.personalInfo?.gender,
      userData.personalInfo?.dateOfBirth,
      userData.personalInfo?.maritalStatus,
      userData.religiousInfo?.religion,
      userData.religiousInfo?.motherTongue,
      userData.professionalInfo?.occupation,
      userData.professionalInfo?.education?.highestDegree,
      userData.location?.current?.city,
      userData.location?.current?.country,
      userData.profilePhoto || userData.profileImage
    ];

    const filledCount = completionFields.filter(val =>
      val !== undefined &&
      val !== null &&
      val !== '' &&
      !(Array.isArray(val) && val.length === 0) &&
      !(typeof val === 'object' && Object.keys(val).length === 0)
    ).length;

    return Math.min(Math.round((filledCount / completionFields.length) * 100), 100);
  };

  useEffect(() => {
    setProgress(calculateProgress());
  }, [userData]);

  // ==================== FIXED HANDLER FUNCTIONS ====================
  
  // Direct handler functions to prevent recreating functions on every render
  const handleInputChange = useCallback((section, field, value) => {
    setUserData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  const handleNestedInputChange = useCallback((section, subSection, field, value) => {
    setUserData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section]?.[subSection],
          [field]: value
        }
      }
    }));
  }, []);

  // Helper functions for different input types
  const createTextInputHandler = useCallback((section, field) => {
    return (e) => handleInputChange(section, field, e.target.value);
  }, [handleInputChange]);

  const createSelectHandler = useCallback((section, field) => {
    return (e) => handleInputChange(section, field, e.target.value);
  }, [handleInputChange]);

  const createNumberInputHandler = useCallback((section, field) => {
    return (e) => {
      const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
      handleInputChange(section, field, isNaN(value) ? 0 : value);
    };
  }, [handleInputChange]);

  const createNestedTextInputHandler = useCallback((section, subSection, field) => {
    return (e) => handleNestedInputChange(section, subSection, field, e.target.value);
  }, [handleNestedInputChange]);

  const createNestedSelectHandler = useCallback((section, subSection, field) => {
    return (e) => handleNestedInputChange(section, subSection, field, e.target.value);
  }, [handleNestedInputChange]);

  const createNestedNumberInputHandler = useCallback((section, subSection, field) => {
    return (e) => {
      const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
      handleNestedInputChange(section, subSection, field, isNaN(value) ? 0 : value);
    };
  }, [handleNestedInputChange]);

  // ==================== END OF FIXED HANDLERS ====================

  // Tabs configuration
  const tabs = [
    { id: 'personal', label: 'Personal', icon: User, completed: !!userData.personalInfo?.firstName },
    { id: 'profileImage', label: 'Profile Image', icon: ImageIcon, completed: !!(userData.profileImage || userData.profilePhoto) },
    { id: 'religious', label: 'Religious', icon: Heart, completed: !!userData.religiousInfo?.religion },
    { id: 'professional', label: 'Professional', icon: Briefcase, completed: !!userData.professionalInfo?.occupation },
    { id: 'family', label: 'Family', icon: Users, completed: !!userData.familyInfo?.familyType },
    { id: 'lifestyle', label: 'Lifestyle', icon: Star, completed: !!userData.lifestyleInfo?.diet },
    { id: 'location', label: 'Location', icon: MapPin, completed: !!userData.location?.current?.city },
    { id: 'preferences', label: 'Preferences', icon: Target, completed: !!userData.partnerPreferences?.ageRange?.min },
    { id: 'privacy', label: 'Privacy', icon: Shield, completed: true }
  ];

  // Tab Components - Updated with fixed handlers
  const PersonalTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <User className="h-6 w-6 mr-3 text-purple-400" />
        Personal Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
          <input
            type="text"
            value={userData.personalInfo?.firstName || ''}
            onChange={createTextInputHandler('personalInfo', 'firstName')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
          <input
            type="text"
            value={userData.personalInfo?.lastName || ''}
            onChange={createTextInputHandler('personalInfo', 'lastName')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Gender *</label>
          <select
            value={userData.personalInfo?.gender || ''}
            onChange={createSelectHandler('personalInfo', 'gender')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth *</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="date"
              value={userData.personalInfo?.dateOfBirth?.split('T')[0] || ''}
              onChange={createTextInputHandler('personalInfo', 'dateOfBirth')}
              disabled={!isEditing}
              className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Marital Status</label>
          <select
            value={userData.personalInfo?.maritalStatus || 'never_married'}
            onChange={createSelectHandler('personalInfo', 'maritalStatus')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="never_married">Never Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="awaiting_divorce">Awaiting Divorce</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Physical Status</label>
          <select
            value={userData.personalInfo?.physicalStatus || 'normal'}
            onChange={createSelectHandler('personalInfo', 'physicalStatus')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="normal">Normal</option>
            <option value="physically_challenged">Physically Challenged</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="number"
                value={userData.personalInfo?.height?.value || 0}
                onChange={createNestedNumberInputHandler('personalInfo', 'height', 'value')}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Height"
              />
            </div>
            <div className="w-32">
              <select
                value={userData.personalInfo?.height?.unit || 'cm'}
                onChange={createNestedSelectHandler('personalInfo', 'height', 'unit')}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="cm">cm</option>
                <option value="feet">feet</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={userData.personalInfo?.weight || 0}
            onChange={createNumberInputHandler('personalInfo', 'weight')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Weight in kg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Blood Group</label>
          <select
            value={userData.personalInfo?.bloodGroup || ''}
            onChange={createSelectHandler('personalInfo', 'bloodGroup')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">About Me</label>
          <textarea
            value={userData.personalInfo?.aboutMe || ''}
            onChange={createTextInputHandler('personalInfo', 'aboutMe')}
            disabled={!isEditing}
            rows={4}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );

  const ReligiousTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Heart className="h-6 w-6 mr-3 text-purple-400" />
        Religious Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Religion *</label>
          <select
            value={userData.religiousInfo?.religion || ''}
            onChange={createSelectHandler('religiousInfo', 'religion')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Religion</option>
            <option value="hindu">Hindu</option>
            <option value="muslim">Muslim</option>
            <option value="christian">Christian</option>
            <option value="sikh">Sikh</option>
            <option value="jain">Jain</option>
            <option value="buddhist">Buddhist</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Mother Tongue *</label>
          <select
            value={userData.religiousInfo?.motherTongue || ''}
            onChange={createSelectHandler('religiousInfo', 'motherTongue')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select Language</option>
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
            <option value="bengali">Bengali</option>
            <option value="telugu">Telugu</option>
            <option value="marathi">Marathi</option>
            <option value="tamil">Tamil</option>
            <option value="urdu">Urdu</option>
            <option value="gujarati">Gujarati</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Caste</label>
          <input
            type="text"
            value={userData.religiousInfo?.caste || ''}
            onChange={createTextInputHandler('religiousInfo', 'caste')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your caste"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sub-caste</label>
          <input
            type="text"
            value={userData.religiousInfo?.subCaste || ''}
            onChange={createTextInputHandler('religiousInfo', 'subCaste')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your sub-caste"
          />
        </div>
      </div>
    </div>
  );

  const ProfessionalTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Briefcase className="h-6 w-6 mr-3 text-purple-400" />
        Professional Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Occupation</label>
          <input
            type="text"
            value={userData.professionalInfo?.occupation || ''}
            onChange={createTextInputHandler('professionalInfo', 'occupation')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Your occupation"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
          <input
            type="text"
            value={userData.professionalInfo?.jobTitle || ''}
            onChange={createTextInputHandler('professionalInfo', 'jobTitle')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Your job title"
          />
        </div>
      </div>
    </div>
  );

  const FamilyTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Users className="h-6 w-6 mr-3 text-purple-400" />
        Family Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Family Type & Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Family Type</label>
          <select
            value={userData.familyInfo?.familyType || 'nuclear'}
            onChange={createSelectHandler('familyInfo', 'familyType')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="nuclear">Nuclear</option>
            <option value="joint">Joint</option>
            <option value="extended">Extended</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Family Status</label>
          <select
            value={userData.familyInfo?.familyStatus || 'middle'}
            onChange={createSelectHandler('familyInfo', 'familyStatus')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="upper">Upper Class</option>
            <option value="upper_middle">Upper Middle</option>
            <option value="middle">Middle Class</option>
            <option value="lower_middle">Lower Middle</option>
            <option value="lower">Lower Class</option>
          </select>
        </div>

        {/* Father's Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Father's Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Occupation</label>
              <input
                type="text"
                value={userData.familyInfo?.father?.occupation || ''}
                onChange={createNestedTextInputHandler('familyInfo', 'father', 'occupation')}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Father's occupation"
              />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={userData.familyInfo?.father?.isAlive || true}
                onChange={(e) => handleNestedInputChange('familyInfo', 'father', 'isAlive', e.target.checked)}
                disabled={!isEditing}
                className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <label className="text-sm font-medium text-gray-300">Is Alive</label>
            </div>
          </div>
        </div>

        {/* Mother's Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Mother's Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Occupation</label>
              <input
                type="text"
                value={userData.familyInfo?.mother?.occupation || ''}
                onChange={createNestedTextInputHandler('familyInfo', 'mother', 'occupation')}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Mother's occupation"
              />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={userData.familyInfo?.mother?.isAlive || true}
                onChange={(e) => handleNestedInputChange('familyInfo', 'mother', 'isAlive', e.target.checked)}
                disabled={!isEditing}
                className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <label className="text-sm font-medium text-gray-300">Is Alive</label>
            </div>
          </div>
        </div>

        {/* Siblings Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Siblings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Brothers</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Total</label>
                  <input
                    type="number"
                    value={userData.familyInfo?.siblings?.brothers?.total || 0}
                    onChange={createNestedNumberInputHandler('familyInfo', 'siblings', 'brothers.total')}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Married</label>
                  <input
                    type="number"
                    value={userData.familyInfo?.siblings?.brothers?.married || 0}
                    onChange={createNestedNumberInputHandler('familyInfo', 'siblings', 'brothers.married')}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sisters</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Total</label>
                  <input
                    type="number"
                    value={userData.familyInfo?.siblings?.sisters?.total || 0}
                    onChange={createNestedNumberInputHandler('familyInfo', 'siblings', 'sisters.total')}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Married</label>
                  <input
                    type="number"
                    value={userData.familyInfo?.siblings?.sisters?.married || 0}
                    onChange={createNestedNumberInputHandler('familyInfo', 'siblings', 'sisters.married')}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Native Place */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Native Place</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
              <input
                type="text"
                value={userData.familyInfo?.nativePlace?.city || ''}
                onChange={createNestedTextInputHandler('familyInfo', 'nativePlace', 'city')}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Native city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
              <input
                type="text"
                value={userData.familyInfo?.nativePlace?.state || ''}
                onChange={createNestedTextInputHandler('familyInfo', 'nativePlace', 'state')}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Native state"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
              <input
                type="text"
                value={userData.familyInfo?.nativePlace?.country || ''}
                onChange={createNestedTextInputHandler('familyInfo', 'nativePlace', 'country')}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Native country"
              />
            </div>
          </div>
        </div>

        {/* Additional Family Info */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={userData.familyInfo?.livingWithParents || false}
                onChange={(e) => handleInputChange('familyInfo', 'livingWithParents', e.target.checked)}
                disabled={!isEditing}
                className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <label className="text-sm font-medium text-gray-300">Living with Parents</label>
            </div>
          </div>
        </div>

        {/* Family Values */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Family Values</label>
          <div className="flex flex-wrap gap-2">
            {['Traditional', 'Moderate', 'Liberal', 'Orthodox', 'Modern'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  const currentValues = userData.familyInfo?.familyValues || [];
                  const operation = currentValues.includes(value) ? 'remove' : 'add';
                  handleArrayUpdate('familyInfo', 'familyValues', value, operation);
                }}
                disabled={!isEditing}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${userData.familyInfo?.familyValues?.includes(value)
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileImageTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <ImageIcon className="h-6 w-6 mr-3 text-purple-400" />
        Profile Image
      </h2>

      <div className="flex flex-col items-center gap-6">
        {/* Profile Preview */}
        <div className="relative">
          <img
            src={userData.profileImage || userData.profilePhoto || '/default-avatar.png'}
            alt="Profile Preview"
            className="w-40 h-40 rounded-full border-4 border-purple-500 object-cover shadow-md"
          />
          {uploadingImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex flex-col items-center">
          <label
            htmlFor="profile-image-upload"
            className={`cursor-pointer inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all ${isEditing && !uploadingImage
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Upload className="h-5 w-5 mr-2" />
            {uploadingImage ? 'Uploading...' : (isEditing ? 'Upload New Image' : 'Upload Disabled')}
          </label>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={!isEditing || uploadingImage}
            className="hidden"
          />
        </div>

        {/* Optional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Supported formats: JPG, PNG, WEBP. Max size: 5MB
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {userData.profileImage || userData.profilePhoto
              ? 'Image will be saved automatically after upload'
              : 'No profile image uploaded yet'}
          </p>
        </div>
      </div>
    </div>
  );

  const LifestyleTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Star className="h-6 w-6 mr-3 text-purple-400" />
        Lifestyle Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Diet & Habits */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Diet</label>
          <select
            value={userData.lifestyleInfo?.diet || 'vegetarian'}
            onChange={createSelectHandler('lifestyleInfo', 'diet')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="non_vegetarian">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Smoking</label>
          <select
            value={userData.lifestyleInfo?.smoking || 'non_smoker'}
            onChange={createSelectHandler('lifestyleInfo', 'smoking')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="non_smoker">Non-Smoker</option>
            <option value="light_smoker">Light Smoker</option>
            <option value="heavy_smoker">Heavy Smoker</option>
            <option value="occasionally">Occasionally</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Drinking</label>
          <select
            value={userData.lifestyleInfo?.drinking || 'non_drinker'}
            onChange={createSelectHandler('lifestyleInfo', 'drinking')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="non_drinker">Non-Drinker</option>
            <option value="light_drinker">Light Drinker</option>
            <option value="heavy_drinker">Heavy Drinker</option>
            <option value="occasionally">Occasionally</option>
          </select>
        </div>

        {/* Languages */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Languages Known</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Punjabi', 'Malayalam', 'Kannada'].map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => {
                  const currentLanguages = userData.lifestyleInfo?.languages || [];
                  const operation = currentLanguages.includes(language) ? 'remove' : 'add';
                  handleArrayUpdate('lifestyleInfo', 'languages', language, operation);
                }}
                disabled={!isEditing}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${userData.lifestyleInfo?.languages?.includes(language)
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {language}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400">
            Selected: {userData.lifestyleInfo?.languages?.join(', ') || 'None'}
          </div>
        </div>

        {/* Hobbies */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Hobbies</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {['Reading', 'Traveling', 'Cooking', 'Photography', 'Music', 'Dancing', 'Sports', 'Painting', 'Gardening', 'Writing'].map((hobby) => (
              <button
                key={hobby}
                type="button"
                onClick={() => {
                  const currentHobbies = userData.lifestyleInfo?.hobbies || [];
                  const operation = currentHobbies.includes(hobby) ? 'remove' : 'add';
                  handleArrayUpdate('lifestyleInfo', 'hobbies', hobby, operation);
                }}
                disabled={!isEditing}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${userData.lifestyleInfo?.hobbies?.includes(hobby)
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {hobby}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400">
            Selected: {userData.lifestyleInfo?.hobbies?.join(', ') || 'None'}
          </div>
        </div>

        {/* Interests */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {['Technology', 'Business', 'Arts', 'Science', 'Politics', 'Spirituality', 'Fitness', 'Movies', 'Fashion', 'Food'].map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => {
                  const currentInterests = userData.lifestyleInfo?.interests || [];
                  const operation = currentInterests.includes(interest) ? 'remove' : 'add';
                  handleArrayUpdate('lifestyleInfo', 'interests', interest, operation);
                }}
                disabled={!isEditing}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${userData.lifestyleInfo?.interests?.includes(interest)
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {interest}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400">
            Selected: {userData.lifestyleInfo?.interests?.join(', ') || 'None'}
          </div>
        </div>

        {/* Custom Hobby Input */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Add Custom Hobby</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="customHobby"
              disabled={!isEditing}
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter a hobby..."
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('customHobby');
                const value = input.value.trim();
                if (value && isEditing) {
                  handleArrayUpdate('lifestyleInfo', 'hobbies', value, 'add');
                  input.value = '';
                }
              }}
              disabled={!isEditing}
              className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LocationTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MapPin className="h-6 w-6 mr-3 text-purple-400" />
        Location Information
      </h2>

      {/* Current Location */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-400" />
          Current Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
            <select
              value={userData.location?.current?.country || ''}
              onChange={createNestedSelectHandler('location', 'current', 'country')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Country</option>
              <option value="india">India</option>
              <option value="usa">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="canada">Canada</option>
              <option value="australia">Australia</option>
              <option value="uae">UAE</option>
              <option value="singapore">Singapore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
            <input
              type="text"
              value={userData.location?.current?.state || ''}
              onChange={createNestedTextInputHandler('location', 'current', 'state')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <input
              type="text"
              value={userData.location?.current?.city || ''}
              onChange={createNestedTextInputHandler('location', 'current', 'city')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
            <input
              type="text"
              value={userData.location?.current?.zipCode || ''}
              onChange={createNestedTextInputHandler('location', 'current', 'zipCode')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="ZIP Code"
            />
          </div>
        </div>
      </div>

      {/* Permanent Location */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-green-400" />
          Permanent Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
            <select
              value={userData.location?.permanent?.country || ''}
              onChange={createNestedSelectHandler('location', 'permanent', 'country')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Country</option>
              <option value="india">India</option>
              <option value="usa">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="canada">Canada</option>
              <option value="australia">Australia</option>
              <option value="uae">UAE</option>
              <option value="singapore">Singapore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
            <input
              type="text"
              value={userData.location?.permanent?.state || ''}
              onChange={createNestedTextInputHandler('location', 'permanent', 'state')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <input
              type="text"
              value={userData.location?.permanent?.city || ''}
              onChange={createNestedTextInputHandler('location', 'permanent', 'city')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
            <input
              type="text"
              value={userData.location?.permanent?.zipCode || ''}
              onChange={createNestedTextInputHandler('location', 'permanent', 'zipCode')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="ZIP Code"
            />
          </div>
        </div>
      </div>

      {/* Citizenship & Residency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Citizenship</label>
          <select
            value={userData.location?.citizenship || 'Indian'}
            onChange={createSelectHandler('location', 'citizenship')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="Indian">Indian</option>
            <option value="American">American</option>
            <option value="British">British</option>
            <option value="Canadian">Canadian</option>
            <option value="Australian">Australian</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Residency Status</label>
          <select
            value={userData.location?.residencyStatus || 'citizen'}
            onChange={createSelectHandler('location', 'residencyStatus')}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="citizen">Citizen</option>
            <option value="permanent_resident">Permanent Resident</option>
            <option value="work_permit">Work Permit</option>
            <option value="student_visa">Student Visa</option>
            <option value="tourist_visa">Tourist Visa</option>
          </select>
        </div>
      </div>

      {/* Same as Permanent Checkbox */}
      <div className="mt-6">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="sameAsPermanent"
            onChange={(e) => {
              if (e.target.checked && isEditing) {
                setUserData(prev => ({
                  ...prev,
                  location: {
                    ...prev.location,
                    permanent: { ...prev.location?.current }
                  }
                }));
              }
            }}
            disabled={!isEditing}
            className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="sameAsPermanent" className="text-sm font-medium text-gray-300">
            Same as Current Location
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Check this if your permanent address is same as current address
        </p>
      </div>
    </div>
  );

  const PreferencesTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Target className="h-6 w-6 mr-3 text-purple-400" />
        Partner Preferences
      </h2>

      {/* Age Range */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Age Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Age</label>
            <input
              type="number"
              value={userData.partnerPreferences?.ageRange?.min || 0}
              onChange={createNestedNumberInputHandler('partnerPreferences', 'ageRange', 'min')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="18"
              max="80"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Age</label>
            <input
              type="number"
              value={userData.partnerPreferences?.ageRange?.max || 0}
              onChange={createNestedNumberInputHandler('partnerPreferences', 'ageRange', 'max')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="18"
              max="80"
            />
          </div>
        </div>
      </div>

      {/* Height Range */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Height Range (cm)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Height</label>
            <input
              type="number"
              value={userData.partnerPreferences?.heightRange?.min || 0}
              onChange={createNestedNumberInputHandler('partnerPreferences', 'heightRange', 'min')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="140"
              max="200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Height</label>
            <input
              type="number"
              value={userData.partnerPreferences?.heightRange?.max || 0}
              onChange={createNestedNumberInputHandler('partnerPreferences', 'heightRange', 'max')}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="140"
              max="200"
            />
          </div>
        </div>
      </div>

      {/* Marital Status */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Marital Status</h3>
        <div className="flex flex-wrap gap-2">
          {['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                const currentStatus = userData.partnerPreferences?.maritalStatus || [];
                const operation = currentStatus.includes(status) ? 'remove' : 'add';
                handleArrayUpdate('partnerPreferences', 'maritalStatus', status, operation);
              }}
              disabled={!isEditing}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${userData.partnerPreferences?.maritalStatus?.includes(status)
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Religion & Caste */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Religion & Caste</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Religions</label>
            <div className="flex flex-wrap gap-2">
              {['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist'].map((religion) => (
                <button
                  key={religion}
                  type="button"
                  onClick={() => {
                    const currentReligions = userData.partnerPreferences?.religions || [];
                    const operation = currentReligions.includes(religion) ? 'remove' : 'add';
                    handleArrayUpdate('partnerPreferences', 'religions', religion, operation);
                  }}
                  disabled={!isEditing}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${userData.partnerPreferences?.religions?.includes(religion)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {religion}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Castes</label>
            <input
              type="text"
              value={userData.partnerPreferences?.castes?.join(', ') || ''}
              onChange={(e) => handleInputChange('partnerPreferences', 'castes', e.target.value.split(',').map(s => s.trim()))}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Separate castes with commas"
            />
          </div>
        </div>
      </div>

      {/* Education & Occupation */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Education & Occupation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Education Level</label>
            <div className="flex flex-wrap gap-2">
              {['High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'Other'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    const currentLevels = userData.partnerPreferences?.education?.level || [];
                    const operation = currentLevels.includes(level) ? 'remove' : 'add';
                    handleNestedArrayUpdate('partnerPreferences', 'education', 'level', level, operation);
                  }}
                  disabled={!isEditing}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${userData.partnerPreferences?.education?.level?.includes(level)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Occupations</label>
            <input
              type="text"
              value={userData.partnerPreferences?.occupations?.join(', ') || ''}
              onChange={(e) => handleInputChange('partnerPreferences', 'occupations', e.target.value.split(',').map(s => s.trim()))}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white disabled:bg-gray-800 disabled:text-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Separate occupations with commas"
            />
          </div>
        </div>
      </div>

      {/* Lifestyle Preferences */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-600 pb-2">Lifestyle Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Diet</label>
            <div className="space-y-2">
              {['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Any'].map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => {
                    const currentDiets = userData.partnerPreferences?.lifestyle?.diet || [];
                    const operation = currentDiets.includes(diet) ? 'remove' : 'add';
                    handleNestedArrayUpdate('partnerPreferences', 'lifestyle', 'diet', diet, operation);
                  }}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${userData.partnerPreferences?.lifestyle?.diet?.includes(diet)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Smoking</label>
            <div className="space-y-2">
              {['Non-Smoker', 'Light Smoker', 'Occasionally', 'Any'].map((smoking) => (
                <button
                  key={smoking}
                  type="button"
                  onClick={() => {
                    const currentSmoking = userData.partnerPreferences?.lifestyle?.smoking || [];
                    const operation = currentSmoking.includes(smoking) ? 'remove' : 'add';
                    handleNestedArrayUpdate('partnerPreferences', 'lifestyle', 'smoking', smoking, operation);
                  }}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${userData.partnerPreferences?.lifestyle?.smoking?.includes(smoking)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {smoking}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Drinking</label>
            <div className="space-y-2">
              {['Non-Drinker', 'Light Drinker', 'Occasionally', 'Any'].map((drinking) => (
                <button
                  key={drinking}
                  type="button"
                  onClick={() => {
                    const currentDrinking = userData.partnerPreferences?.lifestyle?.drinking || [];
                    const operation = currentDrinking.includes(drinking) ? 'remove' : 'add';
                    handleNestedArrayUpdate('partnerPreferences', 'lifestyle', 'drinking', drinking, operation);
                  }}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${userData.partnerPreferences?.lifestyle?.drinking?.includes(drinking)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {drinking}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PrivacyTab = () => (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Shield className="h-6 w-6 mr-3 text-purple-400" />
        Privacy Settings
      </h2>

      <div className="space-y-8">
        {/* Profile Visibility */}
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-400" />
            Profile Visibility
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'public', label: 'Public', desc: 'Visible to everyone' },
              { value: 'private', label: 'Private', desc: 'Visible only to matches' },
              { value: 'hidden', label: 'Hidden', desc: 'Only you can see' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('privacySettings', 'profileVisibility', option.value)}
                disabled={!isEditing}
                className={`p-4 rounded-xl border-2 transition-all text-left ${userData.privacySettings?.profileVisibility === option.value
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium text-white">{option.label}</div>
                <div className="text-sm text-gray-400 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-green-400" />
            Contact Information
          </h3>
          <div className="space-y-4">
            {[
              { field: 'showContactInfo', label: 'Show Contact Information', desc: 'Display your phone number and email to matches' },
              { field: 'showLastActive', label: 'Show Last Active Status', desc: 'Display when you were last active on the platform' },
              { field: 'showIncome', label: 'Show Income Details', desc: 'Display your income information on your profile' }
            ].map((setting) => (
              <div key={setting.field} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                <div className="flex-1">
                  <div className="font-medium text-white">{setting.label}</div>
                  <div className="text-sm text-gray-400 mt-1">{setting.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData.privacySettings?.[setting.field] || false}
                    onChange={(e) => handleInputChange('privacySettings', setting.field, e.target.checked)}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                  ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'peer-checked:bg-purple-500'} 
                  peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                  after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
                  ></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Privacy */}
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-yellow-400" />
            Photo Privacy
          </h3>
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-medium text-white">Profile Photo Visibility</div>
                <div className="text-sm text-gray-400">Who can see your profile photos</div>
              </div>
              <select
                value={userData.privacySettings?.photoVisibility || 'all'}
                onChange={(e) => handleInputChange('privacySettings', 'photoVisibility', e.target.value)}
                disabled={!isEditing}
                className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm"
              >
                <option value="all">Everyone</option>
                <option value="matches">Only Matches</option>
                <option value="premium">Premium Members</option>
                <option value="none">No One</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Visibility */}
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-red-400" />
            Search Visibility
          </h3>
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Appear in Search Results</div>
                <div className="text-sm text-gray-400">Control whether your profile appears in search results</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userData.privacySettings?.searchVisibility !== false}
                  onChange={(e) => handleInputChange('privacySettings', 'searchVisibility', e.target.checked)}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
                ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'peer-checked:bg-purple-500'} 
                peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
                ></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-400" />
            Data & Privacy
          </h3>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toast.success('Data export initiated. You will receive an email shortly.')}
              className="w-full text-left p-4 bg-gray-700/50 rounded-xl border border-gray-600 hover:bg-gray-600/50 transition-all"
            >
              <div className="font-medium text-white">Export My Data</div>
              <div className="text-sm text-gray-400">Download a copy of your personal data</div>
            </button>

            <button
              type="button"
              onClick={() => toast.error('This action cannot be undone. Please contact support.')}
              className="w-full text-left p-4 bg-gray-700/50 rounded-xl border border-gray-600 hover:bg-red-500/20 hover:border-red-500 transition-all"
            >
              <div className="font-medium text-red-400">Delete My Account</div>
              <div className="text-sm text-gray-400">Permanently delete your account and all data</div>
            </button>
          </div>
        </div>

        {/* Save Privacy Settings */}
        {isEditing && (
          <div className="pt-6 border-t border-gray-600">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving Privacy Settings...' : 'Save Privacy Settings'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isLoggedIn || !currentuser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl text-white mb-4">Please log in to view your profile</h2>
          <p className="text-gray-300 mb-6">
            You need to be logged in to access your profile information.
          </p>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border border-gray-600 text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white pt-16 font-inter">
      <div className="max-w-7xl   mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-3xl p-8 mb-8 border border-gray-700 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <button
                onClick={() => navigate(-1)}
                className="lg:hidden p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="relative">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  {userData.profileImage || userData.profilePhoto ? (
                    <img
                      src={userData.profileImage || userData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 lg:h-12 lg:w-12 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor="header-profile-image"
                    className="absolute bottom-2 right-2 p-2 bg-gray-800 rounded-full border border-gray-600 hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Camera className="h-3 w-3 lg:h-4 lg:w-4" />
                    <input
                      id="header-profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={!isEditing || uploadingImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {userData.personalInfo?.firstName || 'User'} {userData.personalInfo?.lastName || ''}
                </h1>
                <p className="text-gray-400 text-sm lg:text-lg">
                  {userData.professionalInfo?.jobTitle || 'Add your profession'} • {userData.location?.current?.city || 'Add your city'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Profile {progress}% Complete</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 w-full lg:w-auto justify-between lg:justify-start">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 lg:px-6 py-2 lg:py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm lg:text-base"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2 text-sm lg:text-base"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center space-x-2 text-sm lg:text-base"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Profile Completion</span>
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {progress < 100 && (
              <p className="text-yellow-400 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Complete your profile to get better matches
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm sticky top-24">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                      {tab.completed && (
                        <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'personal' && <PersonalTab />}
            {activeTab === 'profileImage' && <ProfileImageTab />}
            {activeTab === 'religious' && <ReligiousTab />}
            {activeTab === 'professional' && <ProfessionalTab />}
            {activeTab === 'family' && <FamilyTab />}
            {activeTab === 'lifestyle' && <LifestyleTab />}
            {activeTab === 'location' && <LocationTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
            {activeTab === 'privacy' && <PrivacyTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
