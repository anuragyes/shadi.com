import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Calendar,
  MapPin, Heart, Sparkles, Shield, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../Context/Authcontext.js'; // ✅ import context




const Signup = () => {
  const navigate = useNavigate();

  // ✅ Get signup function and user info from AuthContext
  const { signup, user, isLoggedIn } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    religion: '',
    motherTongue: '',
    country: '',
    city: '',
    state: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'];
  const languages = ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Odia', 'Punjabi', 'Malayalam'];

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Details', icon: Heart },
    { number: 3, title: 'Location', icon: MapPin }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
    }

    if (currentStep === 2) {
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
      if (!formData.religion) newErrors.religion = 'Religion is required';
      if (!formData.motherTongue) newErrors.motherTongue = 'Mother tongue is required';
    }

    if (currentStep === 3) {
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.city) newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);

    try {
      const result = await signup(formData);
      console.log("Signup result:", result);

      // ⚠️ FIX: Check result structure properly
      if (result && result.success) {
        toast.success(result.message || 'Signup successful!');
        navigate('/');
      } else {
        const errorMessage = result?.message || 'Signup failed';
        toast.error(errorMessage);
        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Unexpected error during signup.');
    } finally {
      setLoading(false);
    }
  };
  // Redirect if already logged in
  if (isLoggedIn) {
    navigate('/');
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <style>
          {`
            /* CSS for animations */
            @keyframes pulse-delay {
              0%, 100% { transform: scale(1) translate(0, 0); }
              50% { transform: scale(1.1) translate(10px, 10px); }
            }
            .animation-delay-2000 { animation-delay: 2s; }
            .animate-pulse-delay { animation: pulse-delay 6s infinite ease-in-out alternate; }
          `}
        </style>
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-delay"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-delay animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">

        {/* Left Side - Branding (Responsive: Hidden on small screens) */}
        <div className="text-white space-y-8 hidden lg:block">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <Heart className="h-8 w-8" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                SoulMate
              </h1>
            </div>
            <p className="text-xl text-purple-200 font-light">
              Where hearts connect and stories begin
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:scale-105 transition-transform">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">10,000+ Matches</h3>
                <p className="text-purple-200 text-sm">Successful connections</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:scale-105 transition-transform">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Verified Profiles</h3>
                <p className="text-purple-200 text-sm">Secure and authentic</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:scale-105 transition-transform">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <Sparkles className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Smart Matching</h3>
                <p className="text-purple-200 text-sm">AI-powered compatibility</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 w-full">
          <form onSubmit={handleSubmit}>
            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-8">
              {steps.map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isActive = step === stepItem.number;
                const isCompleted = step > stepItem.number;

                return (
                  <React.Fragment key={stepItem.number}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`
                        flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
                        ${isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110' : ''}
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}
                      `}>
                        {isCompleted ? (
                          <Sparkles className="h-6 w-6 text-white" />
                        ) : (
                          <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <span className={`text-xs mt-2 text-center ${isActive ? 'text-white font-semibold' : 'text-gray-400'}`}>
                        {stepItem.title}
                      </span>
                    </div>
                    {index !== steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${step > stepItem.number ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Form Content */}
            <div className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                  <p className="text-purple-200 mb-6">Start your journey to find true love</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="First Name"
                        />
                      </div>
                      {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Last Name"
                      />
                      {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="+1 555 555 5555"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Repeat password"
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Personal Details</h2>
                  <p className="text-purple-200 mb-6">Tell us a bit about yourself</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Male', 'Female', 'Other'].map((genderOption) => (
                        <button
                          key={genderOption}
                          type="button"
                          onClick={() => handleChange({ target: { name: 'gender', value: genderOption.toLowerCase() } })}
                          className={`py-3 px-4 rounded-xl border transition-all ${formData.gender === genderOption.toLowerCase()
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500 text-white'
                              : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-purple-400'
                            }`}
                        >
                          {genderOption}
                        </button>
                      ))}
                    </div>
                    {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Religion</label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Religion</option>
                      {religions.map(religion => (
                        <option key={religion} value={religion.toLowerCase()}>{religion}</option>
                      ))}
                    </select>
                    {errors.religion && <p className="text-red-400 text-sm mt-1">{errors.religion}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Mother Tongue</label>
                    <select
                      name="motherTongue"
                      value={formData.motherTongue}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Language</option>
                      {languages.map(language => (
                        <option key={language} value={language.toLowerCase()}>{language}</option>
                      ))}
                    </select>
                    {errors.motherTongue && <p className="text-red-400 text-sm mt-1">{errors.motherTongue}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Location Information</h2>
                  <p className="text-purple-200 mb-6">Where are you located?</p>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Country</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Country</option>
                        <option value="india">India</option>
                        <option value="usa">United States</option>
                        <option value="uk">United Kingdom</option>
                        <option value="canada">Canada</option>
                        <option value="australia">Australia</option>
                      </select>
                    </div>
                    {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="State"
                      />
                      {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="City"
                      />
                      {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
