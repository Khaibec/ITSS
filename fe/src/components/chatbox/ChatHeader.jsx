import { useAuth } from "../../contexts/AuthContext";

const ChatHeader = ({ currentUser }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
    }
  };

  // Function to generate initials from name
  const getInitials = (name) => {
    if (!name) return "U";
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

  const hasImage = currentUser.avatar && currentUser.avatar.trim() !== "" && !currentUser.avatar.includes("ui-avatars.com");
  const bgColor = getBackgroundColor(currentUser.name || "");

  return (
    <header className="bg-white border-b-2 border-gray-300 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="text-2xl font-bold tracking-[2px] text-gray-800">
        MAJIWAKARU
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-full">
          {hasImage ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-gray-100"
              onError={(e) => {
                e.target.style.display = 'none';
                // Show the fallback div which is the next sibling
                const nextSibling = e.target.nextElementSibling;
                if (nextSibling) {
                   nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : (
            <div 
              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ backgroundColor: bgColor }}
            >
              {getInitials(currentUser.name)}
            </div>
          )}

          {/* Fallback div */}
          {hasImage && (
            <div 
              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ display: 'none', backgroundColor: bgColor }}
            >
              {getInitials(currentUser.name)}
            </div>
          )}

          <span className="text-base font-medium text-gray-700">
            {currentUser.name}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;

