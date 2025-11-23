/**
 * Socket.IO Service for Real-time Chat
 *
 * Handles WebSocket connection to backend chat gateway
 * Namespace: /chat
 */

import { io } from "socket.io-client";
import { getToken } from "../services/api";

const SOCKET_NAMESPACE = "/chat";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Connect to WebSocket server
   * @param {Function} onConnect - Callback when connected
   * @param {Function} onDisconnect - Callback when disconnected
   * @param {Function} onError - Callback when error occurs
   */
  connect(onConnect, onDisconnect, onError) {
    if (this.socket?.connected) {
      console.log("[Socket] Already connected");
      return;
    }

    const token = getToken();
    if (!token) {
      console.error("[Socket] No JWT token found. Please login first.");
      if (onError) onError(new Error("No JWT token found"));
      return;
    }

    console.log(
      "[Socket] Connecting to:",
      `${API_BASE_URL}${SOCKET_NAMESPACE}`
    );

    this.socket = io(`${API_BASE_URL}${SOCKET_NAMESPACE}`, {
      query: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket.id);
      this.isConnected = true;
      if (onConnect) onConnect();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      this.isConnected = false;
      if (onDisconnect) onDisconnect(reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error);
      this.isConnected = false;
      if (onError) onError(error);
    });

    // Error events from server
    this.socket.on("error", (error) => {
      console.error("[Socket] Server error:", error);
      if (onError) onError(error);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      console.log("[Socket] Disconnecting...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Join a chat room (group)
   * @param {number} groupId - Group ID to join
   * @param {Function} onJoined - Callback when successfully joined
   */
  joinRoom(groupId, onJoined) {
    if (!this.socket?.connected) {
      console.error("[Socket] Not connected. Cannot join room.");
      return;
    }

    if (!Number.isInteger(groupId) || groupId <= 0) {
      console.error("[Socket] Invalid group ID:", groupId);
      return;
    }

    console.log("[Socket] Joining room:", `group-${groupId}`);
    this.socket.emit("joinRoom", groupId);

    // Listen for confirmation
    if (onJoined) {
      this.socket.once("joinedRoom", (message) => {
        console.log("[Socket]", message);
        onJoined(groupId);
      });
    }
  }

  /**
   * Leave a chat room (group)
   * @param {number} groupId - Group ID to leave
   * @param {Function} onLeft - Callback when successfully left
   */
  leaveRoom(groupId, onLeft) {
    if (!this.socket?.connected) {
      console.error("[Socket] Not connected. Cannot leave room.");
      return;
    }

    if (!Number.isInteger(groupId) || groupId <= 0) {
      console.error("[Socket] Invalid group ID:", groupId);
      return;
    }

    console.log("[Socket] Leaving room:", `group-${groupId}`);
    this.socket.emit("leaveRoom", groupId);

    // Listen for confirmation
    if (onLeft) {
      this.socket.once("leftRoom", (message) => {
        console.log("[Socket]", message);
        onLeft(groupId);
      });
    }
  }

  /**
   * Send a message
   * @param {string} content - Message content
   * @param {number|null} groupId - Group ID (null for general chat)
   * @param {Function} onSuccess - Callback when message is sent successfully
   * @param {Function} onError - Callback when error occurs
   */
  sendMessage(content, groupId = null, onSuccess, onError) {
    if (!this.socket?.connected) {
      console.error("[Socket] Not connected. Cannot send message.");
      if (onError) onError(new Error("Not connected to server"));
      return;
    }

    if (!content || !content.trim()) {
      console.error("[Socket] Message content is empty");
      if (onError) onError(new Error("Message content is empty"));
      return;
    }

    const payload = {
      content: content.trim(),
      ...(groupId && { groupId: Number(groupId) }),
    };

    console.log("[Socket] Sending message:", payload);
    this.socket.emit("sendMessage", payload, (response) => {
      // Socket.IO callback (if server uses it)
      if (response && response.error) {
        console.error("[Socket] Send message error:", response.error);
        if (onError) onError(new Error(response.error));
      } else if (onSuccess) {
        onSuccess(response);
      }
    });
  }

  /**
   * Listen for incoming messages
   * @param {Function} callback - Callback when message is received
   * @returns {Function} Unsubscribe function
   */
  onMessage(callback) {
    if (!this.socket) {
      console.error("[Socket] Socket not initialized");
      return () => {};
    }

    const listener = (message) => {
      console.log("[Socket] Received message:", message);
      callback(message);
    };

    this.socket.on("receiveMessage", listener);

    // Store listener for cleanup
    const key = "receiveMessage";
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(listener);

    // Return unsubscribe function
    return () => {
      this.socket.off("receiveMessage", listener);
      const listeners = this.listeners.get(key);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
