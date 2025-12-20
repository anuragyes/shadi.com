

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Mic, MicOff, Phone, PhoneOff, PhoneForwarded,
    Volume2, VolumeX, Settings, MessageSquare,
    User, X, Send, Clock, Shield, Headphones,
    Maximize2, Minimize2, MoreVertical
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import socket from "./SocketService";
import toast from 'react-hot-toast';
const VoiceCallInterface = () => {
    const { callId, currentUserId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isInitializedRef = useRef(false);
    const isCleaningUpRef = useRef(false);
    const incomingOfferRef = useRef(null);
    const remoteAnalyserRef = useRef(null);
    const isOfferProcessedRef = useRef(false); // Track if offer is processed

    const [isIncoming, setIsIncoming] = useState(() => {
        const state = location.state || {};
        return state.callType === 'incoming' || false;
    });

    // Refs for DOM elements and WebRTC objects
    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const chatMessagesRef = useRef(null);
    const callTimerRef = useRef(null);
    const ringingTimeoutRef = useRef(null);
    const callTimeoutRef = useRef(null);

    // State for call controls and UI
    const [callState, setCallState] = useState(
        isIncoming ? 'incoming' : 'outgoing'
    );

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Call data and statistics
    const [callDuration, setCallDuration] = useState(0);
    const [callStartTime, setCallStartTime] = useState(null);
    const [ringingStartTime, setRingingStartTime] = useState(null);

    // Store incoming call data in state instead of just ref
    const [incomingCallData, setIncomingCallData] = useState(null);

    const [remoteUser, setRemoteUser] = useState({
        id: location.state?.remoteUserId || '',
        name: location.state?.remoteUserName || 'Friend',
        avatar: null,
        isSpeaking: false,
        muted: false,
        connectionStatus: 'connecting'
    });

    const [localUser] = useState({
        id: currentUserId,
        name: 'You',
        avatar: null
    });

    // Chat functionality
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    // Call statistics and metrics
    const [callStats, setCallStats] = useState({
        localAudioLevel: 0,
        remoteAudioLevel: 0,
        connectionQuality: 'excellent',
        jitter: 0,
        packetLoss: 0
    });

    // WebRTC configuration
    const configuration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
        ],
    };

    // ========== MAIN INITIALIZATION EFFECT ==========


    // Add near the top of the component
    // console.log("📍 VoiceCallInterface - Full location.state:", 
    //     location.state ? JSON.stringify(location.state, null, 2) : 'null'
    // );

    // Add this near the top of VoiceCallInterface component, after useState declarations
    useEffect(() => {
        console.log("📍 VoiceCall location.state:", location.state);
        console.log("📍 Has offer in state?", !!location.state?.offer);

        // If we have an offer in state, store it immediately
        if (location.state?.offer) {
            console.log("🎯 Got offer from navigation state");
            incomingOfferRef.current = location.state.offer;
            setIncomingCallData({ offer: location.state.offer });
        }
    }, [location.state]);


    useEffect(() => {
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        console.log("🚀 Initializing VoiceCallInterface", {
            currentUserId,
            callId,
            isIncoming,
            remoteUserId: remoteUser.id,
            locationState: location.state,
            hasOfferInState: !!location.state?.offer, // Add this
            incomingOfferRef: !!incomingOfferRef.current // Add this
        });

        // Validate parameters
        if (!currentUserId || !callId) {
            console.error("❌ Missing required parameters");
            navigate('/');
            return;
        }

        // If incoming call and we have offer in state, store it
        if (isIncoming && location.state?.offer) {
            console.log("📦 Loading offer from navigation state");
            incomingOfferRef.current = location.state.offer;
            setIncomingCallData({ offer: location.state.offer });
        }

        // Validate remote user for outgoing calls
        if (!isIncoming && !remoteUser.id) {
            console.error("❌ Missing remote user ID for outgoing call");
            navigate('/');
            return;
        }

        initializeCall();

        return () => {
            if (!isCleaningUpRef.current) {
                cleanup();
            }
        };
    }, []);
    // ========== SOCKET LISTENERS SETUP ==========
    useEffect(() => {
        if (!socket || !currentUserId) return;

        console.log("📡 Setting up socket listeners");

        // Incoming call handler
        const offIncomingCall = socket.onIncomingCall((data) => {
            console.log("📞 Incoming call received:", data);
            handleIncomingCall(data);
        });

        // Call accepted handler
        const offCallAccepted = socket.onCallAccepted((data) => {
            console.log("✅ Call accepted by remote:", data);
            handleCallAccepted(data);
        });

        // Call rejected handler
        const offCallRejected = socket.onCallRejected((data) => {
            console.log("❌ Call rejected:", data);
            handleCallRejected(data);
        });

        // Call ended by remote handler
        const offCallEnded = socket.onCallEnded((data) => {
            console.log("🔴 Call ended by remote:", data);
            handleCallEnded(data);
        });

        // User disconnected handler
        const offUserDisconnected = socket.onUserDisconnected((data) => {
            console.log("⚠️ Remote user disconnected:", data);
            endCall('remote-disconnected');
        });

        // WebRTC Offer handler - CRITICAL FIX
        const offOffer = socket.onOffer((data) => {
            console.log("📨 Received offer for call:", data.callId, "Current call:", callId);

            // Only handle if it's for this call
            if (data.callId !== callId) {
                console.log("⚠️ Offer for different call ID, ignoring");
                return;
            }

            console.log("🎯 Processing offer for current call");
            handleOffer(data);
        });

        // WebRTC Answer handler
        const offAnswer = socket.onAnswer((data) => {
            console.log("📨 Received answer:", data);
            handleAnswer(data);
        });

        // ICE Candidate handler
        const offIceCandidate = socket.onIceCandidate((data) => {
            console.log("🧊 Received ICE candidate:", data);
            handleIceCandidate(data);
        });

        // Remote mute status handler
        const offRemoteMuteStatus = socket.onRemoteMuteStatus((data) => {
            setRemoteUser(prev => ({ ...prev, muted: data.muted }));
        });

        // Remote speaking status handler
        const offRemoteSpeakingStatus = socket.onRemoteSpeakingStatus((data) => {
            setRemoteUser(prev => ({ ...prev, isSpeaking: data.isSpeaking }));
        });

        // Chat message handler
        const offChatMessage = socket.onChatMessage((message) => {
            setChatMessages(prev => [
                ...prev,
                {
                    ...message,
                    id: Date.now(),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);

            setTimeout(() => {
                if (chatMessagesRef.current) {
                    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
                }
            }, 100);
        });

        // Add connection error handler
        const offError = socket.onError((error) => {
            console.error("Socket error:", error);
            endCall('socket-error');
        });

        // Cleanup function
        return () => {
            offIncomingCall && offIncomingCall();
            offCallAccepted && offCallAccepted();
            offCallRejected && offCallRejected();
            offCallEnded && offCallEnded();
            offUserDisconnected && offUserDisconnected();
            offOffer && offOffer();
            offAnswer && offAnswer();
            offIceCandidate && offIceCandidate();
            offRemoteMuteStatus && offRemoteMuteStatus();
            offRemoteSpeakingStatus && offRemoteSpeakingStatus();
            offChatMessage && offChatMessage();
            offError && offError();
        };
    }, [callId, currentUserId]); // Added dependencies

    // ========== INITIALIZE CALL ==========
    const initializeCall = async () => {
        try {
            console.log("🔌 Connecting socket...");
            await socket.connect(currentUserId);

            // Wait a moment for socket to be fully connected
            await new Promise(resolve => setTimeout(resolve, 100));

            // For incoming calls, we've already set up the state
            if (isIncoming) {
                console.log("📞 Incoming call setup complete");
                playRingtone();
                startRingingTimeout();
            } else {
                console.log("📤 Initiating outgoing call to:", remoteUser.id);
                // Give a brief delay to ensure socket is ready
                setTimeout(() => {
                    initiateOutgoingCall();
                }, 500);
            }
        } catch (error) {
            console.error("❌ Failed to initialize call:", error);
            // alert("Connection failed. Please try again.");
               toast.error("Connection failed. Please try again.");
            navigate('/');
        }
    };

    // ========== HANDLE INCOMING CALL (FIXED) ==========
    const handleIncomingCall = useCallback((data) => {
        const { from, callId: incomingCallId, offer, callerName } = data;

        console.log("🎯 Handling incoming call from:", from, "Call ID:", incomingCallId);

        // Check if this is for our current call
        if (incomingCallId !== callId) {
            console.log("⚠️ Incoming call ID doesn't match, ignoring");
            return;
        }

        // Store the offer in both ref and state
        incomingOfferRef.current = offer;
        setIncomingCallData(data);
        isOfferProcessedRef.current = false;

        // Update remote user state
        setRemoteUser(prev => ({
            ...prev,
            id: from,
            name: callerName || from,
            connectionStatus: 'ringing'
        }));

        // Update call state
        setIsIncoming(true);
        setCallState('incoming');

        // Play ringtone and start timeout
        playRingtone();
        startRingingTimeout();
    }, [callId]);

    // ========== HANDLE WEBRTC OFFER (NEW FUNCTION) ==========
    const handleOffer = useCallback(async (data) => {
        const { from, callId: offerCallId, offer } = data;

        console.log("🎯 Handling WebRTC offer for call:", offerCallId);

        // Only handle if it's for this call
        if (offerCallId !== callId) {
            console.log("⚠️ Offer for different call ID, ignoring");
            return;
        }

        // Store the offer
        incomingOfferRef.current = offer;
        setIncomingCallData(data);
        isOfferProcessedRef.current = false;

        // If this is an incoming call, update remote user
        if (isIncoming && !remoteUser.id) {
            setRemoteUser(prev => ({
                ...prev,
                id: from,
                name: from, // You might want to get the name from your user data
                connectionStatus: 'ringing'
            }));
        }
    }, [callId, isIncoming, remoteUser.id]);

    // ========== ACCEPT INCOMING CALL (FIXED) ==========
    const acceptIncomingCall = async () => {
        try {
            console.log("✅ Accepting incoming call");
            console.log("🔍 Current offer status:", {
                inRef: !!incomingOfferRef.current,
                inState: !!incomingCallData?.offer,
                inLocationState: !!location.state?.offer
            });

            // If no offer found, try to get it from location state
            if (!incomingOfferRef.current && location.state?.offer) {
                console.log("🔄 Getting offer from location state");
                incomingOfferRef.current = location.state.offer;
                setIncomingCallData({ offer: location.state.offer });
            }

            // If still no offer, wait for it briefly
            if (!incomingOfferRef.current) {
                console.log("⏳ Waiting for offer to arrive...");

                // Wait up to 2 seconds for the offer
                await new Promise((resolve, reject) => {
                    let attempts = 0;
                    const checkOffer = () => {
                        attempts++;
                        if (incomingOfferRef.current) {
                            console.log("✅ Offer received after waiting");
                            resolve();
                        } else if (attempts > 20) { // 2 seconds
                            reject(new Error("Offer timeout - no offer received after 2 seconds"));
                        } else {
                            setTimeout(checkOffer, 100);
                        }
                    };
                    checkOffer();
                });
            }

            stopRingtone();
            stopRingingTimeout();
            setCallState("connecting");

            // Get local media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            setLocalStream(stream);
            if (localAudioRef.current) {
                localAudioRef.current.srcObject = stream;
            }

            setupAudioVisualization(stream);

            // Create peer connection
            const pc = await createPeerConnection();

            // Add local tracks
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Set remote description from stored offer
            if (incomingOfferRef.current) {
                console.log("🎯 Setting remote description with offer");
                await pc.setRemoteDescription(
                    new RTCSessionDescription(incomingOfferRef.current)
                );

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                console.log("📤 Sending answer to:", remoteUser.id);

                // Send answer
                socket.sendAnswer({
                    to: remoteUser.id,
                    callId,
                    answer: answer
                });

                // Send call accepted notification
                socket.sendCallAccepted({
                    callId,
                    from: currentUserId,
                    to: remoteUser.id,
                });

                // Mark as processed
                isOfferProcessedRef.current = true;
                incomingOfferRef.current = null;
                setIncomingCallData(null);

                console.log("✅ Incoming call accepted successfully");
            } else {
                throw new Error("No incoming offer found after validation");
            }

        } catch (error) {
            console.error("❌ Error accepting call:", error);

            // Show user-friendly error
            if (error.message.includes("Offer timeout")) {
                 toast.error("Call setup taking too long. The caller might have disconnected.");
                
            }

            endCall("error");
        }
    };
    // ========== HANDLE CALL ACCEPTED (FIXED) ==========
    const handleCallAccepted = useCallback((data) => {
        console.log("✅ Remote accepted our call:", data);

        if (data.callId !== callId) {
            console.log("⚠️ Call accepted for different call ID, ignoring");
            return;
        }

        // For outgoing calls, remote has accepted
        if (!isIncoming) {
            console.log("🎉 Our outgoing call was accepted!");
            stopRingingTimeout();
            // The connection will be established via WebRTC
        }
    }, [callId, isIncoming]);

    // ========== HANDLE CALL REJECTED ==========
    const handleCallRejected = useCallback((data) => {
        console.log("❌ Call was rejected:", data);
        if (data.callId === callId) {
            endCall('rejected');
        }
    }, [callId]);

    // ========== HANDLE CALL ENDED ==========
    const handleCallEnded = useCallback((data) => {
        console.log("🔴 Remote ended the call:", data);
        if (data.callId === callId) {
            endCall('remote-ended');
        }
    }, [callId]);

    // ========== HANDLE ANSWER ==========
    const handleAnswer = useCallback(async (data) => {
        const { from, callId: answerCallId, answer } = data;

        if (answerCallId !== callId) return;

        console.log("✅ Processing answer from:", from);

        if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== 'closed') {
            try {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                console.log("✅ Remote description set from answer");
            } catch (error) {
                console.error("❌ Error setting remote description from answer:", error);
            }
        }
    }, [callId]);

    // ========== HANDLE ICE CANDIDATE ==========
    const handleIceCandidate = useCallback(async (data) => {
        const { from, callId: candidateCallId, candidate } = data;

        if (candidateCallId !== callId) return;

        console.log("🧊 Adding ICE candidate from:", from);

        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("❌ Error adding ICE candidate:", error);
            }
        }
    }, [callId]);

    // ========== INITIATE OUTGOING CALL ==========
    // In VoiceCallInterface.jsx - initiateOutgoingCall function
    const initiateOutgoingCall = async () => {
        try {
            console.log("🚀 Starting outgoing call to:", remoteUser.id);

            // Get local media stream
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            setLocalStream(stream);
            if (localAudioRef.current) {
                localAudioRef.current.srcObject = stream;
            }

            setupAudioVisualization(stream);

            // Create peer connection
            const pc = await createPeerConnection();

            // Add local tracks
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // ✅ Create offer BEFORE sending call initiation
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });

            await pc.setLocalDescription(offer);

            console.log("📨 Created WebRTC offer");

            // ✅ Send call initiation WITH the offer
            const callData = {
                from: currentUserId,
                to: remoteUser.id,
                callId,
                callerName: localUser.name,
                offer: offer // ✅ Include the offer here!
            };

            console.log("📤 Sending call initiation WITH offer:", callData);
            socket.initiateCall(callData);

            setCallState('outgoing');
            startRingingTimeout();

            // No need for separate socket.sendOffer() anymore!

        } catch (error) {
            console.error("❌ Error initiating call:", error);
            endCall('error');
        }
    };

    // ========== CREATE PEER CONNECTION ==========
    const createPeerConnection = async () => {
        try {
            console.log("🔗 Creating peer connection");
            const pc = new RTCPeerConnection(configuration);
            peerConnectionRef.current = pc;

            // Handle remote tracks
            pc.ontrack = (event) => {
                console.log("🎵 Received remote track");
                const remoteStream = event.streams[0];
                setRemoteStream(remoteStream);

                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = remoteStream;
                }

                setupRemoteAudioAnalysis(remoteStream);
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && remoteUser.id) {
                    socket.sendIceCandidate({
                        to: remoteUser.id,
                        callId,
                        candidate: event.candidate
                    });
                }
            };

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                console.log("🔄 Peer connection state:", pc.connectionState);

                switch (pc.connectionState) {
                    case 'connected':
                        setCallState('active');
                        setCallStartTime(Date.now());
                        startCallTimer();
                        stopRingingTimeout();
                        stopRingtone();
                        break;
                    case 'disconnected':
                    case 'failed':
                    case 'closed':
                        endCall('connection-lost');
                        break;
                }
            };

            // Handle ICE connection state
            pc.oniceconnectionstatechange = () => {
                console.log("🧊 ICE connection state:", pc.iceConnectionState);
            };

            return pc;
        } catch (error) {
            console.error("❌ Error creating peer connection:", error);
            throw error;
        }
    };

    // ========== REJECT INCOMING CALL ==========
    const rejectIncomingCall = () => {
        console.log("❌ Rejecting incoming call");

        stopRingtone();
        stopRingingTimeout();

        socket.sendCallRejected({
            callId,
            from: currentUserId,
            to: remoteUser.id,
            reason: 'rejected'
        });

        endCall('rejected');
        navigate("/")
    };

    // ========== END CALL ==========
    const endCall = useCallback((reason = 'local-ended') => {




        // if (isCleaningUpRef.current) return;

        console.log(`🔴 Ending call - Reason: ${reason}`);

        // Update UI state first
        setCallState('ended');

        // Clear all timeouts
        stopRingingTimeout();
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Stop media streams
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            setLocalStream(null);
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            setRemoteStream(null);
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Close audio contexts
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Stop ringtone
        stopRingtone();

        // Send end call notification if initiated locally
        if (reason === 'local-ended' || reason === 'cancelled' || reason === 'rejected') {
            if (remoteUser.id) {
                socket.endCall({
                    from: currentUserId,
                    to: remoteUser.id,
                    callId,
                    reason
                });
            }
        }

        // Cleanup socket listeners
        socket.removeAllListeners();

        // Navigate back after delay
        setTimeout(() => {
            navigate('/');
        }, 2000);

        isCleaningUpRef.current = true;
    }, [localStream, remoteStream, currentUserId, remoteUser.id, callId, navigate]);

    // ========== START RINGING TIMEOUT ==========
    const startRingingTimeout = () => {
        setRingingStartTime(Date.now());

        if (ringingTimeoutRef.current) {
            clearTimeout(ringingTimeoutRef.current);
        }

        ringingTimeoutRef.current = setTimeout(() => {
            if (callState === 'incoming' || callState === 'outgoing') {
                console.log("⏰ 30-second timeout reached - auto ending call");

                // Notify remote user about timeout
                if (remoteUser.id) {
                    socket.endCall({
                        from: currentUserId,
                        to: remoteUser.id,
                        callId,
                        reason: 'timeout'
                    });
                }

                endCall('timeout');
            }
        }, 150000); // 30 seconds timeout
    };

    // ========== STOP RINGING TIMEOUT ==========
    const stopRingingTimeout = () => {
        if (ringingTimeoutRef.current) {
            clearTimeout(ringingTimeoutRef.current);
            ringingTimeoutRef.current = null;
        }
    };

    // ========== START CALL TIMER ==========
    const startCallTimer = () => {
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
        }

        setCallDuration(0);
        callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    // ========== CLEANUP FUNCTION ==========
    const cleanup = useCallback(() => {
        if (isCleaningUpRef.current) return;
        isCleaningUpRef.current = true;

        console.log("🧹 Cleaning up voice call");

        // Clear timeouts
        stopRingingTimeout();

        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Stop media streams
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Stop ringtone
        stopRingtone();

        // Remove socket listeners
        socket.removeAllListeners();
    }, [localStream, remoteStream]);

    // ========== HELPER FUNCTIONS ==========
    const stopRingtone = () => {
        if (window.ringtone) {
            window.ringtone.pause();
            window.ringtone.currentTime = 0;
            window.ringtone = null;
        }
    };

    const playRingtone = () => {
        stopRingtone();
        try {
            const ringtone = new Audio('/ringtone.mp3');
            ringtone.loop = true;
            ringtone.volume = 0.5;
            ringtone.play().catch(e => console.warn("Could not play ringtone:", e));
            window.ringtone = ringtone;
        } catch (error) {
            console.warn("Ringtone error:", error);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getConnectionColor = () => {
        switch (callStats.connectionQuality) {
            case 'excellent': return 'text-green-500';
            case 'good': return 'text-green-400';
            case 'fair': return 'text-yellow-500';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const calculateRingingTimeLeft = () => {
        if (!ringingStartTime) return 30;
        const elapsed = Math.floor((Date.now() - ringingStartTime) / 1000);
        return Math.max(0, 30 - elapsed);
    };

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                const newMutedState = !audioTrack.enabled;
                audioTrack.enabled = newMutedState;
                setIsMuted(!newMutedState);

                if (remoteUser.id) {
                    socket.sendMuteStatus({
                        to: remoteUser.id,
                        callId,
                        muted: !newMutedState
                    });
                }
            }
        }
    };

    const toggleSpeaker = () => {
        setIsSpeakerOn(!isSpeakerOn);
        if (remoteAudioRef.current) {
            remoteAudioRef.current.muted = !isSpeakerOn;
        }
    };

    const setupAudioVisualization = (stream) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            source.connect(analyser);
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            updateAudioLevel();
        } catch (error) {
            console.error('Audio visualization error:', error);
        }
    };

    const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        if (!remoteUser.id) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }

        const average = sum / dataArray.length;

        setCallStats(prev => ({
            ...prev,
            localAudioLevel: Math.min(average, 100),
        }));

        const isSpeaking = average > 10 && !isMuted;

        socket.sendSpeakingStatus({
            to: remoteUser.id,
            callId,
            isSpeaking,
        });

        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    const setupRemoteAudioAnalysis = (stream) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            source.connect(analyser);
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;

            remoteAnalyserRef.current = analyser;

            const updateRemoteAudio = () => {
                if (!remoteAnalyserRef.current) return;

                const dataArray = new Uint8Array(remoteAnalyserRef.current.frequencyBinCount);
                remoteAnalyserRef.current.getByteFrequencyData(dataArray);

                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;

                setCallStats(prev => ({
                    ...prev,
                    remoteAudioLevel: Math.min(average, 100)
                }));

                const isSpeaking = average > 10;
                setRemoteUser(prev => ({
                    ...prev,
                    isSpeaking
                }));

                animationFrameRef.current = requestAnimationFrame(updateRemoteAudio);
            };

            updateRemoteAudio();
        } catch (error) {
            console.error('Remote audio analysis error:', error);
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !remoteUser.id) return;

        const messageData = {
            to: remoteUser.id,
            callId,
            text: newMessage,
            sender: currentUserId
        };

        socket.sendChatMessage(messageData);

        // Add to local messages
        setChatMessages(prev => [
            ...prev,
            {
                ...messageData,
                id: Date.now(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);

        setNewMessage('');

        // Scroll to bottom
        setTimeout(() => {
            if (chatMessagesRef.current) {
                chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
            }
        }, 100);
    };

    // ========== RENDER FUNCTION ==========
    const renderCallInterface = () => {
        switch (callState) {
            case 'incoming':
                return (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                <User size={48} />
                            </div>
                            <div className="absolute -top-2 -right-2 animate-ping w-8 h-8 bg-red-500 rounded-full"></div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Incoming Call</h2>
                        <p className="text-xl text-purple-300 mb-6">{remoteUser.name}</p>
                        <p className="text-gray-400 mb-8">Ringing...</p>

                        <div className="flex gap-6">
                            <button
                                onClick={rejectIncomingCall}
                                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-transform hover:scale-105"
                            >
                                <PhoneOff size={24} />
                            </button>
                            <button
                                onClick={acceptIncomingCall}
                                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-transform hover:scale-105"
                            >
                                <Phone size={24} />
                            </button>


                        </div>

                        <div className="mt-8 text-sm text-gray-400">
                            Auto-reject in {calculateRingingTimeLeft()}s
                        </div>
                    </div>
                );

            case 'outgoing':
                return (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <User size={48} />
                            </div>
                            <div className="absolute -top-2 -right-2 animate-pulse w-8 h-8 bg-green-500 rounded-full"></div>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Calling...</h2>
                        <p className="text-xl text-purple-300 mb-6">{remoteUser.name}</p>
                        <div className="animate-pulse text-gray-400 mb-8">Waiting for answer</div>

                        <button
                            onClick={() => endCall('cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            <PhoneOff size={20} />
                            Cancel Call
                        </button>

                        <div className="mt-8 text-sm text-gray-400">
                            Auto-cancel in {calculateRingingTimeLeft()}s
                        </div>
                    </div>
                );

            case 'connecting':
                return (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-purple-500 mb-8"></div>
                        <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
                        <p className="text-purple-300">Establishing secure connection</p>
                    </div>
                );

            case 'active':
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        {/* Audio visualizers */}
                        <div className="flex justify-center space-x-4 mb-8">
                            <div className="flex flex-col items-center">
                                <div className="text-sm mb-2">You</div>
                                <div className="h-4 w-48 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-100"
                                        style={{ width: `${callStats.localAudioLevel}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-sm mb-2">{remoteUser.name}</div>
                                <div className="h-4 w-48 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-100"
                                        style={{ width: `${callStats.remoteAudioLevel}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* User info */}
                        <div className="text-center mb-8">
                            <div className="text-3xl font-bold mb-2">{remoteUser.name}</div>
                            <div className="text-xl text-purple-300">{formatDuration(callDuration)}</div>
                            <div className={`text-sm mt-2 ${getConnectionColor()}`}>
                                {callStats.connectionQuality.toUpperCase()}
                            </div>
                        </div>

                        {/* Call controls */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={toggleMute}
                                className={`p-4 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600 transition`}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button
                                onClick={toggleSpeaker}
                                className={`p-4 rounded-full ${!isSpeakerOn ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600 transition`}
                            >
                                {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                            </button>
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                            >
                                <MessageSquare size={24} />
                            </button>
                        </div>

                        {/* End call button */}
                        <button
                            onClick={() => endCall('local-ended')}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            <PhoneOff size={20} />
                            End Call
                        </button>
                    </div>
                );

            case 'ended':
                return (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-8">
                            <PhoneOff size={48} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
                        <p className="text-gray-400">Returning to home screen...</p>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                        <p>Initializing call...</p>
                    </div>
                );
        }
    };

    // ========== MAIN RENDER ==========
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => endCall('cancelled')}
                            className="p-2 hover:bg-white/10 rounded-full transition"
                        >
                            <X size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Voice Call</h1>
                            <p className="text-sm text-gray-400">Secure Connection</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm hidden md:block">
                            Call ID: <span className="font-mono">{callId?.substring(0, 8)}...</span>
                        </div>
                        <Shield size={20} className="text-green-500" />
                    </div>
                </header>

                {/* Main content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className={`flex-1 ${showChat && callState === 'active' ? 'lg:w-2/3' : 'w-full'}`}>
                        <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8 min-h-[500px]">
                            {renderCallInterface()}
                        </div>
                    </div>

                    {/* Chat sidebar */}
                    {showChat && callState === 'active' && (
                        <div className="lg:w-1/3">
                            <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-4 h-[500px] flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold">Chat</h3>
                                    <button
                                        onClick={() => setShowChat(false)}
                                        className="p-1 hover:bg-white/10 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div
                                    ref={chatMessagesRef}
                                    className="flex-1 overflow-y-auto mb-4 space-y-3"
                                >
                                    {chatMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-3 rounded-lg ${msg.sender === currentUserId ? 'bg-purple-900/50 ml-auto' : 'bg-gray-800/50 mr-auto'} max-w-[80%]`}
                                        >
                                            <div className="text-sm font-semibold">
                                                {msg.sender === currentUserId ? 'You' : remoteUser.name}
                                            </div>
                                            <div>{msg.text}</div>
                                            <div className="text-xs text-gray-400 mt-1">{msg.time}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-sm resize-none"
                                        rows={2}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="bg-purple-600 hover:bg-purple-700 px-4 rounded-lg flex items-center justify-center"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden audio elements */}
                <audio ref={localAudioRef} muted />
                <audio ref={remoteAudioRef} autoPlay />
            </div>
        </div>
    );
};

export default VoiceCallInterface;