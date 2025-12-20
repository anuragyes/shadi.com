
import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Phone, Users,
  Maximize2, Minimize2, Settings, MessageSquare,
  ScreenShare, MonitorOff, MoreVertical, Send
} from 'lucide-react';
import { useParams } from "react-router-dom";

const VideoCallInterface = () => {
  const { callId } = useParams();
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const screenShareRef = useRef(null);
  const chatInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // State for call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeView, setActiveView] = useState('grid');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // Dynamic states
  const [participants, setParticipants] = useState([
    { id: 'local', name: 'You', isSpeaking: false, videoOn: true, muted: false, stream: null }
  ]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime] = useState(Date.now());
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [showSettings, setShowSettings] = useState(false);

  // Format call duration
  useEffect(() => {
    const timer = setInterval(() => {
      const duration = Math.floor((Date.now() - callStartTime) / 1000);
      setCallDuration(duration);
    }, 1000);

    return () => clearInterval(timer);
  }, [callStartTime]);

  // Initialize WebRTC
  useEffect(() => {
    const initWebRTC = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Update local participant
        setParticipants(prev => prev.map(p => 
          p.id === 'local' 
            ? { ...p, videoOn: true, stream: stream }
            : p
        ));

        // Create peer connection (simplified - integrate with your actual socket)
        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          const remoteStream = event.streams[0];
          setRemoteStream(remoteStream);
          
          // Add remote participant
          const remoteParticipant = {
            id: 'remote-' + Date.now(),
            name: 'Remote User',
            isSpeaking: false,
            videoOn: true,
            muted: false,
            stream: remoteStream
          };
          
          setParticipants(prev => {
            const exists = prev.some(p => p.id.startsWith('remote-'));
            if (!exists) {
              return [...prev, remoteParticipant];
            }
            return prev.map(p => 
              p.id.startsWith('remote-') 
                ? { ...p, stream: remoteStream, videoOn: true }
                : p
            );
          });
        };

        // Simulate connection established
        setTimeout(() => {
          setConnectionStatus('Connected');
          // Simulate receiving a remote participant
          setParticipants(prev => [
            ...prev,
            {
              id: 'remote-1',
              name: 'Alex Johnson',
              isSpeaking: true,
              videoOn: true,
              muted: false,
              stream: null
            }
          ]);
        }, 2000);

      } catch (error) {
        console.error('Error accessing media devices:', error);
        setConnectionStatus('Failed to connect');
      }
    };

    initWebRTC();

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Control functions with WebRTC integration
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Update participant state
        setParticipants(prev => prev.map(p => 
          p.id === 'local' ? { ...p, muted: !audioTrack.enabled } : p
        ));
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        
        // Update participant state
        setParticipants(prev => prev.map(p => 
          p.id === 'local' ? { ...p, videoOn: videoTrack.enabled } : p
        ));
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setScreenStream(screenStream);
        setIsScreenSharing(true);
        
        // Add screen share track to peer connection
        if (peerConnectionRef.current) {
          screenStream.getTracks().forEach(track => {
            peerConnectionRef.current.addTrack(track, screenStream);
          });
        }

        // Handle screen track ended
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };

      } else {
        // Stop screen sharing
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
          setScreenStream(null);
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleParticipants = () => setShowParticipants(!showParticipants);
  const toggleChat = () => setShowChat(!showChat);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const endCall = () => {
    // Cleanup all streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      // Handle remote stream cleanup
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Navigate away or show call ended screen
    window.location.href = '/';
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle key press for chat
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle speaking state for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(participant => {
        if (participant.id !== 'local') {
          // Randomly toggle speaking state for demo
          if (Math.random() > 0.7) {
            return { ...participant, isSpeaking: !participant.isSpeaking };
          }
        }
        return participant;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Get filtered participants for display
  const displayParticipants = participants.filter(p => 
    activeView === 'speaker' 
      ? p.isSpeaking || p.id === 'local'
      : true
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Call ID: {callId}</h1>
            <p className="text-purple-300">
              {participants.length} participant{participants.length !== 1 ? 's' : ''} • {formatDuration(callDuration)}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-black/30 rounded-full px-4 py-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                connectionStatus === 'Connected' ? 'bg-green-500' : 
                connectionStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm">{connectionStatus}</span>
            </div>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition"
            >
              <Settings size={20} />
            </button>
            
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute right-4 top-20 z-50 bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-80 border border-purple-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Camera</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2">
                  <option>Default Camera</option>
                  <option>Front Camera</option>
                  <option>Back Camera</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Microphone</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2">
                  <option>Default Microphone</option>
                  <option>External Microphone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Speaker</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2">
                  <option>Default Speaker</option>
                  <option>Headphones</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main video area */}
          <div className={`flex-1 ${showParticipants || showChat ? 'lg:w-2/3' : 'w-full'}`}>
            {/* View mode selector */}
            <div className="flex justify-center mb-4 space-x-2">
              {['grid', 'speaker', 'side-by-side'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeView === view 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-black/30 text-gray-300 hover:bg-black/50'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>

            {/* Video grid */}
            <div className={`bg-black/20 rounded-2xl overflow-hidden border border-white/10 ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
            }`}>
              <div className={`p-4 h-[500px] md:h-[600px] ${
                activeView === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : activeView === 'speaker'
                  ? 'flex justify-center items-center'
                  : 'grid grid-cols-2 gap-4'
              }`}>
                {/* Local video */}
                <div className={`relative rounded-xl overflow-hidden border-2 ${
                  participants.find(p => p.id === 'local')?.isSpeaking
                    ? 'border-purple-500 shadow-lg shadow-purple-500/30' 
                    : 'border-transparent'
                } ${
                  activeView === 'speaker' && participants.find(p => p.id === 'local')?.isSpeaking
                    ? 'w-full h-full'
                    : 'h-48 md:h-56'
                } ${activeView === 'side-by-side' ? 'h-64' : ''}`}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                  />
                  
                  {isVideoOff && (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-purple-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold">
                            {participants.find(p => p.id === 'local')?.name?.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <p className="font-medium">You</p>
                        {isMuted && (
                          <div className="absolute bottom-3 right-3 bg-red-500 rounded-full p-1">
                            <MicOff size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">
                        You {isMuted && '(Muted)'}
                      </span>
                      <div className="flex space-x-1">
                        {isMuted && <MicOff size={16} />}
                        {isVideoOff && <VideoOff size={16} />}
                      </div>
                    </div>
                  </div>

                  {participants.find(p => p.id === 'local')?.isSpeaking && (
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs">Speaking</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remote participants */}
                {participants
                  .filter(p => p.id !== 'local')
                  .map((participant) => (
                    <div 
                      key={participant.id}
                      className={`relative rounded-xl overflow-hidden border-2 ${
                        participant.isSpeaking 
                          ? 'border-purple-500 shadow-lg shadow-purple-500/30' 
                          : 'border-transparent'
                      } ${
                        activeView === 'speaker' && participant.isSpeaking
                          ? 'w-full h-full'
                          : 'h-48 md:h-56'
                      } ${activeView === 'side-by-side' ? 'h-64' : ''}`}
                    >
                      {participant.stream ? (
                        <video
                          ref={remoteVideoRef}
                          autoPlay
                          className="w-full h-full object-cover"
                        />
                      ) : participant.videoOn ? (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-purple-900 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-700 to-pink-600 flex items-center justify-center mx-auto mb-3">
                              <span className="text-2xl font-bold">
                                {participant.name?.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <p className="font-medium">{participant.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-purple-900 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-3">
                              <span className="text-2xl font-bold">
                                {participant.name?.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <p className="font-medium">{participant.name}</p>
                            {participant.muted && (
                              <div className="absolute bottom-3 right-3 bg-red-500 rounded-full p-1">
                                <MicOff size={14} />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">
                            {participant.name}
                          </span>
                          <div className="flex space-x-1">
                            {participant.muted && <MicOff size={16} />}
                            {!participant.videoOn && <VideoOff size={16} />}
                          </div>
                        </div>
                      </div>

                      {participant.isSpeaking && (
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs">Speaking</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Screen sharing overlay */}
              {isScreenSharing && (
                <div className="absolute top-4 right-4 bg-black/70 rounded-xl p-4 w-64 border border-purple-500/50 z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Screen Sharing</span>
                    <MonitorOff size={16} />
                  </div>
                  <div className="bg-gradient-to-r from-slate-800 to-purple-900 h-32 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ScreenShare size={24} className="mx-auto mb-2" />
                      <p className="text-xs">You are sharing your screen</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Call controls */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-4 md:space-x-6 bg-black/30 backdrop-blur-lg rounded-2xl px-6 py-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition ${
                    isVideoOff 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>

                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-full transition ${
                    isScreenSharing 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {isScreenSharing ? <MonitorOff size={22} /> : <ScreenShare size={22} />}
                </button>

                <button
                  onClick={toggleParticipants}
                  className={`p-3 rounded-full transition ${
                    showParticipants 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <Users size={22} />
                </button>

                <button
                  onClick={toggleChat}
                  className={`p-3 rounded-full transition ${
                    showChat 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <MessageSquare size={22} />
                </button>

                <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                  <MoreVertical size={22} />
                </button>

                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition transform hover:scale-105"
                >
                  <Phone size={22} className="rotate-135" />
                </button>
              </div>
            </div>
          </div>

          {/* Side panels */}
          {(showParticipants || showChat) && (
            <div className="lg:w-1/3 flex flex-col space-y-6">
              {/* Participants panel */}
              {showParticipants && (
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold">Participants ({participants.length})</h2>
                    <button 
                      onClick={toggleParticipants}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {participants.map((participant) => (
                      <div 
                        key={participant.id} 
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            participant.videoOn && participant.id !== 'local'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                              : 'bg-gradient-to-r from-slate-700 to-slate-900'
                          }`}>
                            <span className="font-medium">
                              {participant.name?.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {participant.name} {participant.id === 'local' && '(You)'}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              {participant.isSpeaking && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span>Speaking</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {participant.muted ? (
                            <MicOff size={18} className="text-red-400" />
                          ) : (
                            <Mic size={18} className="text-green-400" />
                          )}
                          
                          {participant.videoOn ? (
                            <Video size={18} className="text-green-400" />
                          ) : (
                            <VideoOff size={18} className="text-red-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 transition font-medium">
                    Invite people
                  </button>
                </div>
              )}

              {/* Chat panel */}
              {showChat && (
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-5 border border-white/10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold">Chat</h2>
                    <button 
                      onClick={toggleChat}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 mb-5 max-h-64">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-3 rounded-xl ${
                          message.sender === 'You' 
                            ? 'bg-gradient-to-r from-purple-900/50 to-purple-800/30 ml-6' 
                            : 'bg-white/5 mr-6'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-medium ${
                            message.sender === 'You' ? 'text-purple-300' : 'text-white'
                          }`}>
                            {message.sender}
                          </span>
                          <span className="text-xs text-gray-400">{message.time}</span>
                        </div>
                        <p className="text-gray-200">{message.text}</p>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex space-x-2">
                      <input 
                        ref={chatInputRef}
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..." 
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button 
                        onClick={sendMessage}
                        className="px-5 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 transition font-medium flex items-center"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom info bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'Connected' ? 'bg-green-500' : 
                connectionStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span>{connectionStatus}</span>
            </div>
            <div>Resolution: {isVideoOff ? 'Video off' : '720p'}</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="hover:text-white transition">Record meeting</button>
            <button className="hover:text-white transition">Live captions</button>
            <button className="hover:text-white transition">Reactions</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallInterface;

















































































































































































// import React, { useState } from 'react';
// import {
//   Mic, MicOff, Video, VideoOff, Phone, Users,
//   Maximize2, Minimize2, Settings, MessageSquare,
//   ScreenShare, MonitorOff, MoreVertical
// } from 'lucide-react';

// const VideoCallInterface = () => {
//   // State for call controls
//   const [isMuted, setIsMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [showChat, setShowChat] = useState(false);
//   const [activeView, setActiveView] = useState('grid'); // 'grid', 'speaker', 'side-by-side'

//   // Mock participants data
//   const participants = [
//     { id: 1, name: 'You', isSpeaking: true, videoOn: true, muted: false },
//     { id: 2, name: 'Alex Johnson', isSpeaking: true, videoOn: true, muted: false },
//     { id: 3, name: 'Sam Rivera', isSpeaking: false, videoOn: true, muted: true },
//     { id: 4, name: 'Taylor Chen', isSpeaking: false, videoOn: false, muted: false },
//     { id: 5, name: 'Jordan Lee', isSpeaking: false, videoOn: true, muted: false },
//     { id: 6, name: 'Casey Smith', isSpeaking: false, videoOn: true, muted: true },
//   ];

//   // Mock chat messages
//   const chatMessages = [
//     { id: 1, sender: 'Alex Johnson', text: 'Can everyone hear me okay?', time: '10:05 AM' },
//     { id: 2, sender: 'Sam Rivera', text: 'Yes, loud and clear!', time: '10:06 AM' },
//     { id: 3, sender: 'You', text: 'I can hear everyone perfectly.', time: '10:07 AM' },
//     { id: 4, sender: 'Taylor Chen', text: 'The presentation looks great so far.', time: '10:08 AM' },
//   ];

//   // Control functions
//   const toggleMute = () => setIsMuted(!isMuted);
//   const toggleVideo = () => setIsVideoOff(!isVideoOff);
//   const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
//   const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
//   const toggleParticipants = () => setShowParticipants(!showParticipants);
//   const toggleChat = () => setShowChat(!showChat);
//   const endCall = () => {
//     alert('Call ended');
//     // In a real app, this would disconnect from the call
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <header className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold">Team Meeting</h1>
//             <p className="text-purple-300">6 participants • 45:22 duration</p>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <div className="hidden md:flex items-center space-x-2 bg-black/30 rounded-full px-4 py-2">
//               <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//               <span className="text-sm">Live</span>
//             </div>
            
//             <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition">
//               <Settings size={20} />
//             </button>
            
//             <button 
//               onClick={toggleFullscreen}
//               className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition"
//             >
//               {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
//             </button>
//           </div>
//         </header>

//         <div className="flex flex-col lg:flex-row gap-6">
//           {/* Main video area */}
//           <div className={`flex-1 ${showParticipants || showChat ? 'lg:w-2/3' : 'w-full'}`}>
//             {/* View mode selector */}
//             <div className="flex justify-center mb-4 space-x-2">
//               {['grid', 'speaker', 'side-by-side'].map((view) => (
//                 <button
//                   key={view}
//                   onClick={() => setActiveView(view)}
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition ${
//                     activeView === view 
//                       ? 'bg-purple-600 text-white' 
//                       : 'bg-black/30 text-gray-300 hover:bg-black/50'
//                   }`}
//                 >
//                   {view.charAt(0).toUpperCase() + view.slice(1)}
//                 </button>
//               ))}
//             </div>

//             {/* Video grid */}
//             <div className={`bg-black/20 rounded-2xl overflow-hidden border border-white/10 ${
//               isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
//             }`}>
//               <div className={`p-4 h-[500px] md:h-[600px] ${
//                 activeView === 'grid' 
//                   ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
//                   : activeView === 'speaker'
//                   ? 'flex justify-center items-center'
//                   : 'grid grid-cols-2 gap-4'
//               }`}>
//                 {participants.map((participant) => (
//                   <div 
//                     key={participant.id}
//                     className={`relative rounded-xl overflow-hidden border-2 ${
//                       participant.isSpeaking 
//                         ? 'border-purple-500 shadow-lg shadow-purple-500/30' 
//                         : 'border-transparent'
//                     } ${
//                       activeView === 'speaker' && participant.id === 2
//                         ? 'w-full h-full'
//                         : 'h-48 md:h-56'
//                     } ${activeView === 'side-by-side' ? 'h-64' : ''}`}
//                   >
//                     {/* Video or placeholder */}
//                     {participant.videoOn ? (
//                       <div className="w-full h-full bg-gradient-to-br from-slate-800 to-purple-900 flex items-center justify-center">
//                         <div className="text-center">
//                           <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-700 to-pink-600 flex items-center justify-center mx-auto mb-3">
//                             <span className="text-2xl font-bold">
//                               {participant.name.split(' ').map(n => n[0]).join('')}
//                             </span>
//                           </div>
//                           <p className="font-medium">{participant.name}</p>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="w-full h-full bg-gradient-to-br from-slate-800 to-purple-900 flex items-center justify-center">
//                         <div className="text-center">
//                           <div className="w-20 h-20 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-3">
//                             <span className="text-2xl font-bold">
//                               {participant.name.split(' ').map(n => n[0]).join('')}
//                             </span>
//                           </div>
//                           <p className="font-medium">{participant.name}</p>
//                           {participant.muted && (
//                             <div className="absolute bottom-3 right-3 bg-red-500 rounded-full p-1">
//                               <MicOff size={14} />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Participant name and status */}
//                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
//                       <div className="flex justify-between items-center">
//                         <span className="font-medium text-sm">
//                           {participant.name} {participant.id === 1 && '(You)'}
//                         </span>
//                         <div className="flex space-x-1">
//                           {participant.muted && <MicOff size={16} />}
//                           {!participant.videoOn && <VideoOff size={16} />}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Speaking indicator */}
//                     {participant.isSpeaking && (
//                       <div className="absolute top-3 left-3">
//                         <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
//                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                           <span className="text-xs">Speaking</span>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {/* Screen sharing overlay */}
//               {isScreenSharing && (
//                 <div className="absolute top-4 right-4 bg-black/70 rounded-xl p-4 w-64 border border-purple-500/50">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-medium">Screen Sharing</span>
//                     <MonitorOff size={16} />
//                   </div>
//                   <div className="bg-gradient-to-r from-slate-800 to-purple-900 h-32 rounded-lg flex items-center justify-center">
//                     <div className="text-center">
//                       <ScreenShare size={24} className="mx-auto mb-2" />
//                       <p className="text-xs">You are sharing your screen</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Call controls */}
//             <div className="mt-6 flex justify-center">
//               <div className="flex items-center space-x-4 md:space-x-6 bg-black/30 backdrop-blur-lg rounded-2xl px-6 py-4">
//                 <button
//                   onClick={toggleMute}
//                   className={`p-3 rounded-full transition ${
//                     isMuted 
//                       ? 'bg-red-500 hover:bg-red-600' 
//                       : 'bg-gray-800 hover:bg-gray-700'
//                   }`}
//                 >
//                   {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
//                 </button>

//                 <button
//                   onClick={toggleVideo}
//                   className={`p-3 rounded-full transition ${
//                     isVideoOff 
//                       ? 'bg-red-500 hover:bg-red-600' 
//                       : 'bg-gray-800 hover:bg-gray-700'
//                   }`}
//                 >
//                   {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
//                 </button>

//                 <button
//                   onClick={toggleScreenShare}
//                   className={`p-3 rounded-full transition ${
//                     isScreenSharing 
//                       ? 'bg-purple-600 hover:bg-purple-700' 
//                       : 'bg-gray-800 hover:bg-gray-700'
//                   }`}
//                 >
//                   {isScreenSharing ? <MonitorOff size={22} /> : <ScreenShare size={22} />}
//                 </button>

//                 <button
//                   onClick={toggleParticipants}
//                   className={`p-3 rounded-full transition ${
//                     showParticipants 
//                       ? 'bg-purple-600 hover:bg-purple-700' 
//                       : 'bg-gray-800 hover:bg-gray-700'
//                   }`}
//                 >
//                   <Users size={22} />
//                 </button>

//                 <button
//                   onClick={toggleChat}
//                   className={`p-3 rounded-full transition ${
//                     showChat 
//                       ? 'bg-purple-600 hover:bg-purple-700' 
//                       : 'bg-gray-800 hover:bg-gray-700'
//                   }`}
//                 >
//                   <MessageSquare size={22} />
//                 </button>

//                 <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition">
//                   <MoreVertical size={22} />
//                 </button>

//                 <button
//                   onClick={endCall}
//                   className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition transform hover:scale-105"
//                 >
//                   <Phone size={22} className="rotate-135" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Side panels */}
//           {(showParticipants || showChat) && (
//             <div className="lg:w-1/3 flex flex-col space-y-6">
//               {/* Participants panel */}
//               {showParticipants && (
//                 <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-5 border border-white/10">
//                   <div className="flex items-center justify-between mb-5">
//                     <h2 className="text-xl font-bold">Participants ({participants.length})</h2>
//                     <button 
//                       onClick={toggleParticipants}
//                       className="text-gray-400 hover:text-white"
//                     >
//                       ✕
//                     </button>
//                   </div>
                  
//                   <div className="space-y-3 max-h-80 overflow-y-auto">
//                     {participants.map((participant) => (
//                       <div 
//                         key={participant.id} 
//                         className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition"
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                             participant.videoOn 
//                               ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
//                               : 'bg-gradient-to-r from-slate-700 to-slate-900'
//                           }`}>
//                             <span className="font-medium">
//                               {participant.name.split(' ').map(n => n[0]).join('')}
//                             </span>
//                           </div>
//                           <div>
//                             <p className="font-medium">
//                               {participant.name} {participant.id === 1 && '(You)'}
//                             </p>
//                             <div className="flex items-center space-x-2 text-sm text-gray-400">
//                               {participant.isSpeaking && (
//                                 <div className="flex items-center space-x-1">
//                                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                                   <span>Speaking</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center space-x-2">
//                           {participant.muted ? (
//                             <MicOff size={18} className="text-red-400" />
//                           ) : (
//                             <Mic size={18} className="text-green-400" />
//                           )}
                          
//                           {participant.videoOn ? (
//                             <Video size={18} className="text-green-400" />
//                           ) : (
//                             <VideoOff size={18} className="text-red-400" />
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
                  
//                   <button className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 transition font-medium">
//                     Invite people
//                   </button>
//                 </div>
//               )}

//               {/* Chat panel */}
//               {showChat && (
//                 <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-5 border border-white/10 flex flex-col h-full">
//                   <div className="flex items-center justify-between mb-5">
//                     <h2 className="text-xl font-bold">Chat</h2>
//                     <button 
//                       onClick={toggleChat}
//                       className="text-gray-400 hover:text-white"
//                     >
//                       ✕
//                     </button>
//                   </div>
                  
//                   <div className="flex-1 overflow-y-auto space-y-4 mb-5 max-h-64">
//                     {chatMessages.map((message) => (
//                       <div 
//                         key={message.id} 
//                         className={`p-3 rounded-xl ${
//                           message.sender === 'You' 
//                             ? 'bg-gradient-to-r from-purple-900/50 to-purple-800/30 ml-6' 
//                             : 'bg-white/5 mr-6'
//                         }`}
//                       >
//                         <div className="flex justify-between items-start mb-1">
//                           <span className={`font-medium ${
//                             message.sender === 'You' ? 'text-purple-300' : 'text-white'
//                           }`}>
//                             {message.sender}
//                           </span>
//                           <span className="text-xs text-gray-400">{message.time}</span>
//                         </div>
//                         <p className="text-gray-200">{message.text}</p>
//                       </div>
//                     ))}
//                   </div>
                  
//                   <div className="mt-auto">
//                     <div className="flex space-x-2">
//                       <input 
//                         type="text" 
//                         placeholder="Type a message..." 
//                         className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
//                       />
//                       <button className="px-5 rounded-xl bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 transition font-medium">
//                         Send
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Bottom info bar */}
//         <div className="mt-6 flex flex-wrap items-center justify-between text-sm text-gray-400">
//           <div className="flex items-center space-x-6">
//             <div className="flex items-center space-x-2">
//               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//               <span>Connection excellent</span>
//             </div>
//             <div>Resolution: 1080p</div>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <button className="hover:text-white transition">Record meeting</button>
//             <button className="hover:text-white transition">Live captions</button>
//             <button className="hover:text-white transition">Reactions</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoCallInterface;