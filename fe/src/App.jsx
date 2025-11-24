import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ChatLayout from "./components/chatbox/ChatLayout";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import { Routes, Route, Navigate } from "react-router-dom";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/chatbox" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/chatbox" replace /> : <Signup />}
      />
      <Route
        path="/chatbox"
        element={isAuthenticated ? <ChatLayout /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/chatbox" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
