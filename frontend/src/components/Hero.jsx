// components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
    Heart,
    Sparkles,
    Users,
    Shield,
    Star,
    ArrowRight,
    CheckCircle,
    Play
} from 'lucide-react';
import FeaturesSection from './FeaturesSection';
import StartSomethingEpic from './StartSomeThingEpic';

const Hero = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>

                {/* Floating Hearts */}
                <div className="absolute top-20 left-10 animate-bounce">
                    <Heart className="h-8 w-8 text-pink-400 opacity-60" />
                </div>
                <div className="absolute top-40 right-20 animate-bounce animation-delay-1000">
                    <Heart className="h-6 w-6 text-purple-400 opacity-60" />
                </div>
                <div className="absolute bottom-40 left-20 animate-bounce animation-delay-1500">
                    <Heart className="h-10 w-10 text-red-400 opacity-60" />
                </div>
            </div>




            {/* Main Hero Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Main Heading */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full border border-purple-500/30">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-sm font-medium">Find Your Perfect Match Today</span>
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                Where
                                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Hearts </span>
                                Connect &
                                <span className="bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent"> Stories </span>
                                Begin
                            </h1>

                            <p className="text-xl text-gray-300 max-w-2xl">
                                Join thousands of successful couples who found their soulmates through our intelligent matching system.
                                Your journey to true love starts here.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">10,000+</div>
                                <div className="text-gray-400">Successful Matches</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">50+</div>
                                <div className="text-gray-400">Cities Worldwide</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">99%</div>
                                <div className="text-gray-400">Satisfaction Rate</div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/25"
                            >
                                <span className="text-lg font-semibold">Find Your Match</span>
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>

                            <button className="inline-flex items-center justify-center px-8 py-4 border border-gray-600 text-gray-300 rounded-xl hover:border-purple-500 hover:text-white transition-all group">
                                <Play className="h-5 w-5 mr-2 group-hover:text-purple-400" />
                                <span className="text-lg">Watch Story</span>
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center space-x-6 pt-4">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Shield className="h-5 w-5 text-green-400" />
                                <span className="text-sm">Verified Profiles</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <CheckCircle className="h-5 w-5 text-blue-400" />
                                <span className="text-sm">Secure & Private</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Visual */}
                    <div className="relative">
                        {/* Main Card */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 shadow-2xl transform hover:scale-105 transition-all duration-300">
                            <div className="space-y-6">
                                {/* Profile Card */}
                                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                            <Heart className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">Smart Matching</h3>
                                            <p className="text-purple-200 text-sm">AI-powered compatibility</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="space-y-4">
                                    {[
                                        { icon: Star, text: 'Personalized Matches', color: 'text-yellow-400' },
                                        { icon: Users, text: 'Community Events', color: 'text-blue-400' },
                                        { icon: Shield, text: 'Premium Security', color: 'text-green-400' }
                                    ].map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-xl border border-gray-600">
                                            <feature.icon className={`h-5 w-5 ${feature.color}`} />
                                            <span className="text-white text-sm">{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Card */}
                                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 border border-green-500/30">
                                    <div className="text-center">
                                        <p className="text-green-300 text-sm font-semibold">Ready to start your journey?</p>
                                        <p className="text-gray-300 text-xs mt-1">Join now and get your first 5 matches free!</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                            <Star className="h-4 w-4 text-gray-900" />
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="h-4 w-4 text-gray-900" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="animate-bounce">
                    <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
                    </div>
                </div>
            </div>
            <StartSomethingEpic/>
          
        </div>
    );
};

export default Hero;