import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainLayout from "./components/chatbox/MainLayout";
import GroupListDashboard from "./components/chatbox/GroupListDashboard";
import ChatInterface from "./components/chatbox/ChatInterface";
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
        element={isAuthenticated ? <Navigate to="/chatbox/groups" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/chatbox/groups" replace /> : <Signup />}
      />
      {/* New routes with MainLayout */}
      <Route
        path="/chatbox/groups"
        element={
          isAuthenticated ? (
            <MainLayout>
              <GroupListDashboard />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chatbox/groups/:groupId"
        element={
          isAuthenticated ? (
            <MainLayout>
              <ChatInterface />
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* Legacy route - redirect to new route */}
      <Route
        path="/chatbox"
        element={isAuthenticated ? <Navigate to="/chatbox/groups" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/chatbox/groups" replace /> : <Navigate to="/login" replace />}
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
