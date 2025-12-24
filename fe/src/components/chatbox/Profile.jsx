import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/api";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const autoHideTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fetch full profile from API
        const profile = await authAPI.getProfile();
        setUser(profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback to auth context user if API fails
        if (authUser) {
          setUser(authUser);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  // Auto-hide password after 5 seconds
  useEffect(() => {
    if (showPassword) {
      // Clear existing timeout
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }

      // Set new timeout to auto-hide after 5 seconds
      autoHideTimeoutRef.current = setTimeout(() => {
        setShowPassword(false);
      }, 5000);
    }

    // Cleanup on unmount
    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, [showPassword]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get nationality display name
  const getNationalityDisplay = (nationality) => {
    if (!nationality) return "";
    // Map nationality codes to Japanese names if needed
    const nationalityMap = {
      vietnam: "ベトナム",
      japan: "日本",
      vietnamese: "ベトナム",
      japanese: "日本",
    };
    return nationalityMap[nationality.toLowerCase()] || nationality || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">ユーザー情報を取得できませんでした</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">プロフィール</h2>

      <div className="space-y-6">
        {/* ユーザー名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ユーザー名
          </label>
          <input
            type="text"
            value={user.name || ""}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
          />
        </div>

        {/* パスワード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            パスワード
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={
                showPassword
                  ? "セキュリティ上の理由でパスワードは表示できません"
                  : "●●●●●●●●"
              }
              readOnly
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              title={showPassword ? "パスワードを非表示" : "パスワードを表示"}
            >
              {!showPassword ? (
                // Eye icon (password hidden - click to show)
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                // Eye-off icon (password visible - click to hide)
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.975 9.975 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 3.029m-5.858-.908a3 3 0 01-4.243-4.243M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* メールアドレス */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={user.email || ""}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
          />
        </div>

        {/* 国籍 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            国籍
          </label>
          <input
            type="text"
            value={getNationalityDisplay(user.nationality) || ""}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
