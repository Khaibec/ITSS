import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call AuthContext.login which handles token storage and profile fetch
      await login({ email, password });
      navigate("/chatbox");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "ログインに失敗しました。メールとパスワードを確認してください。"
      );
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
        <div className="flex bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] w-full max-w-[900px] overflow-hidden min-h-[550px] flex-col md:flex-row">
          {/* Left Image Side */}
          <div className="flex-1 bg-gray-200 hidden md:block relative h-[150px] md:h-auto">
            <img
              src="https://images.pexels.com/photos/30159615/pexels-photo-30159615.jpeg?cs=srgb&dl=pexels-hokusai-509091422-30159615.jpg&fm=jpg"
              alt="Login visual"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Right Form Side */}
          <div className="flex-1 p-10 md:p-[40px_50px] flex flex-col justify-center">
            <h2 className="text-[26px] text-primary font-bold mb-2">MAJIWAKARUへようこそ</h2>
            <p className="text-base text-gray-800 font-bold mb-8">メールでログイン</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4 text-left">
                <label className="block mb-1.5 font-semibold text-sm text-gray-800">メール</label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-3.5 border border-transparent rounded-full bg-sky-50 text-[15px] transition-all focus:border-sky-400 focus:outline-none placeholder:text-gray-400"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block mb-1.5 font-semibold text-sm text-gray-800">パスワード</label>
                <input
                  type="password"
                  name="password"
                  className="w-full p-3.5 border border-transparent rounded-full bg-sky-50 text-[15px] transition-all focus:border-sky-400 focus:outline-none placeholder:text-gray-400"
                  placeholder="●●●●●●●●"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-xs mb-4 ml-2">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-500 text-white p-3.5 rounded-md font-bold text-base mt-2 mb-5 hover:bg-sky-600 transition-colors disabled:opacity-70"
              >
                {isLoading ? "処理中..." : "ログイン"}
              </button>
            </form>

            <div className="text-sm text-gray-800 text-center border-t border-gray-200 pt-5 mt-2">
              アカウントをお持ちでない方 /
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-sky-600 font-bold ml-1 hover:underline"
              >
                サインアップ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
