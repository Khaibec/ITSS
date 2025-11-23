import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="flex flex-col gap-6 items-center justify-center h-full text-gray-600 font-semibold text-center">
          <div className="text-3xl">まだメッセージがありません</div>
          <small className="mt-2 text-base text-gray-400">
            最初のメッセージを送信してください
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-thin">
      <div className="p-6 flex flex-col">
        {messages.map((message) => (
          <MessageItem
            key={message.message_id}
            message={message}
            isOwnMessage={message.sender?.user_id === currentUser.user_id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;

