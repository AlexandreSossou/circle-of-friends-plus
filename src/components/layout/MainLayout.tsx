
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import ChatBubble from "../chat/ChatBubble";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-social-gray">
      <Navbar />
      <div className="container mx-auto pt-16 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="hidden lg:block lg:w-1/4 sticky top-20">
            <Sidebar />
          </div>
          <main className="w-full lg:w-2/4">{children}</main>
          <div className="hidden lg:block lg:w-1/4 sticky top-20">
            <RightSidebar />
          </div>
        </div>
      </div>
      <ChatBubble />
    </div>
  );
};

export default MainLayout;
