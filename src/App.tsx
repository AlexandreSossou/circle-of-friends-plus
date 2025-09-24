
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/language";
import { CalmModeProvider } from "@/context/CalmModeContext";
import { ProfileTypeProvider } from "@/context/ProfileTypeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterTest from "./pages/RegisterTest";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import FriendSearch from "./pages/FriendSearch";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Travels from "./pages/Travels";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import LocalAlerts from "./pages/LocalAlerts";
import News from "./pages/News";
import Messages from "./pages/Messages";
import MessagePreferences from "./pages/MessagePreferences";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ChatBubble from "./components/chat/ChatBubble";
import LiveSessions from "./pages/LiveSessions";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <CalmModeProvider>
            <ProfileTypeProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                  <Route path="/friend-search" element={<ProtectedRoute><FriendSearch /></ProtectedRoute>} />
                  <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                  <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
                  <Route path="/travels" element={<ProtectedRoute><Travels /></ProtectedRoute>} />
                  <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                  <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
                  <Route path="/announcements" element={<ProtectedRoute><LocalAlerts /></ProtectedRoute>} />
                  <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/message-preferences" element={<ProtectedRoute><MessagePreferences /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="/live-sessions" element={<ProtectedRoute><LiveSessions /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ProtectedRoute>
                  <ChatBubble />
                </ProtectedRoute>
              </BrowserRouter>
            </ProfileTypeProvider>
          </CalmModeProvider>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
