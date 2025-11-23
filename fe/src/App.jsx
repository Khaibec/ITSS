import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ChatLayout from "./components/chatbox/ChatLayout";
import Login from "./components/auth/Login";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <ChatLayout />
    </div>
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
