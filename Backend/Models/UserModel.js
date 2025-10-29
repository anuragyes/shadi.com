// // models/User.js
// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   // ============ AUTHENTICATION & BASIC INFO ============
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true, 
//     lowercase: true 
//   },
//   password: { 
//     type: String, 
//     required: true 
//   },
//   phone: { 
//     type: String 
//   },
//   role: { 
//     type: String, 
//     enum: ['user', 'admin', 'moderator'], 
//     default: 'user' 
//   },
//   isVerified: { 
//     type: Boolean, 
//     default: false 
//   },
//   isActive: { 
//     type: Boolean, 
//     default: true 
//   },
//   profileCompletion: {
//     type: Number,
//     default: 0
//   },

//   // ============ PROFILE MEDIA ============
//   profilePhoto: {
//     type: String
//   },
//   gallery: [{
//     type: String
//   }],

//   // ============ BASIC PERSONAL INFORMATION ============
//   personalInfo: {
//     firstName: { type: String },
//     lastName: { type: String },
//     gender: { 
//       type: String, 
//       enum: ['male', 'female'] 
//     },
//     dateOfBirth: { type: Date },
//     maritalStatus: { 
//       type: String, 
//       enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'] 
//     },
//     height: { 
//       value: { type: Number }, // in cm
//       unit: { type: String, enum: ['cm', 'feet'], default: 'cm' }
//     },
//     weight: { type: Number }, // in kg
//     physicalStatus: { 
//       type: String, 
//       enum: ['normal', 'physically_challenged'] 
//     },
//     bloodGroup: {
//       type: String,
//       enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
//     },
//     aboutMe: { type: String, maxlength: 1000 }
//   },

//   // ============ RELIGIOUS & BACKGROUND ============
//   religiousInfo: {
//     religion: { 
//       type: String,
//       enum: ['hindu', 'muslim', 'christian', 'sikh', 'jain', 'buddhist', 'other']
//     },
//     caste: { type: String },
//     subCaste: { type: String },
//     gotra: { type: String },
//     motherTongue: { type: String },
//     ethnicOrigin: { type: String },
//     horoscope: {
//       hasHoroscope: { type: Boolean, default: false },
//       rashi: { type: String },
//       nakshatra: { type: String },
//       manglik: { type: Boolean, default: false }
//     }
//   },

//   // ============ PROFESSIONAL & EDUCATION ============
//   professionalInfo: {
//     // Education Details
//     education: {
//       highestDegree: { type: String },
//       field: { type: String },
//       institute: { type: String },
//       yearOfPassing: { type: Number },
//       educationLevel: {
//         type: String,
//         enum: ['high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other']
//       }
//     },
    
//     // Career Details
//     occupation: {
//       type: String,
//       enum: [
//         'government_job', 'private_job', 'business', 'self_employed', 
//         'doctor', 'engineer', 'teacher', 'lawyer', 'ca', 'defense', 
//         'civil_services', 'student', 'not_working', 'other'
//       ]
//     },
//     jobTitle: { type: String },
//     company: { type: String },
//     industry: { type: String },
    
//     // Income Details
//     income: {
//       annual: { type: Number },
//       currency: { type: String, default: 'INR' },
//       display: { type: Boolean, default: true }
//     },
    
//     // Work Location
//     workLocation: {
//       city: { type: String },
//       state: { type: String },
//       country: { type: String }
//     }
//   },

//   // ============ FAMILY INFORMATION ============
//   familyInfo: {
//     // Family Background
//     familyType: { 
//       type: String, 
//       enum: ['joint', 'nuclear', 'other'] 
//     },
//     familyStatus: { 
//       type: String, 
//       enum: ['upper_class', 'upper_middle', 'middle', 'lower_middle'] 
//     },
    
//     // Parents Information
//     father: {
//       occupation: { type: String },
//       isAlive: { type: Boolean, default: true }
//     },
//     mother: {
//       occupation: { type: String },
//       isAlive: { type: Boolean, default: true }
//     },
    
