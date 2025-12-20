

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socket from './SocketService';
import toast from 'react-hot-toast';
const IncomingCallNotification = ({ callData, currentUserId, onAccept, onReject }) => {


    const navigate = useNavigate();
    const [timer, setTimer] = useState(30);
    const [callerInfo, setCallerInfo] = useState(null);
    const ringtoneRef = useRef(null);
    const timerRef = useRef(null);
    const hasResponded = useRef(false);

    useEffect(() => {
        console.log("🔔 IncomingCallNotification MOUNTED");
        console.log("📥 callData:", callData);
        console.log("👤 currentUserId:", currentUserId);

        return () => {
            console.log("🔕 IncomingCallNotification UNMOUNTED");
        };
    }, []);


    // Add at the top of the component
    console.log("🔔 IncomingCallNotification - Full callData:", JSON.stringify(callData, null, 2));

    // In the useEffect that processes callData:
    console.log("📨 Does callData have offer?", !!callData?.offer);
    console.log("📨 Offer type:", typeof callData?.offer);
    console.log("📨 Offer sdp length:", callData?.offer?.sdp?.length);

    // Fetch caller info and setup call
    useEffect(() => {
        if (!callData || !currentUserId) return;

        console.log("🚀 Initializing incoming call notification");

        // Extract call data
        const { from, callId, callerName } = callData;

        // Set caller info
        setCallerInfo({
            id: from,
            name: callerName || `User ${from.substring(0, 8)}...`,
            callId: callId
        });

        // Start countdown
        startCountdown();

        // Play ringtone
        playRingtone();

        // Setup socket listeners for this call
        const cleanup = setupSocketListeners();

        return () => {
            cleanup();
            if (!hasResponded.current) {
                console.log("🧹 Cleaning up incoming call notification");
                stopRingtone();
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callData, currentUserId]);

    // Setup socket listeners
    const setupSocketListeners = () => {
        // Listen for call cancellation from caller
        const cleanup1 = socket.onCallEnded((data) => {
            console.log("📞 Call ended by caller:", data);
            if (data.callId === callData.callId) {
                handleCallEnded('cancelled');
            }
        });

        // Listen for errors
        const cleanup2 = socket.onError((error) => {
            console.error("Socket error in incoming call:", error);
            handleCallEnded('error');
        });

        return () => {
            cleanup1?.();
            cleanup2?.();
        };
    };

    // Start countdown timer
    const startCountdown = () => {
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Handle timeout (auto-reject)
    const handleTimeout = () => {
        if (hasResponded.current) return;
        hasResponded.current = true;

        console.log("⏰ Call timeout, auto-rejecting");

        // Use the parent's reject function if available
        if (onReject) {
            onReject();
        } else {
            // Fallback: send rejection ourselves
            if (callData?.from) {
                socket.rejectCall({
                    callId: callData.callId,
                    from: currentUserId,
                    to: callData.from,
                    reason: 'timeout'
                });
            }
        }

        navigate('/');
    };

    // Play ringtone
    const playRingtone = () => {
        try {
            stopRingtone();

            const audio = new Audio('/ringtone.mp3');
            audio.loop = true;
            audio.volume = 0.7;

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Could not play ringtone automatically:', error);
                });
            }

            ringtoneRef.current = audio;
        } catch (error) {
            console.log('Ringtone error:', error);
        }
    };

    // Stop ringtone
    const stopRingtone = () => {
        if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
            ringtoneRef.current = null;
        }
    };

    // Handle call acceptance
    // In the handleAccept function, update the navigation:
    const handleAccept = async () => {
        if (hasResponded.current) return;
        hasResponded.current = true;

        console.log("✅ Accepting call from:", callData.from);
        console.log("📨 Call data contains offer?", !!callData.offer); // Add this

        stopRingtone();
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            // Use the parent's accept function if available
            if (onAccept) {
                onAccept();
            } else {
                // Fallback: send acceptance ourselves
                await socket.acceptCall({
                    callId: callData.callId,
                    from: currentUserId,
                    to: callData.from
                });
            }

            console.log("📞 Navigating to call interface with offer:", callData.offer);

            // CRITICAL: Pass the offer in navigation state
            navigate(`/VoiceCall/${callData.callId}/${currentUserId}`, {
                state: {
                    callType: 'incoming',
                    remoteUserId: callData.from,
                    remoteUserName: callerInfo?.name || 'Caller',
                    offer: callData.offer // <<< ADD THIS LINE
                }
            });

        } catch (error) {
            console.error("❌ Error accepting call:", error);
            toast.error("Failed to accept call. Please try again.");
            navigate('/');
        }
    };
    // Handle call rejection
    const handleReject = () => {
        if (hasResponded.current) return;
        hasResponded.current = true;

        console.log("❌ Rejecting call from:", callData.from);

        stopRingtone();
        if (timerRef.current) clearInterval(timerRef.current);

        // Use the parent's reject function if available
        if (onReject) {
            onReject();
        } else {
            // Fallback: send rejection ourselves
            if (callData?.from) {
                socket.rejectCall({
                    callId: callData.callId,
                    from: currentUserId,
                    to: callData.from,
                    reason: 'rejected'
                });
            }
        }

        navigate('/');
    };

    // Handle call ended by caller
    const handleCallEnded = (reason) => {
        if (hasResponded.current) return;
        hasResponded.current = true;

        console.log(`📞 Call ended by remote: ${reason}`);

        stopRingtone();
        if (timerRef.current) clearInterval(timerRef.current);

        if (reason === 'cancelled') {
            toast.success("Call was cancelled by the caller.");
        }

        navigate('/');
    };

    // Don't render if no call data
    if (!callData || !callerInfo) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleReject}
            ></div>

            {/* Notification Card */}
            <div className="relative z-10 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-3xl shadow-2xl p-6 w-full max-w-md border border-purple-500/20">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping rounded-full bg-purple-500 opacity-30"></div>
                            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <Phone className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Incoming Call</h2>
                            <p className="text-sm text-gray-400">Voice Call</p>
                        </div>
                    </div>
                    <button
                        onClick={handleReject}
                        className="p-2 hover:bg-white/10 rounded-full transition"
                        aria-label="Close"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Caller Info */}
                <div className="text-center mb-6">
                    <div className="mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 border-4 border-white/10">
                            <User size={40} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{callerInfo.name}</h3>
                        <p className="text-gray-400 text-sm">is calling you...</p>
                    </div>

                    {/* Timer */}
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-black/40 rounded-full">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-yellow-300 font-medium">
                                Auto declines in: {timer}s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Call ID */}
                <div className="bg-black/40 rounded-xl p-3 mb-6">
                    <p className="text-gray-400 text-xs mb-1">Call ID:</p>
                    <p className="font-mono text-sm truncate select-all bg-black/30 p-2 rounded">
                        {callerInfo.callId}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={handleReject}
                        className="flex-1 flex flex-col items-center p-4 rounded-2xl bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mb-2">
                            <PhoneOff className="h-7 w-7 text-white" />
                        </div>
                        <span className="font-semibold">Decline</span>
                    </button>

                    <button
                        onClick={handleAccept}
                        className="flex-1 flex flex-col items-center p-4 rounded-2xl bg-green-900/30 hover:bg-green-900/50 border border-green-700/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 animate-pulse"
                    >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center mb-2">
                            <Phone className="h-7 w-7 text-white" />
                        </div>
                        <span className="font-semibold">Answer</span>
                    </button>
                </div>

                {/* Connection Status */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-400">Connected to server</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallNotification;