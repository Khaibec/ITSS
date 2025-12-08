import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ChatArea from "./ChatArea";
import { chatBoxesAPI, getToken } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { getUserFromToken } from "../../utils/jwt";
import socketService from "../../api/socket";

const ChatInterface = () => {
  const { groupId } = useParams();
  const { logout } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const currentRoomRef = useRef(null);
  const messageUnsubscribeRef = useRef(null);

  // Get current user from JWT token
  useEffect(() => {
    const token = getToken();
    if (token) {
      const user = getUserFromToken(token);
      setCurrentUser(user);
    }
  }, []);

  // Initialize Socket connection
  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.log("[ChatInterface] No token, skipping socket connection");
      return;
    }

    // Connect to socket
    socketService.connect(
      () => {
        console.log("[ChatInterface] Socket connected");
      },
      (reason) => {
        console.log("[ChatInterface] Socket disconnected:", reason);
      },
      (error) => {
        console.error("[ChatInterface] Socket error:", error);
        if (error.message?.includes("Authentication")) {
          logout();
        }
      }
    );

    // Listen for incoming messages
    messageUnsubscribeRef.current = socketService.onMessage((message) => {
      console.log("[ChatInterface] New message received:", message);

      // Only update if message belongs to current group
      if (message.group_id === parseInt(groupId)) {
        setMessages((prev) => {
          // Check if message already exists (avoid duplicates)
          const exists = prev.some(
            (msg) => msg.message_id === message.message_id
          );

          if (exists) {
            return prev;
          }

          return [...prev, message];
        });
      }
    });

    // Cleanup on unmount
    return () => {
      console.log("[ChatInterface] Cleaning up socket connection");
      if (messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current();
      }
      if (currentRoomRef.current) {
        socketService.leaveRoom(currentRoomRef.current);
      }
      socketService.disconnect();
    };
  }, [groupId, logout]);

  // Fetch group info and messages when groupId changes
  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    const fetchGroupAndMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingMessages(true);

        // Fetch all chat boxes to get group info
        const chatBoxesResponse = await chatBoxesAPI.getChatBoxes();
        if (chatBoxesResponse.success && chatBoxesResponse.data) {
          const group = chatBoxesResponse.data.find(
            (g) => g.group_id === parseInt(groupId)
          );
          if (group) {
            setSelectedGroup(group);
          } else {
            setError("グループが見つかりません");
            setLoading(false);
            return;
          }
        }

        // Leave previous room if exists
        if (
          currentRoomRef.current &&
          currentRoomRef.current !== parseInt(groupId)
        ) {
          socketService.leaveRoom(currentRoomRef.current);
        }

        // Join new room
        currentRoomRef.current = parseInt(groupId);
        socketService.joinRoom(parseInt(groupId), () => {
          console.log("[ChatInterface] Joined room:", groupId);
        });

        // Fetch existing messages
        const messagesResponse = await chatBoxesAPI.getMessages(
          parseInt(groupId)
        );
        if (messagesResponse.success && messagesResponse.data) {
          setMessages(messagesResponse.data);
        } else {
          console.error("Failed to load messages");
        }
      } catch (err) {
        console.error("Error fetching group and messages:", err);
        setError(err.message || "データの取得に失敗しました");
        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          logout();
        }
      } finally {
        setLoading(false);
        setLoadingMessages(false);
      }
    };

    fetchGroupAndMessages();
  }, [groupId, logout]);

  const handleSendMessage = (content) => {
    if (!content || !content.trim()) {
      return;
    }

    if (!groupId) {
      console.error("[ChatInterface] No group ID");
      return;
    }

    // Send message via socket
    socketService.sendMessage(
      content,
      parseInt(groupId),
      () => {
        console.log("[ChatInterface] Message sent successfully");
        // Message will be added to state via socket listener
      },
      (error) => {
        console.error("[ChatInterface] Failed to send message:", error);
        alert(`メッセージの送信に失敗しました: ${error.message}`);
      }
    );
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-lg">グループが見つかりません</div>
      </div>
    );
  }

  return (
    <ChatArea
      group={selectedGroup}
      messages={messages}
      currentUser={currentUser}
      onSendMessage={handleSendMessage}
      loadingMessages={loadingMessages}
    />
  );
};

export default ChatInterface;

