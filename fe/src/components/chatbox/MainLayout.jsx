import { useState, useEffect, cloneElement } from "react";
import { getToken } from "../../services/api";
import { getUserFromToken } from "../../utils/jwt";
import ChatHeader from "./ChatHeader";
import SidebarNavigation from "./SidebarNavigation";

const MainLayout = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const user = getUserFromToken(token);
      setCurrentUser(user);
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // Pass currentUser to children if they need it
  const childrenWithProps = typeof children === 'object' && children !== null
    ? cloneElement(children, { currentUser })
    : children;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <ChatHeader currentUser={currentUser} />
      <div className="flex-1 flex overflow-hidden">
        <SidebarNavigation />
        {childrenWithProps}
      </div>
    </div>
  );
};

export default MainLayout;

