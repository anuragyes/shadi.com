

import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/Authcontext.js";
import toast from "react-hot-toast";
import {
  Heart,
  Search,
  Film,
  MessageCircle,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Star,
  Home,
  Images,
  CircleFadingArrowUp
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentuser, isLoggedIn, AuthLogout, loading } = useContext(AuthContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [requestsCount, setRequestsCount] = useState(0);

  const userName = currentuser?.name || "UnKnown";

  // console.log("this is username from navbar-------------------------------" ,currentuser.name )
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = currentuser?.email || "";

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/discover", icon: Search, label: "Discover" },
    { to: "/matches", icon: Star, label: "Matches" },
    { to: "/messages", icon: MessageCircle, label: "Messages" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await AuthLogout();
      toast.success("Logged out successfully", { duration: 3000 });
      navigate("/");
    } catch (err) {
      toast.error("Logout failed. Please try again.", { duration: 3000 });
    } finally {
      setLogoutLoading(false);
    }
  };

  const isActiveLink = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const ProfileDropdown = () => (
    <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <p className="text-white font-semibold truncate">{userName}</p>
        <p className="text-gray-400 text-sm truncate mt-1">{userEmail}</p>
      </div>

      <div className="p-2 space-y-1">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-pink-500/20 hover:text-pink-300 w-full text-left rounded-lg transition-all duration-200"
        >
          <User className="h-4 w-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 w-full text-left rounded-lg transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => navigate("/feed")}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-blue-500/20 hover:text-blue-300 w-full text-left rounded-lg transition-all duration-200"
        >
          <Film className="h-4 w-4" />
          <span>Go To Reels</span>
        </button>

        <button
          onClick={() => navigate("/uploadReel")}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-green-500/20 hover:text-green-300 w-full text-left rounded-lg transition-all duration-200"
        >
          <CircleFadingArrowUp className="h-4 w-4" />
          <span>Upload Media</span>
        </button>

        <button
          onClick={() => navigate("/gallery")}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-orange-500/20 hover:text-orange-300 w-full text-left rounded-lg transition-all duration-200"
        >
          <Images className="h-4 w-4" />
          <span>My Gallery</span>
        </button>


          <button
          onClick={() => navigate("/premium")}
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-orange-500/20 hover:text-orange-300 w-full text-left rounded-lg transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check-icon lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
          {/* <Images className="h-4 w-4" /> */}
          <span>Explore Premium</span>
        </button>



        <div className="border-t border-gray-700 mt-2 pt-2">
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 w-full text-left rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logoutLoading ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <nav className="bg-gray-900/90 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
              SoulMate
            </span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white `}

    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="p-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
              SoulMate
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => {
              const active = isActiveLink(item.to);
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${active
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                >
                  <item.icon className={`h-4 w-4 ${active ? "text-pink-300" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center  justify-end">

            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => navigate("/getnotification")}
                  className="hidden sm:block relative p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300 group"
                >
                  <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  {requestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse shadow-lg">
                      {requestsCount}
                    </span>
                  )}
                </button>

                {/* Messages */}
                <button
                  onClick={() => navigate("/messages")}
                  className="hidden sm:block relative p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300 group"
                >
                  <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </button>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-1.5 cursor-pointer rounded-xl 
              "
                  >
                    {/* Profile Image */}
                    <img
                      src="https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?semt=ais_hybrid&w=740&q=80"
                      alt="Profile"
                      className="h-10 w-10    rounded-xl object-cover border border-gray-600"
                    />


                  </button>

                  {isProfileOpen && <ProfileDropdown />}
                </div>

              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-300 hover:text-white px-5 py-2.5 rounded-xl transition-all duration-300 hover:bg-gray-800/50 font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:scale-105 hover:shadow-pink-500/25 transition-all duration-300"
                >
                  Join Free
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Content */}
            <div className="fixed inset-x-0 top-16 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 z-50 animate-slideDown">
              <div className="flex flex-col space-y-1 p-4">
                {navItems.map((item) => {
                  const active = isActiveLink(item.to);
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        navigate(item.to);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${active
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}

                {isLoggedIn && (
                  <>
                    <div className="border-t border-gray-800 my-2 pt-4">
                      <div className="px-4 py-2">
                        <p className="text-white font-semibold">{userName}</p>
                        <p className="text-gray-400 text-sm mt-1">{userEmail}</p>
                      </div>

                      <button
                        onClick={() => {
                          navigate("/getnotification");
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3.5 text-gray-300 hover:text-white hover:bg-gray-800/50 w-full rounded-xl transition-all duration-200"
                      >
                        <Bell className="h-4 w-4" />
                        <span className="font-medium">Notifications</span>
                        {requestsCount > 0 && (
                          <span className="ml-auto w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                            {requestsCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="flex items-center space-x-3 px-4 py-3.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full rounded-xl transition-all duration-200 mt-2"
                      >
                        {logoutLoading ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        <span className="font-medium">{logoutLoading ? "Logging out..." : "Logout"}</span>
                      </button>
                    </div>
                  </>
                )}

                {!isLoggedIn && (
                  <div className="border-t border-gray-800 pt-4 mt-2">
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={() => {
                          navigate("/login");
                          setIsMenuOpen(false);
                        }}
                        className="px-4 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-800/70 hover:text-white transition-all duration-200 font-medium"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          navigate("/signup");
                          setIsMenuOpen(false);
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Join Free
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Dropdown Overlay */}
        {isProfileOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsProfileOpen(false)}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