//     // Siblings Information
//     siblings: {
//       brothers: {
//         total: { type: Number, default: 0 },
//         married: { type: Number, default: 0 }
//       },
//       sisters: {
//         total: { type: Number, default: 0 },
//         married: { type: Number, default: 0 }
//       }
//     },
    
//     // Family Location
//     nativePlace: {
//       city: { type: String },
//       state: { type: String },
//       country: { type: String }
//     },
    
//     // Living Situation
//     livingWithParents: { type: Boolean, default: false },
//     familyValues: [{ type: String }]
//   },

//   // ============ LIFESTYLE & HABITS ============
//   lifestyleInfo: {
//     // Dietary Preferences
//     diet: { 
//       type: String, 
//       enum: ['vegetarian', 'eggetarian', 'non_vegetarian'] 
//     },
    
//     // Habits
//     smoking: { 
//       type: String, 
//       enum: ['non_smoker', 'occasional', 'regular'] 
//     },
//     drinking: { 
//       type: String, 
//       enum: ['non_drinker', 'occasional', 'regular'] 
//     },
    
//     // Interests
//     hobbies: [{ type: String }],
//     interests: [{ type: String }],
    
//     // Languages
//     languages: [{
//       language: { type: String },
//       proficiency: { 
//         type: String, 
//         enum: ['beginner', 'intermediate', 'fluent', 'native'] 
//       }
//     }]
//   },

//   // ============ LOCATION DETAILS ============
//   location: {
//     // Current Location
//     current: {
//       country: { type: String },
//       state: { type: String },
//       city: { type: String },
//       zipCode: { type: String }
//     },
    
//     // Permanent Location
//     permanent: {
//       country: { type: String },
//       state: { type: String },
//       city: { type: String },
//       zipCode: { type: String }
//     },
    
//     // Citizenship & Residency
//     citizenship: { type: String },
//     residencyStatus: { 
//       type: String, 
//       enum: ['citizen', 'nri', 'oci', 'other'] 
//     }
//   },

//   // ============ PARTNER PREFERENCES ============
//   partnerPreferences: {
//     // Basic Preferences
//     ageRange: {
//       min: { type: Number, min: 18, max: 100 },
//       max: { type: Number, min: 18, max: 100 }
//     },
//     heightRange: {
//       min: { type: Number, min: 100, max: 250 },
//       max: { type: Number, min: 100, max: 250 }
//     },
    
//     // Background Preferences
//     maritalStatus: [{
//       type: String,
//       enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce']
//     }],
//     religions: [{ type: String }],
//     castes: [{ type: String }],
    
//     // Education & Career Preferences
//     education: {
//       level: [{ type: String }],
//       specific: [{ type: String }]
//     },
//     occupations: [{ type: String }],
//     incomeRange: {
//       min: { type: Number },
//       max: { type: Number }
//     },
    
//     // Location Preferences
//     location: {
//       countries: [{ type: String }],
//       states: [{ type: String }],
//       cities: [{ type: String }]
//     },
    
//     // Lifestyle Preferences
//     lifestyle: {
//       diet: [{ type: String }],
//       smoking: [{ type: String }],
//       drinking: [{ type: String }]
//     },
    
//     // Horoscope Preferences
//     horoscope: {
//       manglik: { 
//         type: String, 
//         enum: ['any', 'manglik', 'non_manglik'] 
//       },
//       requireHoroscopeMatch: { type: Boolean, default: false }
//     }
//   },

//   // ============ PRIVACY & SETTINGS ============
//   privacySettings: {
//     profileVisibility: { 
//       type: String, 
//       enum: ['public', 'private', 'only_matches'], 
//       default: 'public' 
//     },
//     showContactInfo: { type: Boolean, default: false },
//     showIncome: { type: Boolean, default: true },
//     showLastActive: { type: Boolean, default: true }
//   },

