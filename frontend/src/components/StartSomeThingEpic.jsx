import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Users, Shield, Star, ArrowRight } from 'lucide-react';
import Testimonials from './Testimonial';

const StartSomethingEpic = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                Find Your Perfect Match
              </span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            Start something
            <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
              epic.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Join millions of people finding meaningful connections. 
            Your next great relationship starts here.
          </p>
        </div>

        {/* Main CTA Section */}
        <div className="flex flex-col items-center justify-center mb-20">
          <Link
            to="/signup"
            className="group relative bg-gradient-to-r from-pink-500 to-purple-600 text-white px-16 py-6 rounded-2xl font-bold text-2xl shadow-2xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 transition-all duration-500 mb-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative flex items-center space-x-4">
              Create account
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <p className="text-gray-400 text-lg flex items-center space-x-2">
            <span>Already have an account?</span>
            <Link to="/login" className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {[
            {
              icon: Users,
              title: "Real Connections",
              description: "Meet genuine people looking for meaningful relationships"
            },
            {
              icon: Heart,
              title: "Smart Matching",
              description: "Advanced algorithms that understand what you're looking for"
            },
            {
              icon: Shield,
              title: "Safe & Secure",
              description: "Your privacy and safety are our top priorities"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-500">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="text-center mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "10M+", label: "Active Members" },
              { number: "150+", label: "Countries" },
              { number: "2M+", label: "Success Stories" },
              { number: "99%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl text-gray-300 italic mb-6 leading-relaxed">
            "I found my soulmate within weeks of joining. This platform changed my life forever."
          </blockquote>
          <div className="text-gray-400 font-medium">
            - Sarah & Mike, together for 2 years
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-6 h-6 bg-pink-400 rounded-full opacity-60"></div>
      </div>
      <div className="absolute top-40 right-20 animate-float delay-1000">
        <div className="w-4 h-4 bg-purple-400 rounded-full opacity-60"></div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float delay-500">
        <div className="w-8 h-8 bg-blue-400 rounded-full opacity-40"></div>
      </div>
      <Testimonials/>
    </div>
  );
};

export default StartSomethingEpic;