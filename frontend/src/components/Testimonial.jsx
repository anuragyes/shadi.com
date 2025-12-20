import React, { useState } from 'react';
import { 
  Heart, 
  Star, 
  Quote, 
  Calendar, 
  // Ring, 
  Sparkles, 
  Users,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      coupleName: "Sarah & Michael",
      weddingDate: "March 15, 2024",
      story: "We found each other on SoulMate after both going through difficult breakups. Our first conversation lasted 6 hours, and we knew we had found something special. Michael proposed at sunset on the same beach where we had our first date!",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&crop=face",
      partnerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face",
      coupleImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop",
      rating: 5,
      tags: ["Perfect Match", "Engaged", "Adventure Lovers"]
    },
    {
      id: 2,
      coupleName: "Priya & Raj",
      weddingDate: "December 2, 2024",
      story: "As software engineers from different cities, we never thought we'd find love online. But SoulMate's compatibility algorithm brought us together! Our families are thrilled, and we're planning a beautiful traditional wedding surrounded by loved ones.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=500&fit=crop&crop=face",
      partnerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&crop=face",
      coupleImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600&h=400&fit=crop",
      rating: 5,
      tags: ["Cross-City Love", "Tech Couple", "Traditional Wedding"]
    },
    {
      id: 3,
      coupleName: "Emma & James",
      weddingDate: "June 8, 2024",
      story: "After years of searching for 'the one,' James messaged me with the most thoughtful opening line. We bonded over our love for hiking and old movies. He proposed during our favorite hike, and now we're counting down the days to our mountain wedding!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop&crop=face",
      partnerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop&crop=face",
      coupleImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop",
      rating: 5,
      tags: ["Outdoor Wedding", "Shared Hobbies", "Mountain Proposal"]
    },
    {
      id: 4,
      coupleName: "Aisha & David",
      weddingDate: "September 20, 2024",
      story: "We connected over our passion for volunteering and making a difference. Our first date was at a charity event, and we've been inseparable ever since. We're excited to start our life together and continue making the world a better place!",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=500&fit=crop&crop=face",
      partnerImage: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=500&h=500&fit=crop&crop=face",
      coupleImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop",
      rating: 5,
      tags: ["Philanthropy", "Shared Values", "Community Focused"]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const stats = [
    { number: "2,500+", label: "Marriages This Year" },
    { number: "15,000+", label: "Engaged Couples" },
    { number: "98%", label: "Success Rate" },
    { number: "50+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 left-10 animate-bounce">
          <Sparkles className="h-8 w-8 text-yellow-300" />
        </div>
        <div className="absolute bottom-10 right-10 animate-pulse">
          <Heart className="h-12 w-12 text-pink-200" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
              {/* <Ring className="h-12 w-12 text-white" /> */}
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            True Love Stories
          </h1>
          <p className="text-xl md:text-2xl text-pink-100 max-w-3xl mx-auto leading-relaxed">
            Discover heartwarming stories of couples who found their soulmates and are beginning their forever journey together
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Testimonials Carousel */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Upcoming Weddings
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet the excited couples who found their perfect match and are preparing for their special day
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-lg border border-pink-200 rounded-full p-3 hover:bg-pink-50 hover:scale-110 transition-all shadow-lg"
            >
              <ArrowLeft className="h-6 w-6 text-pink-500" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-lg border border-pink-200 rounded-full p-3 hover:bg-pink-50 hover:scale-110 transition-all shadow-lg"
            >
              <ArrowRight className="h-6 w-6 text-pink-500" />
            </button>

            {/* Testimonial Cards */}
            <div className="overflow-hidden rounded-3xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      {/* Couple Image */}
                      <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                        <img 
                          src={testimonial.coupleImage} 
                          alt={testimonial.coupleName}
                          className="w-full h-96 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-5 w-5" />
                            <span className="font-semibold">{testimonial.weddingDate}</span>
                          </div>
                          <h3 className="text-2xl font-bold">{testimonial.coupleName}</h3>
                        </div>
                      </div>

                      {/* Testimonial Content */}
                      <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        {/* Couple Avatars */}
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="flex -space-x-3">
                            <img 
                              src={testimonial.image} 
                              alt="Bride"
                              className="w-14 h-14 rounded-full border-4 border-white shadow-lg"
                            />
                            <img 
                              src={testimonial.partnerImage} 
                              alt="Groom"
                              className="w-14 h-14 rounded-full border-4 border-white shadow-lg"
                            />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">{testimonial.coupleName}</h3>
                            <div className="flex items-center space-x-1">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Story */}
                        <div className="relative mb-6">
                          <Quote className="absolute -top-2 -left-2 h-8 w-8 text-pink-200" />
                          <p className="text-gray-600 text-lg leading-relaxed pl-6">
                            {testimonial.story}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {testimonial.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Wedding Countdown */}
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
                          <div className="flex items-center space-x-2 text-pink-600 mb-2">
                            <Calendar className="h-5 w-5" />
                            <span className="font-semibold">Counting down to the big day!</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            The {testimonial.coupleName.split('&')[1].trim()} wedding is coming soon
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-pink-500 w-8' 
                      : 'bg-pink-200 hover:bg-pink-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

     

    
    </div>
  );
};

export default Testimonials;


