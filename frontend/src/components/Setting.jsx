import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../Context/Authcontext.js';
import {
  SettingsIcon,
  Shield,
  Bell,
  Palette,
  Save,
  Download,
  Trash2,
  Mail,
  Lock,
  Smartphone,
  Heart,
  Volume2,
   User,
  Moon,
  Sun,
  Globe,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Settings = () => {
  const { currentuser, updateProfile, loading } = useContext(AuthContext);
  const BASE_URL = "https://shadii-com.onrender.com";
  const [activeTab, setActiveTab] = useState('privacy');
  const [saving, setSaving] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    showOnlineStatus: true,
    showLastSeen: true,
    showLocation: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newMatches: true,
    messages: true,
    likes: true,
    friendRequests: true,
    soundEnabled: true,
    vibration: true
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    language: 'english',
    fontSize: 'medium',
    reduceMotion: false
  });

  // Initialize form data
  useEffect(() => {
    if (currentuser) {
      setProfileData({
        firstName: currentuser.personalInfo?.firstName || '',
        lastName: currentuser.personalInfo?.lastName || '',
        email: currentuser.email || '',
        phone: currentuser.phone || '',
        bio: currentuser.aboutMe?.description || ''
      });

      fetchPrivacySettings();
    }
  }, [currentuser]);

  // Tab Configuration
  const tabs = [
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: SettingsIcon }
  ];

  // 1. FETCH ALL PRIVACY SETTINGS
  const fetchPrivacySettings = async () => {
    if (!currentuser?.id) return;

    try {
      const userId = currentuser.id;
      
      // Fetch all privacy settings in parallel
      const [profileRes, lastSeenRes, onlineRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/visable/profile/getvisibility/${userId}`),
        axios.get(`${BASE_URL}/api/visable/message/getlastseen/${userId}`),
        axios.get(`${BASE_URL}/api/visable/onlineStatus/${userId}`)
      ]);

      setPrivacySettings({
        profileVisibility: profileRes.data.success ? profileRes.data.visibility : 'private',
        showLastSeen: lastSeenRes.data.success ? 
          (lastSeenRes.data.lastSeen === 'true' || lastSeenRes.data.lastSeen === true) : true,
        showOnlineStatus: onlineRes.data.success ? onlineRes.data.LastSeenOnline : true,
        showLocation: false
      });

    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      toast.error('Failed to load privacy settings');
    }
  };

  // 2. PROFILE VISIBILITY - Individual Function
  const handleProfileVisibility = async () => {
    if (!currentuser?.id) return;
    
    setSaving(true);
    try {
      const userId = currentuser.id;
      const isVisible = privacySettings.profileVisibility === 'private' ? 'true' : 'false';
      
      const response = await axios.put(`${BASE_URL}/api/visable/profile/visibility/${userId}/${isVisible}`);
      
      if (response.data.success) {
        toast.success('Profile visibility updated!');
      } else {
        toast.error('Failed to update profile visibility');
      }
    } catch (error) {
      toast.error('Error updating profile visibility');
    } finally {
      setSaving(false);
    }
  };

  // 3. LAST SEEN - Individual Function
  const handleLastSeen = async () => {
    if (!currentuser?.id) return;
    
    setSaving(true);
    try {
      const userId = currentuser.id;
      const isVisible = privacySettings.showLastSeen ? 'true' : 'false';
      
      const response = await axios.put(`${BASE_URL}/api/visable/message/lastseen/${userId}/${isVisible}`);
      
      if (response.data.success) {
        toast.success('Last seen updated!');
      } else {
        toast.error('Failed to update last seen');
      }
    } catch (error) {
      toast.error('Error updating last seen');
    } finally {
      setSaving(false);
    }
  };

  // 4. ONLINE STATUS - Individual Function
  const handleOnlineStatus = async () => {
    if (!currentuser?.id) return;
    
    setSaving(true);
    try {
      const userId = currentuser.id;
      const isOnline = privacySettings.showOnlineStatus ? 'true' : 'false';
      
      const response = await axios.put(`${BASE_URL}/api/visable/setonline/${userId}/${isOnline}`);
      
      if (response.data.success) {
        toast.success('Online status updated!');
      } else {
        toast.error('Failed to update online status');
      }
    } catch (error) {
      toast.error('Error updating online status');
    } finally {
      setSaving(false);
    }
  };

  // 5. PROFILE UPDATE - Individual Function
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!currentuser?.id) return;
    
    setSaving(true);
    try {
      const updateData = {
        personalInfo: {
          firstName: profileData.firstName,
          lastName: profileData.lastName
        },
        email: profileData.email,
        phone: profileData.phone,
        aboutMe: {
          description: profileData.bio
        }
      };

      const result = await updateProfile(updateData);
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // 6. NOTIFICATION SAVE - Individual Function
  const handleNotificationSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      toast.success('Notification settings saved!');
      setSaving(false);
    }, 500);
  };

  // 7. APPEARANCE SAVE - Individual Function
  const handleAppearanceSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
      toast.success('Appearance settings saved!');
      setSaving(false);
    }, 500);
  };

  // 8. DATA EXPORT - Individual Function
  const handleDataExport = () => {
    toast.success('Preparing data export...');
    
    setTimeout(() => {
      const data = {
        user: currentuser,
        settings: {
          privacy: privacySettings,
          notifications: notificationSettings,
          appearance: appearanceSettings
        }
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    }, 1000);
  };

  // 9. ACCOUNT DELETE - Individual Function
  const handleAccountDelete = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmDelete) {
      toast.loading('Processing account deletion...');
      setTimeout(() => {
        toast.success('Account deletion scheduled');
      }, 2000);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Settings</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-64 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 h-fit">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              
              {/* PRIVACY TAB */}
              {activeTab === 'privacy' && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-pink-400" />
                    <span>Privacy & Security</span>
                  </h2>

                  <div className="space-y-6">
                    
                    {/* Profile Visibility */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Profile Visibility</h3>
                          <p className="text-gray-400 text-sm">Who can see your profile</p>
                        </div>
                        <select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            profileVisibility: e.target.value
                          })}
                          className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                        >
                          <option className='bg-gray-600' value="public">Public</option>
                          <option className='bg-gray-600' value="private">Private</option>
                        </select>
                      </div>
                      <button
                        onClick={handleProfileVisibility}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 px-4 py-2 rounded-lg font-medium hover:from-pink-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{saving ? 'Saving...' : 'Save Profile Visibility'}</span>
                      </button>
                    </div>

                    {/* Show Online Status */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Show Online Status</h3>
                          <p className="text-gray-400 text-sm">Let others see when you're online</p>
                        </div>
                        <button
                          onClick={() => setPrivacySettings({
                            ...privacySettings,
                            showOnlineStatus: !privacySettings.showOnlineStatus
                          })}
                          className={`w-12 h-6 rounded-full transition-all ${
                            privacySettings.showOnlineStatus ? 'bg-pink-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            privacySettings.showOnlineStatus ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <button
                        onClick={handleOnlineStatus}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 px-4 py-2 rounded-lg font-medium hover:from-pink-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{saving ? 'Saving...' : 'Save Online Status'}</span>
                      </button>
                    </div>

                    {/* Show Last Seen */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Show Last Seen</h3>
                          <p className="text-gray-400 text-sm">Show when you were last active</p>
                        </div>
                        <button
                          onClick={() => setPrivacySettings({
                            ...privacySettings,
                            showLastSeen: !privacySettings.showLastSeen
                          })}
                          className={`w-12 h-6 rounded-full transition-all ${
                            privacySettings.showLastSeen ? 'bg-pink-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            privacySettings.showLastSeen ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <button
                        onClick={handleLastSeen}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 px-4 py-2 rounded-lg font-medium hover:from-pink-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{saving ? 'Saving...' : 'Save Last Seen'}</span>
                      </button>
                    </div>

                    {/* Show Location */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Show Location</h3>
                          <p className="text-gray-400 text-sm">Share your general location</p>
                        </div>
                        <button
                          onClick={() => setPrivacySettings({
                            ...privacySettings,
                            showLocation: !privacySettings.showLocation
                          })}
                          className={`w-12 h-6 rounded-full transition-all ${
                            privacySettings.showLocation ? 'bg-pink-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            privacySettings.showLocation ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                    <Bell className="h-6 w-6 text-pink-400" />
                    <span>Notifications</span>
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                        { key: 'pushNotifications', label: 'Push Notifications', icon: Bell },
                        { key: 'newMatches', label: 'New Matches', icon: Heart },
                        { key: 'messages', label: 'Messages', icon: Mail },
                        { key: 'likes', label: 'Likes', icon: Heart },
                        { key: 'friendRequests', label: 'Friend Requests', icon: User },
                        { key: 'soundEnabled', label: 'Sound', icon: Volume2 },
                        { key: 'vibration', label: 'Vibration', icon: Smartphone }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5 text-gray-400" />
                            <div>
                              <h3 className="font-semibold">{item.label}</h3>
                            </div>
                          </div>
                          <button
                            onClick={() => setNotificationSettings({
                              ...notificationSettings,
                              [item.key]: !notificationSettings[item.key]
                            })}
                            className={`w-12 h-6 rounded-full transition-all ${
                              notificationSettings[item.key] ? 'bg-pink-500' : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              notificationSettings[item.key] ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleNotificationSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>{saving ? 'Saving...' : 'Save Notification Settings'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                    <Palette className="h-6 w-6 text-pink-400" />
                    <span>Appearance</span>
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-white/5 rounded-xl">
                        <h3 className="font-semibold mb-3">Theme</h3>
                        <div className="flex space-x-3">
                          {[
                            { value: 'dark', label: 'Dark', icon: Moon },
                            { value: 'light', label: 'Light', icon: Sun }
                          ].map((theme) => {
                            const Icon = theme.icon;
                            return (
                              <button
                                key={theme.value}
                                onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: theme.value })}
                                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                                  appearanceSettings.theme === theme.value
                                    ? 'border-pink-500 bg-pink-500/20'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                              >
                                <Icon className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm">{theme.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-xl">
                        <h3 className="font-semibold mb-3">Language</h3>
                        <select
                          value={appearanceSettings.language}
                          onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                        >
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h3 className="font-semibold">Reduce Motion</h3>
                        <p className="text-gray-400 text-sm">Minimize animations and transitions</p>
                      </div>
                      <button
                        onClick={() => setAppearanceSettings({
                          ...appearanceSettings,
                          reduceMotion: !appearanceSettings.reduceMotion
                        })}
                        className={`w-12 h-6 rounded-full transition-all ${
                          appearanceSettings.reduceMotion ? 'bg-pink-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          appearanceSettings.reduceMotion ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <button
                      onClick={handleAppearanceSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Save className="h-5 w-5" />
                      <span>{saving ? 'Saving...' : 'Save Appearance'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ACCOUNT TAB */}
              {activeTab === 'account' && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                    <SettingsIcon className="h-6 w-6 text-pink-400" />
                    <span>Account</span>
                  </h2>

                  <div className="space-y-6">
                    
                    {/* Profile Update Form */}
                    {/* <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="font-semibold text-lg mb-4">Update Profile</h3>
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">First Name</label>
                            <input
                              type="text"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                            <input
                              type="text"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Email</label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Bio</label>
                          <textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            rows="3"
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Update Profile'}
                        </button>
                      </form>
                    </div> */}

                    {/* Data Export */}
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Export Your Data</h3>
                          <p className="text-gray-400">
                            Download a copy of your personal data
                          </p>
                        </div>
                        <button
                          onClick={handleDataExport}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
                        >
                          <Download className="h-5 w-5" />
                          <span>Export Data</span>
                        </button>
                      </div>
                    </div>

                    {/* Account Deletion */}
                    <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-2 text-red-400">Delete Account</h3>
                          <p className="text-red-300">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <button
                          onClick={handleAccountDelete}
                          className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center space-x-2"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