//   // ============ SUBSCRIPTION ============
//   subscription: {
//     plan: { 
//       type: String, 
//       enum: ['free', 'premium', 'vip'], 
//       default: 'free' 
//     },
//     expiresAt: { type: Date }
//   },

//   // ============ STATISTICS ============
//   statistics: {
//     profileViews: { type: Number, default: 0 },
//     interestsSent: { type: Number, default: 0 },
//     interestsReceived: { type: Number, default: 0 },
//     matches: { type: Number, default: 0 },
//     shortlists: { type: Number, default: 0 }
//   },

//   // ============ TIMESTAMPS ============
//   lastActive: { type: Date, default: Date.now },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }

// }, { 
//   timestamps: true 
// });

// export default mongoose.model('User', userSchema);


// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // ============ AUTHENTICATION & BASIC INFO ============
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'moderator'], 
    default: 'user' 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  profileCompletion: {
    type: Number,
    default: 0
  },

  // ============ PROFILE MEDIA ============
  profilePhoto: {
    type: String
  },
  // ✅ ADDED: Missing profileImage field
  profileImage: {
    type: String
  },
  gallery: [{
    type: String
  }],

  // ============ BASIC PERSONAL INFORMATION ============
  personalInfo: {
    firstName: { type: String },
    lastName: { type: String },
    gender: { 
      type: String, 
      enum: ['male', 'female'] 
    },
    dateOfBirth: { type: Date },
    maritalStatus: { 
      type: String, 
      enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'] 
    },
    height: { 
      value: { type: Number }, // in cm
      unit: { type: String, enum: ['cm', 'feet'], default: 'cm' }
    },
    weight: { type: Number }, // in kg
    physicalStatus: { 
      type: String, 
      enum: ['normal', 'physically_challenged'] 
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    aboutMe: { type: String, maxlength: 1000 },
    // ✅ ADDED: Missing profileImage field in personalInfo
    profileImage: { type: String }
  },

  // ============ RELIGIOUS & BACKGROUND ============
  religiousInfo: {
    religion: { 
      type: String,
      enum: ['hindu', 'muslim', 'christian', 'sikh', 'jain', 'buddhist', 'other']
    },
    caste: { type: String },
    subCaste: { type: String },
    gotra: { type: String },
    motherTongue: { type: String },
    ethnicOrigin: { type: String },
    horoscope: {
      hasHoroscope: { type: Boolean, default: false },
      rashi: { type: String },
      nakshatra: { type: String },
      manglik: { type: Boolean, default: false }
    }
  },

  // ============ PROFESSIONAL & EDUCATION ============
  professionalInfo: {
    // Education Details
    education: {
      highestDegree: { type: String },
      field: { type: String },
      institute: { type: String },
      yearOfPassing: { type: Number },
      educationLevel: {
        type: String,
        enum: ['high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other']
      }
    },
    
    // Career Details
    occupation: {
      type: String,
      enum: [
        'government_job', 'private_job', 'business', 'self_employed', 
        'doctor', 'engineer', 'teacher', 'lawyer', 'ca', 'defense', 
        'civil_services', 'student', 'not_working', 'other'
      ]
    },
    jobTitle: { type: String },
    company: { type: String },
    industry: { type: String },
    
    // Income Details
    income: {
      annual: { type: Number },
      currency: { type: String, default: 'INR' },
      display: { type: Boolean, default: true }
    },
    
    // Work Location
    workLocation: {
      city: { type: String },
      state: { type: String },
      country: { type: String }
    }
  },

  // ============ FAMILY INFORMATION ============
  familyInfo: {
    // Family Background
    familyType: { 
      type: String, 
      enum: ['joint', 'nuclear', 'other'] 
    },
    familyStatus: { 
      type: String, 
      enum: ['upper_class', 'upper_middle', 'middle', 'lower_middle'] 
    },
    
    // Parents Information
    father: {
      occupation: { type: String },
      isAlive: { type: Boolean, default: true }
    },
    mother: {
      occupation: { type: String },
      isAlive: { type: Boolean, default: true }
    },
    
    // Siblings Information
    siblings: {
      brothers: {
        total: { type: Number, default: 0 },
        married: { type: Number, default: 0 }
      },
      sisters: {
        total: { type: Number, default: 0 },
        married: { type: Number, default: 0 }
      }
    },
    
    // Family Location
    nativePlace: {
      city: { type: String },
      state: { type: String },
      country: { type: String }
    },
    
    // Living Situation
    livingWithParents: { type: Boolean, default: false },
    familyValues: [{ type: String }]
  },

  // ============ LIFESTYLE & HABITS ============
  lifestyleInfo: {
    // Dietary Preferences
    diet: { 
      type: String, 
      enum: ['vegetarian', 'eggetarian', 'non_vegetarian'] 
    },
    
    // Habits
    smoking: { 
      type: String, 
      enum: ['non_smoker', 'occasional', 'regular'] 
    },
    drinking: { 
      type: String, 
      enum: ['non_drinker', 'occasional', 'regular'] 
    },
    
    // Interests
    hobbies: [{ type: String }],
    interests: [{ type: String }],
    
    // Languages
    languages: [{
      language: { type: String },
      proficiency: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'fluent', 'native'] 
      }
    }]
  },

  // ============ LOCATION DETAILS ============
  location: {
    // Current Location
    current: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
      zipCode: { type: String }
    },
    
    // Permanent Location
    permanent: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
      zipCode: { type: String }
    },
    
    // Citizenship & Residency
    citizenship: { type: String },
    residencyStatus: { 
      type: String, 
      enum: ['citizen', 'nri', 'oci', 'other'] 
    }
  },

  // ============ PARTNER PREFERENCES ============
  partnerPreferences: {
    // Basic Preferences
    ageRange: {
      min: { type: Number, min: 18, max: 100 },
      max: { type: Number, min: 18, max: 100 }
    },
    heightRange: {
      min: { type: Number, min: 100, max: 250 },
      max: { type: Number, min: 100, max: 250 }
    },
    
    // Background Preferences
    maritalStatus: [{
      type: String,
      enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce']
    }],
    religions: [{ type: String }],
    castes: [{ type: String }],
    
    // Education & Career Preferences
    education: {
      level: [{ type: String }],
      specific: [{ type: String }]
    },
    occupations: [{ type: String }],
    incomeRange: {
      min: { type: Number },
      max: { type: Number }
    },
    
    // Location Preferences
    location: {
      countries: [{ type: String }],
      states: [{ type: String }],
      cities: [{ type: String }]
    },
    
    // Lifestyle Preferences
    lifestyle: {
      diet: [{ type: String }],
      smoking: [{ type: String }],
      drinking: [{ type: String }]
    },
    
    // Horoscope Preferences
    horoscope: {
      manglik: { 
        type: String, 
        enum: ['any', 'manglik', 'non_manglik'] 
      },
      requireHoroscopeMatch: { type: Boolean, default: false }
    }
  },

  // ============ PRIVACY & SETTINGS ============
  privacySettings: {
    profileVisibility: { 
      type: String, 
      enum: ['public', 'private', 'only_matches'], 
      default: 'public' 
    },
    showContactInfo: { type: Boolean, default: false },
    showIncome: { type: Boolean, default: true },
    showLastActive: { type: Boolean, default: true }
  },

  // ============ SUBSCRIPTION ============
  subscription: {
    plan: { 
      type: String, 
      enum: ['free', 'premium', 'vip'], 
      default: 'free' 
    },
    expiresAt: { type: Date }
  },

  // ============ STATISTICS ============
  statistics: {
    profileViews: { type: Number, default: 0 },
    interestsSent: { type: Number, default: 0 },
    interestsReceived: { type: Number, default: 0 },
    matches: { type: Number, default: 0 },
    shortlists: { type: Number, default: 0 }
  },

  // ============ TIMESTAMPS ============
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

}, { 
  timestamps: true 
});

export default mongoose.model('User', userSchema);