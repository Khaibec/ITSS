import { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ExplainModal from "./ExplainModal";
import { chatAPI } from "../../services/api";

const ChatArea = ({
  group,
  messages,
  currentUser,
  onSendMessage,
  loadingMessages,
}) => {
  // State quản lý modal AI explain
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);

  // Hàm xử lý callback khi user click "?"
  const [currentSender, setCurrentSender] = useState(null);

  //cache
  const [explainCache, setExplainCache] = useState({});

  const handleExplain = async (msg) => {
    const messageId = msg.message_id;

    setCurrentMessage(msg.content);
    setCurrentSender(msg.sender);
    setIsExplainOpen(true);

    // Nếu trong cache có rồi → dùng luôn, không gọi API
    if (explainCache[messageId]) {
      setExplanation(explainCache[messageId]);
      setLoadingExplain(false);
      return;
    }

    // Nếu chưa có → gọi API
    setLoadingExplain(true);
    setExplanation("");

    try {
      const res = await chatAPI.explainMessage(messageId);

      // Lưu cache
      setExplainCache((prev) => ({
        ...prev,
        [messageId]: res.explanation,
      }));

      setExplanation(res.explanation);

    } catch (err) {
      setExplanation("AI が説明を取得できませんでした。");
    } finally {
      setLoadingExplain(false);
    }
  };


  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-lg">グループを選択してください</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="relative flex-1 overflow-y-auto">

        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-600">メッセージを読み込み中...</div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUser={currentUser}
            onExplain={handleExplain}
          />
        )}

        <ExplainModal
          open={isExplainOpen}
          message={currentMessage}
          sender={currentSender}
          explanation={explanation}
          loading={loadingExplain}
          onClose={() => setIsExplainOpen(false)}
        />
      </div>

      <MessageInput onSendMessage={onSendMessage} groupId={group?.group_id} />
    </div>
  );
};

export default ChatArea;

