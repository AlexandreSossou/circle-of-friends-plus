
import { ReactNode } from "react";
import Navbar from "./navbar";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import { useCalmMode } from "@/context/CalmModeContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { calmMode } = useCalmMode();
  
  return (
    <div className={`min-h-screen bg-social-gray ${calmMode ? 'bg-calm-background' : ''}`}>
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
    </div>
  );
};

export default MainLayout;
