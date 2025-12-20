


import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Discover from "./components/Discover";
import VideoCallInterface from "./Sockets/VideoCall";
import VoiceCallInterface from "./Sockets/VoiceCall";
import socket from "./Sockets/SocketService"
import IncomingCallNotification from "./Sockets/Incommingcallnotification";
import Signup from './components/Signup';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import PersonalPage from "./components/PersonalPage";
import FriendList from './components/FriendList';
import ChatInterface from './components/Chat';
import Settings from './components/Setting';

import IncomingRequests from './components/IncomingRequests';
import ChatsList from './components/ChatList';
import Doc from './components/Doc';
import ReelList from './components/ReelList';
import UploadReels from './components/UploadReels';
import Gallery from './components/Gallery';
import Feed from './components/Feed';
import Testimonials from "./components/Testimonial";
import User_individual from "./components/User_induvisual";
import PremiumFeaturesPage from "./components/Premium/PremiumFeature";
import TransactionHistoryPage from "./components/Premium/TransactionHistoryPage";
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallNotification, setShowCallNotification] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);





  /* ===============================
     🔹 LOAD CURRENT USER
  =============================== */
  useEffect(() => {
    const loginData =
      localStorage.getItem("loginData") || localStorage.getItem("user");

    if (loginData) {
      try {
        const user = JSON.parse(loginData);
        console.log(" Current user loaded:", user);
        setCurrentUser(user);
      } catch (error) {
        console.error(" Error parsing user data:", error);
      }
    }
  }, []);

  /* ===============================
     CONNECT SOCKET WHEN USER LOGS IN
  =============================== */
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log(" Connecting socket for:", currentUser.id);

    socket.connect(currentUser.id).then(() => {
      console.log(" Socket connected");
    }).catch(error => {
      console.error(" Failed to connect socket:", error);
    });

    return () => {
      console.log("🔌 App cleanup");
    };
  }, [currentUser]);

  /* ===============================
      SETUP SOCKET LISTENERS
  =============================== */
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log(" Setting up socket listeners");

    // Incoming Call Handler
    const handleIncomingCall = (data) => {
      console.log(" INCOMING CALL RECEIVED:", data);
      // console.log("this is unccoming call id " , incomingCall)
      setIncomingCall(data);
      setShowCallNotification(true);
    };

    // Call Rejected Handler
    const handleCallRejected = (data) => {
      console.log(" Call rejected:", data);
      if (incomingCall?.callId === data.callId) {
        setShowCallNotification(false);
        setIncomingCall(null);
        alert("Call was rejected");
      }
    };

    // Call Ended Handler
    const handleCallEnded = (data) => {
      console.log(" Call ended:", data);
      if (incomingCall?.callId === data.callId) {
        setShowCallNotification(false);
        setIncomingCall(null);
        alert("Call ended");
      }
    };

    // Register listeners
    socket.onIncomingCall(handleIncomingCall);
    socket.onCallRejected(handleCallRejected);
    socket.onCallEnded(handleCallEnded);

    // Auto-hide after 35 seconds
    const timeout = setTimeout(() => {
      if (showCallNotification) {
        console.log(" Auto-hiding call notification");
        setShowCallNotification(false);
        setIncomingCall(null);
      }
    }, 35000);

    return () => {
      clearTimeout(timeout);
      console.log(" Removing socket listeners");
      // Note: Your socket service should handle cleanup
    };
  }, [currentUser, incomingCall, showCallNotification]);




  useEffect(() => {
    if (!isSocketConnected) return;

    console.log(" Registering socket listeners");

    const offIncoming = socket.onIncomingCall((data) => {
      console.log(" Incoming call received:", data);
      setIncomingCall(data);
      setShowCallNotification(true);
    });

    const offRejected = socket.onCallRejected((data) => {
      console.log(" Call rejected:", data);
      setShowCallNotification(false);
      setIncomingCall(null);
    });

    const offEnded = socket.onCallEnded((data) => {
      console.log(" Call ended:", data);
      setShowCallNotification(false);
      setIncomingCall(null);
    });

    return () => {
      offIncoming();
      offRejected();
      offEnded();
    };
  }, [isSocketConnected]);



  useEffect(() => {
    console.log(" currentUser state changed:", currentUser);
  }, [currentUser]);





  /* ===============================
      CALL ACTIONS
  =============================== */
  const handleAcceptCall = () => {
    if (!incomingCall || !currentUser) return;

    console.log("✅ Accepting call from:", incomingCall.from);

    socket.acceptCall({
      callId: incomingCall.callId,
      from: currentUser.id,
      to: incomingCall.from,
    });

    setShowCallNotification(false);
  };

  const handleRejectCall = () => {
    if (!incomingCall || !currentUser) return;

    console.log("❌ Rejecting call from:", incomingCall.from);

    socket.rejectCall({
      callId: incomingCall.callId,
      from: currentUser.id,
      to: incomingCall.from,
      reason: "busy",
    });

    setShowCallNotification(false);
    setIncomingCall(null);
  };

  /* ===============================
     🖥 RENDER
  =============================== */
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white">
        <Navbar />

        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/matches" element={<FriendList />} />
          <Route path="/testimonial" element={<Testimonials />} />
          <Route path="/chat/:friendId" element={<ChatInterface />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/user/:userId" element={<PersonalPage
          />} />
          <Route path="/userprofile/:reqId" element={<User_individual />} />
          <Route path='/getnotification' element={<IncomingRequests />} />
          <Route path='/Doc' element={<Doc />} />
          <Route path='/messages' element={<ChatsList />} />
          <Route path='/reellist' element={<ReelList />} />
          <Route path='/uploadReel' element={<UploadReels />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/feed' element={<Feed />} />

          <Route path="/testimonial" element={<Testimonials />} />



          <Route
            path="/VideoCall/:callId/:currentUserId"
            element={<VideoCallInterface />}
          />
          <Route
            path="/VoiceCall/:callId/:currentUserId"
            element={<VoiceCallInterface />}
          />

          <Route path="/premium" element={<PremiumFeaturesPage />} />


          <Route path="/transactions" element={<TransactionHistoryPage/>}/>
        </Routes>




        {console.log(
          " Incoming popup render check:",
          showCallNotification,
          incomingCall,
          currentUser
        )}


        {/* Incoming Call Popup */}
        {showCallNotification && incomingCall && currentUser && (
          <IncomingCallNotification
            callData={incomingCall}
            currentUserId={currentUser.id}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
          />
        )}
      </div>
    </Router>
  );
}

export default App;


