import { useAuth } from "../../contexts/AuthContext";

const ChatHeader = ({ currentUser }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
    }
  };

  return (
    <header className="bg-white border-b-2 border-gray-300 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="text-2xl font-bold tracking-[2px] text-gray-800">
        MAJIWAKARU
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-full">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover"
          />
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

