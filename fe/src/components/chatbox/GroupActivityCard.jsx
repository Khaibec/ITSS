import { formatTimeAgo } from "../../utils/time";

const GroupActivityCard = ({ group, onClick }) => {
  const hasUnread = group.unread_count > 0;
  const unreadDisplay = group.unread_count >= 99 ? "99+" : group.unread_count;

  return (
    <div
      className={`border-2 rounded-lg p-4 mb-4 cursor-pointer transition-colors hover:bg-gray-50 bg-white relative ${
        hasUnread ? "border-red-500" : "border-transparent"
      }`}
      onClick={() => onClick(group.group_id)}
    >
      {/* Unread badge - top right corner */}
      {hasUnread && (
        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
          {unreadDisplay}
        </span>
      )}
      
      <div className="flex justify-between items-start pr-12">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 pr-2">
            {group.group_name}
          </h3>
          <p className="text-gray-700 text-sm line-clamp-2">
            {group.latest_message || "メッセージがありません"}
          </p>
        </div>
        <div className="text-right ml-4 shrink-0">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {formatTimeAgo(group.latest_message_time)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroupActivityCard;

