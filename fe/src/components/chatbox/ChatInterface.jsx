import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatArea from "./ChatArea";
import { chatBoxesAPI, getToken } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { getUserFromToken } from "../../utils/jwt";
import socketService from "../../api/socket";

const ChatInterface = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatBoxes, setChatBoxes] = useState([]);
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
        // Do not auto-logout on socket error to prevent accidental logouts
        // if (error.message?.includes("Authentication")) {
        //   logout();
        // }
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
          setChatBoxes(chatBoxesResponse.data);
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
          
          // Mark all messages as read after loading
          try {
            await chatBoxesAPI.markAsRead(parseInt(groupId));
            console.log("[ChatInterface] Messages marked as read");
          } catch (markReadError) {
            console.error("[ChatInterface] Failed to mark messages as read:", markReadError);
            // Don't block UI if mark as read fails
          }
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

  const handleBack = () => navigate("/chatbox/groups");
  const handleSelectGroup = (id) => navigate(`/chatbox/groups/${id}`);

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

  // Function to generate initials from group name
  const getInitials = (name) => {
    if (!name) return "G";
    return name.substring(0, 1).toUpperCase();
  };

  // Function to generate a consistent color based on string
  const getBackgroundColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#ef4444", "#f97316", "#f59e0b", 
      "#22c55e", "#10b981", "#14b8a6",
      "#06b6d4", "#0ea5e9", "#3b82f6", 
      "#6366f1", "#8b5cf6", "#a855f7", 
      "#d946ef", "#ec4899", "#f43f5e"
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header with logo and back button */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-300">
        <div className="text-2xl font-bold tracking-[2px] text-gray-800">
          MAJIWAKARU
        </div>
        <button
          onClick={handleBack}
          className="w-12 h-12 rounded-full border-2 border-gray-500 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition"
          aria-label="Back"
          title="Back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      </header>

      {/* Two-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left column: group list */}
        <aside className="w-[28%] min-w-[260px] bg-white border-r-2 border-gray-300 flex flex-col overflow-y-auto">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-100">
            <h3 className="text-base font-semibold text-gray-800">グループ一覧</h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {chatBoxes.map((group) => {
              const isActive = group.group_id === parseInt(groupId);
              const hasImage = group.icon_url && group.icon_url.trim() !== "" && !group.icon_url.includes("ui-avatars.com");
              const bgColor = getBackgroundColor(group.group_name || "");

              return (
                <div
                  key={group.group_id}
                  className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors border-b border-gray-200 ${
                    isActive
                      ? "bg-sky-100 border-l-4 border-l-blue-500 text-blue-800 font-semibold"
                      : "hover:bg-sky-50 text-gray-700"
                  }`}
                  onClick={() => handleSelectGroup(group.group_id)}
                >
                  {hasImage ? (
                    <img
                      src={group.icon_url}
                      alt={group.group_name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-gray-100 bg-gray-50"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const nextSibling = e.target.nextElementSibling;
                        if (nextSibling) {
                           nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-base font-bold shadow-sm"
                      style={{ backgroundColor: bgColor }}
                    >
                      {getInitials(group.group_name)}
                    </div>
                  )}

                  {/* Fallback div */}
                  {hasImage && (
                    <div 
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-base font-bold shadow-sm"
                      style={{ display: 'none', backgroundColor: bgColor }}
                    >
                      {getInitials(group.group_name)}
                    </div>
                  )}

                  <span className="text-sm font-medium truncate">
                    {group.group_name}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right column: chat window */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <div className="text-lg font-semibold text-gray-800 truncate">
              {selectedGroup.group_name}
            </div>
          </div>

          <ChatArea
            group={selectedGroup}
            messages={messages}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            loadingMessages={loadingMessages}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

