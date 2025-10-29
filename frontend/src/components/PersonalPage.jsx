import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Sparkles, 
  Camera, 
  Mountain, 
  Music, 
  Palette, 
  BookOpen, 
  Utensils 
} from 'lucide-react';

const UserProfile = ({ users, handleAddFriend }) => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return <div className="text-white text-center mt-20">User not found</div>;

  const getInterestIcon = (interest) => {
    const iconMap = {
      'Hiking': Mountain,
      'Photography': Camera,
      'Coffee': Utensils,
      'Travel': MapPin,
      'Technology': Briefcase,
      'Fitness': Sparkles,
      'Reading': BookOpen,
      'Cooking': Utensils,
      'Dancing': Music,
      'Yoga': Sparkles,
      'Beach': Mountain,
      'Music': Music,
      'Food': Utensils,
      'Writing': BookOpen,
      'Nature': Mountain,
      'Science': GraduationCap,
      'Film': Camera,
      'Art': Palette
    };
    return iconMap[interest] || Sparkles;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition"
        >
          &larr; Back
        </button>

        {/* Photos Carousel */}
        <div className="flex overflow-x-auto gap-4 mb-6">
          {user.photos.map((photo, index) => (
            <img 
              key={index}
              src={photo}
              alt={`${user.name} photo ${index + 1}`}
              className="h-80 w-64 object-cover rounded-2xl flex-shrink-0"
            />
          ))}
        </div>

        {/* User Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{user.name}, {user.age}</h1>
          <div className="flex items-center space-x-4 text-gray-300 mb-2">
            <MapPin className="h-5 w-5" />
            <span>{user.location}</span>
            <span>•</span>
            <span>{user.distance}</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-300 mb-4">
            <div className="flex items-center space-x-1">
              <Briefcase className="h-4 w-4" />
              <span>{user.occupation}</span>
            </div>
            <div className="flex items-center space-x-1">
              <GraduationCap className="h-4 w-4" />
              <span>{user.education}</span>
            </div>
          </div>
          <p className="text-gray-400 mb-4">{user.bio}</p>

          {/* Interests */}
          <div className="flex flex-wrap gap-2 mb-6">
            {user.interests.map((interest, index) => {
              const IconComponent = getInterestIcon(interest);
              return (
                <span 
                  key={index}
                  className="flex items-center space-x-1 bg-white/10 backdrop-blur-lg px-3 py-1 rounded-2xl text-xs font-semibold hover:bg-pink-500/20 transition"
                >
                  <IconComponent className="h-3 w-3 text-pink-400" />
                  <span>{interest}</span>
                </span>
              );
            })}
          </div>

          {/* Add Friend / Cancel Request */}
          <button
            onClick={() => handleAddFriend(user.id)}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              user.isFriend 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 hover:scale-105 shadow-lg shadow-pink-500/30'
            }`}
          >
            {user.isFriend ? 'Cancel Request' : 'Add Friend'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
