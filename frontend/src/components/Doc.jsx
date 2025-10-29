// DocPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { UserPlus, MessageCircle, Check } from "lucide-react";

const features = [
  {
    icon: <UserPlus size={24} />,
    title: "Connect with Friends",
    description: "Send and accept friend requests seamlessly to start chatting."
  },
  {
    icon: <MessageCircle size={24} />,
    title: "Real-Time Chat",
    description: "Chat instantly using WebSockets, with live typing and message delivery."
  },
  {
    icon: <Check size={24} />,
    title: "Persistent Conversations",
    description: "All your messages are saved in chat rooms for future reference."
  },
  {
    // icon: <Chat size={24} />,
    title: "Smart Chat Rooms",
    description: "Automatically create chat rooms when two users connect."
  }
];

const Doc = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center p-6">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Matimaona Chat System</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          A modern, real-time chat platform connecting friends instantly with seamless interactions.
        </p>
      </motion.header>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mb-16"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
          >
            <div className="text-pink-500 mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-500">{feature.description}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Demo Animation Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-4xl bg-linear-to-rfrom-pink-500 to-purple-600 p-8 rounded-2xl text-white flex flex-col items-center mb-16 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-4">See it in Action</h2>
        <p className="text-center mb-6">
          Watch real-time messages appear instantly as users send messages, with typing indicators and online status.
        </p>
        <div className="w-full h-64 bg-white rounded-xl flex items-center justify-center text-gray-800 font-bold text-lg shadow-inner">
          Demo Chat UI Placeholder
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center text-gray-500"
      >
        © {new Date().getFullYear()} Matimaona. All rights reserved.
      </motion.footer>
    </div>
  );
};

export default Doc;


