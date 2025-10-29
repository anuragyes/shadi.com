import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import Hero from './components/Hero';
import Discover from './components/Discover';
import PersonalPage from "./components/PersonalPage";
import FriendList from './components/FriendList';
import ChatInterface from './components/Chat';
import Settings from './components/Setting';
import Testimonial from './components/Testimonial';
import Testimonials from './components/Testimonial';
import User_induvisual from './components/User_induvisual';
import IncomingRequests from './components/IncomingRequests';
import ChatsList from './components/ChatList';
import Doc from './components/Doc';

function App() {
  const [users, setUsers] = useState([]);

  // Mock data fetching or real API call
  useEffect(() => {
    const mockUsers = [ /* your user data here */];
    setUsers(mockUsers);
  }, []);

  const handleAddFriend = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isFriend: !user.isFriend } : user
    ));
  };

  return (
    <Router>
      <div className="App bg-gray-900 min-h-screen">
        <Navbar />

        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/testimonial" element={<Testimonials />} />
          <Route path="/discover" element={<Discover users={users} handleAddFriend={handleAddFriend} />} />
          <Route path="/user/:userId" element={<PersonalPage users={users}
            handleAddFriend={handleAddFriend} />} />
          <Route path="/matches" element={<FriendList />} />
          <Route path="/chat/:friendId" element={<ChatInterface />} />
          <Route path="/userprofile/:userId" element={<User_induvisual />} />
          <Route path='/getnotification' element={<IncomingRequests />} />
          <Route path='/Doc' element={<Doc />} />
          <Route path='/messages' element={<ChatsList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
