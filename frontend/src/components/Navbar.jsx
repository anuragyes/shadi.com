import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/Authcontext.js"
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

  const userName = currentuser?.personalInfo?.firstName || "";
  console.log(currentuser)
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
    <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl z-50">
      <div className="p-4 border-b border-gray-700">
        <p className="text-white font-semibold truncate">{userName}</p>
        <p className="text-gray-400 text-sm truncate">{userEmail}</p>
        <p className="text-green-400 text-xs mt-1">✓ Session saved</p>
      </div>
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 w-full text-left rounded-lg transition-all"
      >
        <User className="h-4 w-4" />
        <span>My Profile</span>
      </button>
      <button
        onClick={() => navigate("/settings")}
        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 w-full text-left rounded-lg transition-all"
      >
        <Settings className="h-4 w-4" />
        <span>Settings</span>
      </button>


       <button
        onClick={() => navigate("/feed")}
        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 w-full text-left rounded-lg transition-all"
      >
        <Film className="h-4 w-4" />
        <span>Go To Reels</span>
      </button>

      <button
        onClick={() => navigate("/uploadReel")}
        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 w-full text-left rounded-lg transition-all"
      >
        <CircleFadingArrowUp className="h-4 w-4" />
        <span>Upload img/videos</span>
      </button>
      <button
        onClick={() => navigate("/gallery")}
        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 w-full text-left rounded-lg transition-all"
      >
        <Images className="h-4 w-4" />
        <span>My Gallery</span>
      </button>




      <hr className="border-gray-700" />
      <button
        onClick={handleLogout}
        disabled={logoutLoading}
        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 w-full text-left rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {logoutLoading ? (
          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <nav className="bg-gray-900/90 backdrop-blur-2xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-500 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
              SoulMate
            </span>
          </div>
          <div className="animate-pulse h-8 w-24 bg-gray-700 rounded-lg"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled ? "bg-gray-900/95 shadow-2xl shadow-purple-900/20" : "bg-gray-900/90 shadow-lg shadow-purple-900/10"
        } backdrop-blur-2xl border-b border-gray-700`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
              SoulMate
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-2 flex-1 justify-center">
            {navItems.map((item) => {
              const active = isActiveLink(item.to);
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${active
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                >
                  <item.icon className={`h-4 w-4 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/getnotification")}
                  className="hidden sm:block relative p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    3
                  </span>
                </button>
                <button
                  onClick={() => navigate("/messages")}
                  className="hidden sm:block relative p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    5
                  </span>
                </button>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-800/60 border border-transparent hover:border-gray-600 transition-all"
                  >

                    <div>  <User className="w-8 h-8 bg-linear-to-r bg-gray-300 rounded-full flex items-center justify-center" /> <span className="text-white font-bold">{userInitial}</span></div>


                    <span className="hidden lg:block text-gray-300 font-medium truncate max-w-32">{userName}</span>
                  </button>
                  {isProfileOpen && <ProfileDropdown />}


                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-all"
                >
                  Join Free
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            {/* Background Overlay - FIXED: Lower z-index and proper positioning */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu Content - FIXED: Higher z-index and proper positioning */}
            <div className="md:hidden bg-gray-800/95 backdrop-blur-xl border-t border-gray-700 animate-slideDown absolute left-0 right-0 top-16 z-50">
              <div className="flex flex-col space-y-1 p-2">
                {navItems.map((item) => {
                  const active = isActiveLink(item.to);
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        navigate(item.to);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${active
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}

                {isLoggedIn && (
                  <>
                    <hr className="border-gray-700 my-2" />
                    <div className="px-4 py-2">
                      <p className="text-white font-semibold text-sm">{userName}</p>
                      <p className="text-gray-400 text-xs">{userEmail}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 w-full rounded-lg transition-all"
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium">My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 w-full rounded-lg transition-all"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full rounded-lg transition-all disabled:opacity-50"
                    >
                      {logoutLoading ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      <span className="font-medium">{logoutLoading ? "Logging out..." : "Logout"}</span>
                    </button>
                  </>
                )}

                {!isLoggedIn && (
                  <div className="flex flex-col space-y-2 p-4">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 hover:text-white transition-all font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate("/signup");
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg hover:scale-105 transition-all"
                    >
                      Join Free
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile Dropdown Overlay */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
