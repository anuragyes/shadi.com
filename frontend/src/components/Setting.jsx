import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../Context/AuthContext.js';
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Eye,
  Palette,
  Globe,
  Download,
  Trash2,
  Save,
  Camera,
  Mail,
  Lock,
  Smartphone,
  Heart,
  Volume2,
  Moon,
  Sun
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { currentuser, updateProfile, loading } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('privacy');
  const [saving, setSaving] = useState(false);
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    dateOfBirth: ''
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: true,
    allowMessages: 'everyone',
    showLocation: false,
    dataSharing: true
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
        bio: currentuser.aboutMe?.description || '',
        dateOfBirth: currentuser.personalInfo?.dateOfBirth ? 
          new Date(currentuser.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''
      });

      // Initialize other settings from user data if available
      if (currentuser.privacySettings) {
        setPrivacySettings(currentuser.privacySettings);
      }
    }
  }, [currentuser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updateData = {
        personalInfo: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          dateOfBirth: profileData.dateOfBirth
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
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacySave = async () => {
    setSaving(true);
    try {
      const result = await updateProfile({ privacySettings });
      if (result.success) {
        toast.success('Privacy settings updated!');
      }
    } catch (error) {
      toast.error('Error updating privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      toast.success('Notification settings saved!');
      setSaving(false);
    }, 1000);
  };

  const handleAppearanceSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
      toast.success('Appearance settings saved!');
      setSaving(false);
    }, 1000);
  };

  const handleDataExport = () => {
    toast.success('Preparing your data export...');
    // In a real app, this would trigger a download
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
      link.download = `soulmate-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const handleAccountDeletion = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.loading('Processing account deletion...');
      // In a real app, this would call an API
      setTimeout(() => {
        toast.success('Account deletion scheduled');
      }, 3000);
    }
  };

  const tabs = [
    
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account', icon: SettingsIcon }
  ];

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
                  const IconComponent = tab.icon;
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
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
             

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-pink-400" />
                    <span>Privacy & Security</span>
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h3 className="font-semibold">Profile Visibility</h3>
                        <p className="text-gray-400 text-sm">Who can see your profile</p>
                      </div>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                        className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                      >
                        <option  className='bg-gray-600' value="public">Public</option>
                        <option  className='bg-gray-600' value="friends">Friends Only</option>
                        <option  className='bg-gray-600' value="private">Private</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you\'re online' },
                        { key: 'showLastSeen', label: 'Show Last Seen', description: 'Show when you were last active' },
                        { key: 'showLocation', label: 'Show Location', description: 'Share your general location' },
                        { key: 'dataSharing', label: 'Data Sharing', description: 'Help improve SoulMate with anonymous data' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div>
                            <h3 className="font-semibold">{item.label}</h3>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                          </div>
                          <button
                            onClick={() => setPrivacySettings({
                              ...privacySettings, 
                              [item.key]: !privacySettings[item.key]
                            })}
                            className={`w-12 h-6 rounded-full transition-all ${
                              privacySettings[item.key] 
                                ? 'bg-pink-500' 
                                : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              privacySettings[item.key] 
                                ? 'transform translate-x-7' 
                                : 'transform translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handlePrivacySave}
                      disabled={saving}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Privacy Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                    <Bell className="h-6 w-6 text-pink-400" />
                    <span>Notifications</span>
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                        { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications' },
                        { key: 'newMatches', label: 'New Matches', description: 'Get notified about new matches' },
                        { key: 'messages', label: 'Messages', description: 'Notify about new messages' },
                        { key: 'likes', label: 'Likes', description: 'Notify when someone likes your profile' },
                        { key: 'friendRequests', label: 'Friend Requests', description: 'Notify about friend requests' },
                        { key: 'soundEnabled', label: 'Sound', description: 'Play sounds for notifications' },
                        { key: 'vibration', label: 'Vibration', description: 'Vibrate for notifications' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div>
                            <h3 className="font-semibold">{item.label}</h3>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                          </div>
                          <button
                            onClick={() => setNotificationSettings({
                              ...notificationSettings, 
                              [item.key]: !notificationSettings[item.key]
                            })}
                            className={`w-12 h-6 rounded-full transition-all ${
                              notificationSettings[item.key] 
                                ? 'bg-pink-500' 
                                : 'bg-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              notificationSettings[item.key] 
                                ? 'transform translate-x-7' 
                                : 'transform translate-x-1'
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
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Notification Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
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
                            const IconComponent = theme.icon;
                            return (
                              <button
                                key={theme.value}
                                onClick={() => setAppearanceSettings({...appearanceSettings, theme: theme.value})}
                                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                                  appearanceSettings.theme === theme.value
                                    ? 'border-pink-500 bg-pink-500/20'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                              >
                                <IconComponent className="h-6 w-6 mx-auto mb-2" />
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
                          onChange={(e) => setAppearanceSettings({...appearanceSettings, language: e.target.value})}
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
                          appearanceSettings.reduceMotion 
                            ? 'bg-pink-500' 
                            : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          appearanceSettings.reduceMotion 
                            ? 'transform translate-x-7' 
                            : 'transform translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <button
                      onClick={handleAppearanceSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Appearance</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                    <SettingsIcon className="h-6 w-6 text-pink-400" />
                    <span>Account</span>
                  </h2>

                  <div className="space-y-6">
                    {/* Data Export */}
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Export Your Data</h3>
                          <p className="text-gray-400">
                            Download a copy of your personal data, including profile information and matches
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
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                        </div>
                        <button
                          onClick={handleAccountDeletion}
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