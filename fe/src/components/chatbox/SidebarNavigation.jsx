import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const SidebarNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const currentPath = location.pathname;

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
    }
  };

  const isActive = (path) => {
    if (path === "/chatbox/groups") {
      return currentPath === "/chatbox/groups" || currentPath.startsWith("/chatbox/groups/");
    }
    return currentPath === path;
  };

  return (
    <aside className="w-[280px] bg-white border-r-2 border-gray-300 flex flex-col h-full">
      {/* Chat Box Dropdown */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between cursor-pointer">
          <span className="text-base font-semibold text-gray-800">チャットボックス</span>
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1">
        <div
          className={`px-5 py-3 cursor-pointer transition-colors ${
            isActive("/chatbox/groups")
              ? "bg-gray-100 text-gray-900 font-semibold"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => navigate("/chatbox/groups")}
        >
          グループ一覧
        </div>

        <div
          className={`px-5 py-3 cursor-pointer transition-colors ${
            isActive("/chatbox/create-group")
              ? "bg-gray-100 text-gray-900 font-semibold"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => navigate("/chatbox/create-group")}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span>グループを作成</span>
          </div>
        </div>

        <div
          className={`px-5 py-3 cursor-pointer transition-colors ${
            isActive("/chatbox/diary")
              ? "bg-gray-100 text-gray-900 font-semibold"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => navigate("/chatbox/diary")}
        >
          学習日記
        </div>

        <div
          className={`px-5 py-3 cursor-pointer transition-colors ${
            isActive("/chatbox/profile")
              ? "bg-gray-100 text-gray-900 font-semibold"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => navigate("/chatbox/profile")}
        >
          プロフィール
        </div>
      </div>

      {/* Logout at bottom */}
      <div className="px-5 py-4 border-t border-gray-200">
        <div
          onClick={handleLogout}
          className="cursor-pointer hover:bg-gray-50 py-2 px-3 rounded transition-colors text-gray-700"
        >
          ログアウト
        </div>
      </div>
    </aside>
  );
};

export default SidebarNavigation;

