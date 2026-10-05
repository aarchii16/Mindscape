import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/students/ChatPage";
import BookingPage from "./pages/students/BookingPage";
import ResourcesPage from "./pages/students/ResourcesPage";
import ForumPage from "./pages/students/ForumPage";
import NotFound from "./pages/NotFound";
import BookingSuccessPage from "./pages/students/BookingSuccessPage";
import ProfilePage from "./pages/students/ProfilePage";
import AssessmentsPage from "./pages/students/AssessmentsPage";
import StudentChatPage from "./pages/students/StudentChatPage";
import BiometricsPage from "./pages/students/BiometricsPage";
import CounselorLayout from "./pages/counselors/CounselorLayout";
import CounselorDashboardPage from "./pages/counselors/CounselorDashboardPage";
import CounselorOnboardingPage from "./pages/counselors/CounselorOnboardingPage";
import CounselorAvailabilityPage from "./pages/counselors/CounselorAvailabilityPage";
import CounselorBookingsPage from "./pages/counselors/CounselorBookingsPage";
import CounselorChatPage from "./pages/counselors/CounselorChatPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isCounselorPage = location.pathname.startsWith('/counselor');

  return (
    <div className="relative">
      <ScrollToTop />
      {/* Header */}
      <Navigation />

      {/* Main content with padding to avoid overlap */}
      <main className="pt-20 pb-16">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route
            path="/booking"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <BookingPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/booking/success"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <BookingSuccessPage />
              </RoleProtectedRoute>
            }
          />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route
            path="/forum"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <ForumPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <ProfilePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/assessments"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <AssessmentsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/biometrics"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <BiometricsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/student/chat"
            element={
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentChatPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/counselor"
            element={
              <RoleProtectedRoute allowedRoles={['counselor']}>
                <CounselorLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<CounselorDashboardPage />} />
            <Route path="dashboard" element={<CounselorDashboardPage />} />
            <Route path="onboarding" element={<CounselorOnboardingPage />} />
            <Route path="availability" element={<CounselorAvailabilityPage />} />
            <Route path="bookings" element={<CounselorBookingsPage />} />
            <Route path="chat/:sessionId" element={<CounselorChatPage />} />
            <Route path="chat" element={<CounselorChatPage />} />
          </Route>
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
