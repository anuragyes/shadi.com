// components/Features.jsx
import React from 'react';
import { 
  Brain, 
  Lock, 
  Users, 
  MessageCircle, 
  Zap, 
  Globe 
} from 'lucide-react';

const  FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Our advanced algorithm analyzes compatibility based on personality, interests, and values.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Lock,
      title: 'Premium Security',
      description: 'Your data is protected with bank-level encryption and privacy controls.',
      color: 'from-green-500 to-blue-500'
    },
    {
      icon: Users,
      title: 'Verified Community',
      description: 'All profiles are manually verified to ensure authenticity and safety.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageCircle,
      title: 'Smart Messaging',
      description: 'Break the ice with conversation starters and guided messaging.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Get real-time alerts for matches, messages, and profile views.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with compatible matches from around the world.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">SoulMate</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the difference with our unique features designed to help you find meaningful connections.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;