import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatBoxesAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import GroupActivityCard from "./GroupActivityCard";

const GroupListDashboard = ({ currentUser = null }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatBoxesAPI.getChatBoxes();

        if (response.success && response.data) {
          setGroups(response.data);
        } else {
          setError("チャットボックスの取得に失敗しました");
        }
      } catch (err) {
        console.error("Error fetching chat boxes:", err);
        setError(err.message || "チャットボックスの取得に失敗しました");
        
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

    fetchGroups();
  }, [logout]);

  const handleCardClick = (groupId) => {
    navigate(`/chatbox/groups/${groupId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Welcome Box */}
      <div className="mt-6 ml-8">
        <p className="text-left text-2xl font-bold text-gray-800">
          こんにちは、{currentUser?.name || "ユーザー"}さん。
        </p>
      </div>

      {/* Group Cards */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="text-center text-gray-600 py-8">
            読み込み中...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            {error}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            グループがありません
          </div>
        ) : (
          groups.map((group) => (
            <GroupActivityCard
              key={group.group_id}
              group={group}
              onClick={handleCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GroupListDashboard;

