import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import GroupList from "./GroupList";
import ChatArea from "./ChatArea";
import { chatBoxesAPI, getToken } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { getUserFromToken } from "../../utils/jwt";
import socketService from "../../api/socket";

const ChatLayout = () => {
  const { logout } = useAuth();
  const [chatBoxes, setChatBoxes] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const currentRoomRef = useRef(null); // Track current room
  const messageUnsubscribeRef = useRef(null); // Track message listener

  // Initialize Socket connection
  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.log("[ChatLayout] No token, skipping socket connection");
      return;
    }

    // Connect to socket
    socketService.connect(
      () => {
        console.log("[ChatLayout] Socket connected");
      },
      (reason) => {
        console.log("[ChatLayout] Socket disconnected:", reason);
      },
      (error) => {
        console.error("[ChatLayout] Socket error:", error);
        if (error.message?.includes("Authentication")) {
          logout();
        }
      }
    );

    // Listen for incoming messages
    messageUnsubscribeRef.current = socketService.onMessage((message) => {
      console.log("[ChatLayout] New message received:", message);

      // Update messages state
      setMessages((prev) => {
        // Use group_id if exists, otherwise use null for general chat
        const groupId = message.group_id ?? null;
        const key = groupId || "general";
        const existingMessages = prev[key] || [];

        // Check if message already exists (avoid duplicates)
        const exists = existingMessages.some(
          (msg) => msg.message_id === message.message_id
        );

        if (exists) {
          return prev;
        }

        return {
          ...prev,
          [key]: [...existingMessages, message],
        };
      });
    });

    // Cleanup on unmount
    return () => {
      console.log("[ChatLayout] Cleaning up socket connection");
      if (messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current();
      }
      if (currentRoomRef.current) {
        socketService.leaveRoom(currentRoomRef.current);
      }
      socketService.disconnect();
    };
  }, [logout]);

  // Fetch chat boxes on mount
  useEffect(() => {
    const fetchChatBoxes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatBoxesAPI.getChatBoxes();

        if (response.success && response.data) {
          setChatBoxes(response.data);
          // Auto-select first group if available
          if (response.data.length > 0) {
            setSelectedGroupId(response.data[0].group_id);
          }
        } else {
          setError("Failed to load chat boxes");
        }
      } catch (err) {
        console.error("Error fetching chat boxes:", err);
        setError(err.message || "Failed to load chat boxes");
        // If unauthorized, logout user
        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChatBoxes();
  }, [logout]);

  // Fetch messages and join room when group is selected
  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchMessagesAndJoinRoom = async () => {
      try {
        setLoadingMessages(true);

        // Leave previous room if exists
        if (
          currentRoomRef.current &&
          currentRoomRef.current !== selectedGroupId
        ) {
          socketService.leaveRoom(currentRoomRef.current);
        }

        // Join new room
        currentRoomRef.current = selectedGroupId;
        socketService.joinRoom(selectedGroupId, () => {
          console.log("[ChatLayout] Joined room:", selectedGroupId);
        });

        // Fetch existing messages (only if not already loaded)
        if (!messages[selectedGroupId]) {
          const response = await chatBoxesAPI.getMessages(selectedGroupId);

          if (response.success && response.data) {
            setMessages((prev) => ({
              ...prev,
              [selectedGroupId]: response.data,
            }));
          } else {
            console.error("Failed to load messages");
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        // If unauthorized, logout user
        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          logout();
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessagesAndJoinRoom();
  }, [selectedGroupId, logout]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
  };

  const handleSendMessage = (content) => {
    if (!content || !content.trim()) {
      return;
    }

    if (!selectedGroupId) {
      console.error("[ChatLayout] No group selected");
      return;
    }

    // Send message via socket
    socketService.sendMessage(
      content,
      selectedGroupId,
      () => {
        console.log("[ChatLayout] Message sent successfully");
        // Message will be added to state via socket listener
      },
      (error) => {
        console.error("[ChatLayout] Failed to send message:", error);
        alert(`メッセージの送信に失敗しました: ${error.message}`);
      }
    );
  };

  const selectedGroup = chatBoxes.find((g) => g.group_id === selectedGroupId);

  // Get current user from JWT token
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const user = getUserFromToken(token);
      setCurrentUser(user);
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">チャットボックスを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
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

  if (chatBoxes.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-center">
          <div className="text-lg mb-2">チャットボックスがありません</div>
          <div className="text-sm text-gray-400">
            グループに参加してください
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <ChatHeader currentUser={currentUser} />

      <div className="flex-1 flex overflow-hidden">
        <GroupList
          groups={chatBoxes}
          selectedGroupId={selectedGroupId}
          onSelectGroup={handleSelectGroup}
        />

        <ChatArea
          group={selectedGroup}
          messages={messages[selectedGroupId] || []}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          loadingMessages={loadingMessages}
        />
      </div>
    </div>
  );
};

export default ChatLayout;
