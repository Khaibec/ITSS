import { useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import GroupList from "./GroupList";
import ChatArea from "./ChatArea";
import { chatBoxesAPI, getToken } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { getUserFromToken } from "../../utils/jwt";

const ChatLayout = () => {
  const { logout } = useAuth();
  const [chatBoxes, setChatBoxes] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

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
          setError('Failed to load chat boxes');
        }
      } catch (err) {
        console.error('Error fetching chat boxes:', err);
        setError(err.message || 'Failed to load chat boxes');
        // If unauthorized, logout user
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChatBoxes();
  }, [logout]);

  // Fetch messages when group is selected
  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchMessages = async () => {
      // Don't fetch if messages already exist for this group
      if (messages[selectedGroupId]) return;

      try {
        setLoadingMessages(true);
        const response = await chatBoxesAPI.getMessages(selectedGroupId);
        
        if (response.success && response.data) {
          setMessages((prev) => ({
            ...prev,
            [selectedGroupId]: response.data,
          }));
        } else {
          console.error('Failed to load messages');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        // If unauthorized, logout user
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          logout();
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedGroupId]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
  };

  const handleSendMessage = (content) => {
    // TODO: Implement send message API call
    // For now, just show a message
    console.log('Send message:', content);
    alert('Chức năng gửi tin nhắn sẽ được thêm ở sprint sau');
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
          <div className="text-sm text-gray-400">グループに参加してください</div>
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

