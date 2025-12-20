import React, { useState, useEffect } from 'react';
import {
    Star,
    Heart,
    CheckCircle,
    Shield,
    MessageSquare,
    Video,
    Eye,
    Gift,
    Zap,
    Users,
    Crown,
    ArrowRight,
    X,
    Sparkles,
    Trophy,
    Check,
    Clock,
    UserCheck,
    Lock,
    Globe,
    Filter,
    Receipt,
    Bell
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


const PremiumFeaturesPage = ({ userPlan = 'free', onUpgrade }) => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_RAZORPAY_KEY_ID;
    //  console.log("t-/--------------------hsi si sen=v file ", apiUrl)
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem("user"));

    const currentuserId = currentUser.id;
    const BASE_URL = "http://localhost:5000"


    // Load Razorpay script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => {
                console.error("Failed to load Razorpay SDK");
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    // Handle payment for a specific plan
    const handlePlanPayment = async (plan) => {
        setSelectedPlanDetails(plan);
        setShowPaymentModal(true);
    };

    // Process payment with Razorpay


    // const processPayment = async () => {
    //     if (!selectedPlanDetails) {
    //         toast.error("Please select a plan first");
    //         return;
    //     }

    //     if (!currentuserId) {
    //         toast.error("Please login to continue");
    //         return;
    //     }

    //     setLoading(true);
    //     setPaymentStatus(null);

    //     try {
    //         // Load Razorpay SDK
    //         const razorpayLoaded = await loadRazorpay();
    //         if (!razorpayLoaded) {
    //             toast.error("Payment system failed to load. Please try again.");
    //             setLoading(false);
    //             return;
    //         }

    //         // Create order on backend using axios
    //         const orderResponse = await axios.post(
    //             `${BASE_URL}/api/payment/create-order/${currentuserId}`,
    //             {
    //                 userId: currentuserId,
    //                 planId: selectedPlanDetails.name.toLowerCase(),
    //                 planName: selectedPlanDetails.name,
    //                 amount: Number(
    //                     selectedPlanDetails.price.replace('₹', '').replace(',', '')     // very import rozarpay always take in paise 
    //                 )*100,
    //                 duration: selectedPlanDetails.duration,
    //                 features: selectedPlanDetails.features
    //             },
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //                 }
    //             }
    //         );

    //         const orderData = orderResponse.data;

    //         console.log("-------------------------------------------------------------------------", orderResponse)

    //         if (!orderData.success) {
    //             throw new Error(orderData.message || 'Failed to create order');
    //         }

    //         // Razorpay options
    //         const options = {
    //             key: apiUrl || "rzp_test_YOUR_KEY_ID",
    //             amount: orderData.order.amount,
    //             currency: "INR",
    //             name: "SoulMate Matrimony",
    //             description: `${selectedPlanDetails.name} Premium Plan - ${selectedPlanDetails.duration}`,
    //             order_id: orderData.order.id,
    //             prefill: {
    //                 name: currentUser.name || '',
    //                 email: currentUser.email || '',
    //                 contact: currentUser.phone || ''
    //             },
    //             theme: {
    //                 color: "#8B5CF6"
    //             },
    //             handler: async function (response) {
    //                 setLoading(true);

    //                 // Verify payment on backend using axios
    //                 try {
    //                     const verifyResponse = await axios.post(
    //                         `${BASE_URL}/api/payment-verification/verify-payment`,
    //                         {
    //                             razorpay_order_id: response.razorpay_order_id,
    //                             razorpay_payment_id: response.razorpay_payment_id,
    //                             razorpay_signature: response.razorpay_signature,
    //                             userId: currentUser.id,
    //                             planId: selectedPlanDetails.name.toLowerCase(),
    //                             amount: orderData.order.amount/100,
    //                         },
    //                         {
    //                             headers: {
    //                                 'Authorization': `Bearer ${localStorage.getItem('token')}`
    //                             }
    //                         }
    //                     );

    //                     const verifyData = verifyResponse.data;

    //                     if (verifyData.success) {
    //                         setPaymentStatus('success');
    //                         toast.success("Payment Successful! Premium features are now activated.");

    //                         onUpgrade?.(selectedPlanDetails.name.toLowerCase());

    //                         setTimeout(() => {
    //                             setShowPaymentModal(false);
    //                             setPaymentStatus(null);
    //                         }, 2000);
    //                     } else {
    //                         setPaymentStatus('failed');
    //                         toast.error("Payment verification failed. Please contact support.");
    //                     }
    //                 } catch (error) {
    //                     console.error('Verification error:', error);
    //                     setPaymentStatus('failed');
    //                     toast.error("Payment verification error. Please contact support.");
    //                 } finally {
    //                     setLoading(false);
    //                 }
    //             },
    //             modal: {
    //                 ondismiss: function () {
    //                     setLoading(false);
    //                     setPaymentStatus(null);
    //                 }
    //             }
    //         };

    //         // console.log("thmwdeidnjenddedou3bdur", options.amount);

    //         const paymentObject = new window.Razorpay(options);
    //         paymentObject.open();

    //     } catch (error) {
    //         console.error('Payment error:', error);

    //         // Handle axios error specifically
    //         if (error.response) {
    //             // Server responded with error status
    //             toast.error(error.response.data.message || 'Payment failed. Please try again.');
    //         } else if (error.request) {
    //             // Request made but no response received
    //             toast.error("No response from server. Please check your connection.");
    //         } else {
    //             // Something else happened
    //             toast.error(error.message || 'Payment failed. Please try again.');
    //         }

    //         setPaymentStatus('failed');
    //     } finally {
    //         setLoading(false);
    //     }
    // };




    const processPayment = async () => {
        if (!selectedPlanDetails) {
            toast.error("Please select a plan first");
            return;
        }

        if (!currentuserId) {
            toast.error("Please login to continue");
            return;
        }

        setLoading(true);
        setPaymentStatus(null);

        try {
            // Load Razorpay SDK
            const razorpayLoaded = await loadRazorpay();
            if (!razorpayLoaded) {
                toast.error("Payment system failed to load. Please try again.");
                return;
            }

            //Convert amount to PAISE (ONCE ONLY)
            const amountInPaise =
                Math.round(
                    Number(
                        selectedPlanDetails.price.replace(/[^\d.]/g, "")
                    )*100
                );

                 console.log("yhis is amout in paise0000000000000000000000 " , amountInPaise);

            // Create order on backend
            const orderResponse = await axios.post(
                `${BASE_URL}/api/payment/create-order/${currentuserId}`,
                {
                    planId: selectedPlanDetails.name.toLowerCase(),
                    planName: selectedPlanDetails.name,
                    amount: amountInPaise, // ✅ paise
                    duration: selectedPlanDetails.duration,
                    features: selectedPlanDetails.features
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const orderData = orderResponse.data;

            if (!orderData.success) {
                throw new Error(orderData.message || "Failed to create order");
            }

            // Razorpay options
            const options = {
                key: apiUrl || "rzp_test_YOUR_KEY_ID",
                amount: orderData.order.amount, // ✅ paise
                currency: "INR",
                name: "SoulMate Matrimony",
                description: `${selectedPlanDetails.name} Premium Plan - ${selectedPlanDetails.duration}`,
                order_id: orderData.order.id,

                prefill: {
                    name: currentUser?.name || "",
                    email: currentUser?.email || "",
                    contact: currentUser?.phone || ""
                },

                theme: {
                    color: "#8B5CF6"
                },

                handler: async function (response) {
                    try {
                        setLoading(true);

                        // ✅ VERIFY PAYMENT (NO AMOUNT CONVERSION HERE)
                        const verifyResponse = await axios.post(
                            `${BASE_URL}/api/payment-verification/verify-payment`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`
                                }
                            }
                        );

                        if (verifyResponse.data.success) {
                            setPaymentStatus("success");
                            toast.success("Payment Successful! Premium activated 🎉");

                            onUpgrade?.(selectedPlanDetails.name.toLowerCase());

                            setTimeout(() => {
                                setShowPaymentModal(false);
                                setPaymentStatus(null);
                            }, 2000);
                        } else {
                            setPaymentStatus("failed");
                            toast.error("Payment verification failed");
                        }
                    } catch (err) {
                        console.error("Verification error:", err);
                        setPaymentStatus("failed");
                        toast.error("Payment verification error");
                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setPaymentStatus(null);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error("Payment error:", error);

            if (error.response) {
                toast.error(error.response.data.message || "Payment failed");
            } else {
                toast.error(error.message || "Payment failed");
            }

            setPaymentStatus("failed");
        } finally {
            setLoading(false);
        }
    };

    const premiumFeatures = [
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Unlimited Messaging",
            description: "Connect freely with unlimited messages to all profiles",
            free: "5/day limit",
            premium: "Unlimited",
            color: "from-violet-500 to-purple-500",
            highlight: true
        },
        {
            icon: <Eye className="w-8 h-8" />,
            title: "Profile Visitors",
            description: "See everyone who viewed your profile",
            free: "Not available",
            premium: "Complete visibility",
            color: "from-cyan-400 to-blue-500"
        },
        {
            icon: <Video className="w-8 h-8" />,
            title: "Video Connect",
            description: "Video profile & premium video calling",
            free: "Text only",
            premium: "Video enabled",
            color: "from-pink-500 to-rose-500",
            highlight: true
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Privacy Guard",
            description: "Advanced privacy controls & incognito mode",
            free: "Basic",
            premium: "Advanced",
            color: "from-emerald-400 to-green-500"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Priority Matching",
            description: "Top placement in search & suggestions",
            free: "Standard",
            premium: "Priority",
            color: "from-amber-400 to-orange-500",
            highlight: true
        },
        {
            icon: <Trophy className="w-8 h-8" />,
            title: "Premium Badge",
            description: "Exclusive badge for 3x more responses",
            free: "No badge",
            premium: "Premium Badge",
            color: "from-purple-500 to-violet-600"
        },
        {
            icon: <UserCheck className="w-8 h-8" />,
            title: "Verified Only",
            description: "Filter to show only verified profiles",
            free: "Not available",
            premium: "Available",
            color: "from-blue-400 to-indigo-500"
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Global Search",
            description: "Search profiles across countries",
            free: "Local only",
            premium: "Global access",
            color: "from-teal-400 to-emerald-500",
            highlight: true
        }
    ];

    const plans = [
        {
            id: "silver",
            name: "Silver",
            duration: "1 Month",
            price: "₹999",
            period: "month",
            originalPrice: "₹1,499",
            discount: "33% OFF",
            features: ["Unlimited Messages", "Profile Visitors", "Basic Support"],
            color: "bg-gradient-to-br from-slate-700 to-slate-800",
            border: "border-slate-700"
        },
        {
            id: "gold",
            name: "Gold",
            duration: "3 Months",
            price: "₹2,499",
            period: "3 months",
            originalPrice: "₹4,497",
            discount: "44% OFF",
            popular: true,
            features: ["All Silver features", "Video Connect", "Priority Matching", "Priority Support"],
            color: "bg-gradient-to-br from-amber-900/30 to-amber-800/20",
            border: "border-amber-500",
            badge: "MOST POPULAR"
        },
        {
            id: "platinum",
            name: "Platinum",
            duration: "12 Months",
            price: "₹8,999",
            period: "year",
            originalPrice: "₹17,988",
            discount: "50% OFF",
            features: ["All Gold features", "Global Search", "Dedicated Support", "Profile Boost", "Advanced Analytics"],
            color: "bg-gradient-to-br from-purple-900/30 to-violet-900/20",
            border: "border-purple-500"
        }
    ];

    const successStories = [
        {
            names: "Arjun & Priya",
            married: "Married 2023",
            story: "Found each other within 2 weeks of upgrading. The video call feature made all the difference!",
            avatar: "AP"
        },
        {
            names: "Rohan & Sneha",
            married: "Engaged 2024",
            story: "Priority matching connected us despite being in different cities. Forever grateful!",
            avatar: "RS"
        },
        {
            names: "Karan & Neha",
            married: "Married 2024",
            story: "Unlimited messaging helped us build a deep connection before meeting in person.",
            avatar: "KN"
        }
    ];

    const stats = [
        { value: "300%", label: "More Profile Views" },
        { value: "85%", label: "Higher Response Rate" },
        { value: "2.5x", label: "Faster Matches" },
        { value: "94%", label: "User Satisfaction" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">

            {/* Hero Section */}

            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">



                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        {/* Top right button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => navigate('/transactions')}
                                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors"
                            >
                                <Receipt className="w-4 h-4" />
                                <span>View Transactions</span>
                            </button>
                        </div>

                        {/* Center content */}
                        <div className="text-center mt-10">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/30 to-violet-600/30 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-purple-500/30">
                                <Sparkles className="w-5 h-5 text-purple-300" />
                                <span className="text-sm font-semibold text-purple-200">
                                    EXCLUSIVE PREMIUM ACCESS
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold mb-6">
                                <span className="block">Find Your Perfect</span>
                                <span className="block bg-gradient-to-r from-white via-purple-200 to-violet-300 bg-clip-text text-transparent">
                                    Life Partner
                                </span>
                            </h1>

                            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                                Unlock elite features that connect you with highly compatible matches
                                through advanced matching algorithms
                            </p>

                            <button
                                onClick={() => handlePlanPayment(plans[1])}
                                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
                            >
                                <span>Upgrade to Premium</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                {stat.value}
                            </div>
                            <div className="text-sm text-slate-300 mt-2">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Features Grid */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Premium Features</h2>
                        <p className="text-slate-400">Everything you need to find your perfect match</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {premiumFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/50 hover:bg-white/10 ${feature.highlight ? 'md:col-span-2 lg:col-span-1' : ''
                                    }`}
                                onMouseEnter={() => setHoveredFeature(index)}
                                onMouseLeave={() => setHoveredFeature(null)}
                            >
                                {feature.highlight && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-semibold px-3 py-1 rounded-full">
                                            POPULAR
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                                        {feature.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                        <p className="text-sm text-slate-400 mb-4">{feature.description}</p>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Free:</span>
                                                <span className="text-slate-400">{feature.free}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-purple-300">Premium:</span>
                                                <span className="text-emerald-400 font-semibold">{feature.premium}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
                        <p className="text-slate-400">Select the perfect plan for your matrimony journey</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-[1.02] ${plan.color} ${plan.border} ${plan.popular ? 'shadow-2xl shadow-amber-500/20' : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                                            {plan.badge}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                                        {plan.discount && (
                                            <span className="text-sm bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                                                {plan.discount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400">{plan.duration}</p>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-slate-400 ml-2">/{plan.period}</span>
                                    </div>
                                    {plan.originalPrice && (
                                        <div className="text-sm text-slate-500 line-through mt-1">
                                            {plan.originalPrice}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm">
                                            <Check className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePlanPayment(plan)}
                                    disabled={loading}
                                    className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/30'
                                        : 'bg-white/10 hover:bg-white/20'
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Processing...' : plan.popular ? 'Get Started Now' : 'Choose Plan'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success Stories */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
                        <p className="text-slate-400">Real couples who found love with Premium</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {successStories.map((story, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
                            >
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {story.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">{story.names}</h4>
                                        <p className="text-sm text-purple-300">{story.married}</p>
                                    </div>
                                </div>
                                <p className="text-slate-300 italic">"{story.story}"</p>
                                <div className="flex mt-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative rounded-3xl overflow-hidden mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-violet-600/20"></div>
                    <div className="relative z-10 p-12 text-center">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold mb-4">
                                Ready to Begin Your Journey?
                            </h2>
                            <p className="text-slate-300 mb-8">
                                Join thousands of successful couples who found their perfect match with SoulMate Premium
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => handlePlanPayment(plans[1])}
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Loading...' : 'Upgrade Now'}
                                </button>
                                <button className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all">
                                    View Free Features
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Add this in your PremiumFeaturesPage component, after the hero section or in a navigation bar */}


            {/* Payment Modal */}
            {showPaymentModal && selectedPlanDetails && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full border border-white/10">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold">Complete Upgrade</h3>
                                <button
                                    onClick={() => {
                                        if (!loading) {
                                            setShowPaymentModal(false);
                                            setPaymentStatus(null);
                                        }
                                    }}
                                    className="text-slate-400 hover:text-white disabled:opacity-50"
                                    disabled={loading}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {paymentStatus === 'success' ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">Payment Successful!</h4>
                                    <p className="text-slate-400">Your premium features are now activated.</p>
                                </div>
                            ) : paymentStatus === 'failed' ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <X className="w-8 h-8 text-red-400" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">Payment Failed</h4>
                                    <p className="text-slate-400">Please try again or contact support.</p>
                                    <button
                                        onClick={() => setPaymentStatus(null)}
                                        className="mt-4 px-6 py-2 bg-purple-600 rounded-lg font-semibold"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-300">Selected Plan</span>
                                            <span className="font-semibold">{selectedPlanDetails.name} - {selectedPlanDetails.duration}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-300">Total Amount</span>
                                            <div className="text-2xl font-bold">{selectedPlanDetails.price}</div>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <p className="text-sm text-slate-400 mb-4">
                                            You will be redirected to Razorpay's secure payment gateway to complete your purchase.
                                        </p>
                                        <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                                            <Lock className="w-4 h-4" />
                                            <span>Secure & Encrypted Payment</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={processPayment}
                                        disabled={loading}
                                        className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center ${loading
                                            ? 'bg-slate-700 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg'
                                            }`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            `Pay ${selectedPlanDetails.price} & Upgrade`
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-slate-500 mt-4">
                                        By proceeding, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="border-t border-white/10 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                                SoulMate
                            </span>
                        </div>
                        <div className="text-sm text-slate-500">
                            © {new Date().getFullYear()} SoulMate Matrimony. All rights reserved.
                        </div>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                                Privacy
                            </a>
                            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                                Terms
                            </a>
                            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                                Contact
                            </a>
                        </div>
                    </div>
                </div>
            </footer>



        </div>
    );
};

export default PremiumFeaturesPage;





