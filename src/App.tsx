
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CalmModeProvider } from "@/context/CalmModeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import FriendSearch from "./pages/FriendSearch";
import Groups from "./pages/Groups";
import Travels from "./pages/Travels";
import Events from "./pages/Events";
import News from "./pages/News";
import Messages from "./pages/Messages";
import MessagePreferences from "./pages/MessagePreferences";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ChatBubble from "./components/chat/ChatBubble";
import LiveSessions from "./pages/LiveSessions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <CalmModeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/friend-search" element={<FriendSearch />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/travels" element={<Travels />} />
                <Route path="/events" element={<Events />} />
                <Route path="/news" element={<News />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/message-preferences" element={<MessagePreferences />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/live-sessions" element={<LiveSessions />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatBubble />
            </BrowserRouter>
          </CalmModeProvider>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
