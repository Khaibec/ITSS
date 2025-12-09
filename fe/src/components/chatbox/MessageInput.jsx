import { useState } from "react";
import ReviewModal from "./ReviewModal";
import { aiReviewAPI } from "../../services/api";

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleReview = async () => {
    if (!message.trim()) {
      alert("メッセージを入力してください");
      return;
    }

    setIsReviewOpen(true);
    setReviewLoading(true);
    setReviewResult(null);

    try {
      const result = await aiReviewAPI.reviewMessage(message);
      setReviewResult(result);
    } catch (error) {
      console.error(error);
      alert("Review failed");
      setIsReviewOpen(false);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      onSendMessage(message);
      setMessage("");
      setIsSending(false);
    }, 200);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3 px-6 py-4 bg-white border-t-2 border-gray-300">
      <textarea
        className="
          flex-1 px-4 py-2
          border-2 border-gray-300 rounded-lg
          text-sm resize-none
          min-h-[48px] max-h-[120px] overflow-y-auto
          transition-all
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10
          disabled:bg-gray-100 disabled:cursor-not-allowed
          placeholder:text-gray-300 placeholder:font-semibold
        "
        placeholder="メッセージを入力..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isSending}
        rows="2"
      />

      <div className="flex items-center gap-2">
        <button
          className="
            px-4 py-2 h-10
            bg-white border-2 border-gray-300 rounded-lg
            text-base font-semibold text-gray-700
            whitespace-nowrap
            transition-colors
            cursor-pointer
            hover:bg-gray-200 hover:border-gray-600
            active:bg-gray-100
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          onClick={handleReview}
          disabled={!message.trim() || isSending}
          title="メッセージをレビュー"
        >
          レビュー
        </button>

        <button
          className="
            w-10 h-10 shrink-0
            bg-gray-400 rounded-lg
            text-white
            flex items-center justify-center
            transition-all
            cursor-pointer
            hover:bg-sky-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30
            active:translate-y-0 active:shadow-md active:shadow-primary/30
            disabled:bg-gray-300 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
          "
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          title="送信"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <ReviewModal
        open={isReviewOpen}
        message={message}
        reviewResult={reviewResult}
        loading={reviewLoading}
        onClose={() => setIsReviewOpen(false)}
      />
    </div>
  );
};

export default MessageInput;

