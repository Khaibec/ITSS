import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    nationality: "Vietnam",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(formData);
      // registration successful — redirect to login
      alert("登録が完了しました。ログインしてください。");
      navigate("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Registration failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-gray flex flex-col font-sans text-[#050505]">
      {/* Header */}
      <div className="bg-white px-10 h-[60px] flex items-center shadow-sm fixed w-full top-0 z-10">
        <div className="text-[22px] font-extrabold text-[#333] tracking-widest uppercase">
          Majiwakaru
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center pt-20 px-5">
        <div className="bg-white p-10 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] w-full max-w-[600px] text-center">
          <h2 className="text-[26px] text-primary font-bold mb-8">
            アカウントを作成
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              {/* Name */}
              <div className="mb-4">
                <label className="block mb-1.5 font-semibold text-sm text-gray-800">
                  名前
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3.5 border border-transparent rounded-full bg-sky-50 text-[15px] focus:border-sky-400 focus:outline-none placeholder:text-gray-400"
                  placeholder="山田 太郎"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block mb-1.5 font-semibold text-sm text-gray-800">
                  メール
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-3.5 border border-transparent rounded-full bg-sky-50 text-[15px] focus:border-sky-400 focus:outline-none placeholder:text-gray-400"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Nationality */}
              <div className="mb-4">
                <label className="block mb-1.5 font-semibold text-sm text-gray-800">
                  国籍
                </label>
                <select
                  name="nationality"
                  className="w-full p-3.5 border border-transparent rounded-full bg-sky-50 text-[15px] focus:border-sky-400 focus:outline-none"
                  value={formData.nationality}
                  onChange={handleChange}
                >
                  <option value="Vietnam">ベトナム</option>
                  <option value="Japan">日本</option>
                </select>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block mb-1.5 font-semibold text-sm text-gray-800">
                  パスワード
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-3.5 border border-transparent rounded-full bg-sky-50 text-[15px] focus:border-sky-400 focus:outline-none placeholder:text-gray-400"
                  placeholder="●●●●●●●●"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-500 text-white p-3.5 rounded-md font-bold text-base mt-5 mb-5 hover:bg-sky-600 transition-colors disabled:opacity-70"
            >
              {isLoading ? "処理中..." : "サインアップ"}
            </button>
          </form>

          <div className="text-sm text-gray-800 border-t border-gray-200 pt-5 mt-2">
            アカウントをお持ちの方 /
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sky-600 font-bold ml-1 hover:underline"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
