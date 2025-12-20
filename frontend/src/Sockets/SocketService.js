



import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.isConnected = false;
    this.connectionListeners = [];
    this.eventQueue = [];
    this.isConnecting = false;
    this.errorListeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connectionTimeout = 10000; // 10 seconds
  }

  /* ================= CONNECT ================= */
  connect(userId) {
    return new Promise((resolve, reject) => {
      // Avoid duplicate connections
      if (this.isConnecting) {
        console.log("⏳ Already connecting, waiting...");
        setTimeout(() => {
          this.connect(userId).then(resolve).catch(reject);
        }, 100);
        return;
      }

      if (this.socket?.connected && this.userId === userId) {
        console.log("✅ Already connected");
        resolve(this.socket);
        return;
      }

      this.isConnecting = true;
      this.userId = userId;
      
      console.log("🔌 Connecting socket for:", userId);

      // Clean up existing socket
      if (this.socket) {
        this.cleanupSocket();
      }

      // Create new socket connection
      this.socket = io("http://localhost:5000", {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: this.connectionTimeout,
        query: { userId },
        forceNew: true // Important: prevent connection sharing
      });

      // Setup connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected && this.isConnecting) {
          console.error("⏰ Connection timeout");
          this.isConnecting = false;
          this.cleanupSocket();
          reject(new Error("Connection timeout"));
        }
      }, this.connectionTimeout);

      // Setup event listeners
      const onConnect = () => {
        clearTimeout(connectionTimeout);
        console.log("🟢 Connected successfully. Socket ID:", this.socket.id);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Register user
    // Register user (BACKEND EXPECTS THIS)
this.socket.emit("userOnline", userId);
console.log("🟢 userOnline emitted:", userId);

        
        // Process queued events
        this.processQueue();
        
        resolve(this.socket);
        
        // Notify listeners
        this.connectionListeners.forEach(cb => cb(true));
      };

      const onConnectError = (error) => {
        clearTimeout(connectionTimeout);
        console.error("❌ Connection error:", error);
        this.isConnecting = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.cleanupSocket();
          reject(new Error(`Connection failed after ${this.maxReconnectAttempts} attempts`));
        } else {
          reject(error);
        }
      };

      const onDisconnect = (reason) => {
        console.log("🔴 Disconnected:", reason);
        this.isConnected = false;
        
        // Notify error listeners
        if (reason !== 'io client disconnect') {
          this.emitError(new Error(`Disconnected: ${reason}`));
        }
        
        this.connectionListeners.forEach(cb => cb(false));
      };

      // Attach listeners (once for connect events to prevent duplicates)
      this.socket.once("connect", onConnect);
      this.socket.once("connect_error", onConnectError);
      this.socket.on("disconnect", onDisconnect);

      // Setup error listeners
      this.setupErrorListeners();
    });
  }

  /* ================= ERROR HANDLING ================= */
  setupErrorListeners() {
    if (!this.socket) return;

    // Socket.io error events
    this.socket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
      this.emitError(error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
      this.emitError(error);
    });

    this.socket.on('reconnect_failed', () => {
      const error = new Error('Reconnection failed');
      console.error('🔴 Reconnection failed');
      this.emitError(error);
    });
  }

  onError(callback) {
    this.errorListeners.push(callback);
  }

  offError(callback) {
    this.errorListeners = this.errorListeners.filter(cb => cb !== callback);
  }

  emitError(error) {
    // Call all error listeners
    this.errorListeners.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  removeAllErrorListeners() {
    this.errorListeners = [];
  }

  /* ================= EVENT QUEUE ================= */
  queueEvent(event, data) {
    // Don't queue if already in queue (prevent duplicates)
    const isAlreadyQueued = this.eventQueue.some(item => 
      item.event === event && JSON.stringify(item.data) === JSON.stringify(data)
    );
    
    if (!isAlreadyQueued) {
      this.eventQueue.push({ event, data, timestamp: Date.now() });
      console.log(`📥 Queued event: ${event}`, data);
    }
  }

  processQueue() {
    if (this.eventQueue.length === 0) return;
    
    console.log(`📤 Processing ${this.eventQueue.length} queued events`);
    
    // Filter out old events (older than 30 seconds)
    const now = Date.now();
    const recentEvents = this.eventQueue.filter(
      item => now - item.timestamp < 30000
    );
    
    recentEvents.forEach(({ event, data }) => {
      try {
        console.log(`📤 Emitting queued event: ${event}`);
        this.socket.emit(event, data);
      } catch (error) {
        console.error(`❌ Failed to emit queued event ${event}:`, error);
      }
    });
    
    // Update queue with only failed events (we'll retry them)
    this.eventQueue = this.eventQueue.filter(
      item => !recentEvents.includes(item)
    );
  }

  /* ================= SAFE EMIT ================= */
  emit(event, data) {
    // Validate socket
    if (!this.socket) {
      console.error(`❌ Cannot emit ${event}: socket not initialized`);
      this.queueEvent(event, data);
      return false;
    }
    
    // Check connection
    if (!this.socket.connected) {
      console.warn(`⚠️ Socket not connected, queuing: ${event}`);
      this.queueEvent(event, data);
      return false;
    }
    
    // Emit with error handling
    try {
      console.log(`📤 Emitting ${event}:`, data);
      this.socket.emit(event, data);
      return true;
    } catch (error) {
      console.error(`❌ Error emitting ${event}:`, error);
      this.queueEvent(event, data);
      return false;
    }
  }

  /* ================= CALL METHODS ================= */
  initiateCall(data) {
    console.log('📞 Initiating call to:', data.to);
    return this.emit("initiate-call", data);
  }

  acceptCall(data) {
    console.log('✅ Accepting call from:', data.from);
    return this.emit("accept-call", data);
  }

  rejectCall(data) {
    console.log('❌ Rejecting call from:', data.from);
    return this.emit("reject-call", data);
  }

  endCall(data) {
    console.log('📞 Ending call with:', data.to);
    return this.emit("end-call", data);
  }

  sendCallAccepted(data) {
    return this.emit("call-accepted", data);
  }

  sendCallRejected(data) {
    return this.emit("call-rejected", data);
  }

  /* ================= WEBRTC METHODS ================= */
  sendOffer(data) {
    return this.emit("offer", data);
  }

  sendAnswer(data) {
    return this.emit("answer", data);
  }

  sendIceCandidate(data) {
    return this.emit("ice-candidate", data);
  }

  /* ================= STATUS METHODS ================= */
  sendMuteStatus(data) {
    return this.emit("mute-status", data);
  }

  sendSpeakingStatus(data) {
    return this.emit("speaking-status", data);
  }

  sendChatMessage(data) {
    return this.emit("chat-message", data);
  }

  /* ================= EVENT LISTENERS ================= */
  on(event, callback) {
    if (!this.socket) {
      console.warn(`⚠️ Cannot add listener ${event}: socket not initialized`);
      return () => {}; // Return empty cleanup function
    }
    
    this.socket.on(event, callback);
    
    // Return cleanup function
    return () => {
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // Pre-defined listeners with proper cleanup
  onIncomingCall(callback) {
    return this.on("incoming-call", callback);
  }

  onCallAccepted(callback) {
    return this.on("call-accepted", callback);
  }

  onCallRejected(callback) {
    return this.on("call-rejected", callback);
  }

  onCallEnded(callback) {
    return this.on("call-ended", callback);
  }

  onOffer(callback) {
    return this.on("offer", callback);
  }

  onAnswer(callback) {
    return this.on("answer", callback);
  }

  onIceCandidate(callback) {
    return this.on("ice-candidate", callback);
  }

  onRemoteMuteStatus(callback) {
    return this.on("remote-mute-status", callback);
  }

  onRemoteSpeakingStatus(callback) {
    return this.on("remote-speaking-status", callback);
  }

  onChatMessage(callback) {
    return this.on("chat-message", callback);
  }

  onUserDisconnected(callback) {
    return this.on("user-disconnected", callback);
  }

  onUserOnline(callback) {
    return this.on("user-online", callback);
  }

  onUserOffline(callback) {
    return this.on("user-offline", callback);
  }

  /* ================= CONNECTION MANAGEMENT ================= */
  onConnect(callback) {
    this.connectionListeners.push(callback);
    
    // Return cleanup function
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      socketId: this.socket?.id,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  isReady() {
    return this.socket?.connected && this.isConnected;
  }

  /* ================= CLEANUP ================= */

    removeAllListeners() {
    if (!this.socket) return;
    console.log("🧹 Removing all socket listeners");
    this.socket.removeAllListeners();
  }
  cleanupSocket() {
    if (this.socket) {
      // Remove all listeners
      this.socket.removeAllListeners();
      
      // Disconnect if connected
      if (this.socket.connected) {
        this.socket.disconnect();
      }
      
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }

  disconnect() {
    console.log("🧹 Disconnecting socket service");
    
    // Clear all listeners
    this.removeAllErrorListeners();
    this.connectionListeners = [];
    
    // Cleanup socket
    this.cleanupSocket();
    
    // Clear queue
    this.eventQueue = [];
    
    // Reset state
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  /* ================= HEALTH CHECK ================= */
  ping() {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve(false);
        return;
      }
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000);
      
      this.socket.emit('ping', Date.now(), (response) => {
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }

  /* ================= RECONNECTION ================= */
  async reconnect() {
    if (!this.userId) {
      console.error("❌ Cannot reconnect: no user ID");
      return false;
    }
    
    try {
      console.log("🔄 Attempting to reconnect...");
      await this.connect(this.userId);
      return true;
    } catch (error) {
      console.error("❌ Reconnection failed:", error);
      return false;
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;