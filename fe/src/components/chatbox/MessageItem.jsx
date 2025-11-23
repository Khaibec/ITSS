import { useState } from "react";

const MessageItem = ({ message, isOwnMessage }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalysisClick = () => {
    setShowAnalysis(!showAnalysis);
    alert("Chức năng đang phát triển" + "\n" + "Sẽ được thêm ở sprint sau");
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate avatar URL if not provided
  const getAvatarUrl = (sender) => {
    if (sender?.avatar) return sender.avatar;
    if (sender?.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.name)}&background=4F46E5&color=fff`;
    }
    if (sender?.email) {
      const name = sender.email.split('@')[0];
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`;
    }
    return `https://ui-avatars.com/api/?name=User&background=gray&color=fff`;
  };

  const senderName = message.sender?.name || message.sender?.email || 'Unknown User';
  const avatarUrl = getAvatarUrl(message.sender);

  return (
    <div
      className={`
        flex gap-3 mb-4 items-end
        ${isOwnMessage ? "flex-row-reverse" : ""}
      `}
    >
      <img
        src={avatarUrl}
        alt={senderName}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />

      <div
        className={`
          max-w-[60%] flex flex-col
          ${isOwnMessage ? "items-end" : ""}
        `}
      >
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 mb-1 pl-3">
            {senderName}
          </div>
        )}

        <div
          className={`
            flex gap-2 items-center
            ${isOwnMessage ? "flex-row-reverse" : ""}
          `}
        >
          <div
            className={`
              px-4 py-3 rounded-[18px] break-all relative
              ${
                isOwnMessage
                  ? "bg-sky-50 border-2 border-blue-200 rounded-br-[4px]"
                  : "bg-white border-2 border-gray-300 rounded-bl-[4px]"
              }
            `}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
            <div className="text-[10px] text-gray-400 mt-1 text-right">
              {formatTime(message.created_at)}
            </div>
          </div>

          <button
            className="
              w-7 h-7 rounded-full border border-gray-300 bg-white
              text-gray-500 text-sm font-bold
              flex items-center justify-center shrink-0 cursor-pointer
              transition-all hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 hover:scale-110
              active:scale-95
            "
            onClick={handleAnalysisClick}
            title="メッセージを分析"
          >
            ?
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

