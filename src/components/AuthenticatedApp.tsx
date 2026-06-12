import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Navigation } from "./Navigation";
import { HomePage } from "./pages/HomePage";
import { CoursesPage } from "./pages/CoursesPage";
import { LiveClassesPage } from "./pages/LiveClassesPage";
import { AIHubPage } from "./pages/AIHubPage";
import ContactPage  from "./pages/ContactPage";
import { AboutUsPage } from "./pages/AboutUsPage";
import MarketPulsePage from "./pages/MarketPulsePage";
import ProfileCompletionModal from "./ProfileCompletionModal";
import { Footer } from "./Footer";
import { colors, getPriorityColor, getThemeColors } from '../styles/colors';
import { useTheme } from '../contexts/ThemeContext';

interface AuthenticatedAppProps {
  onLogout: () => void;
}

export const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-bg",
      themeColors.primary.lightGray
    );
  }, [themeColors]);


  useEffect(() => {
  // Always scroll to top on page change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // use "smooth" if you want animation
    });
  }, [currentPage]);


  useEffect(() => {
    const checkProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, last_visit_date, current_streak")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      if (!data?.first_name || !data?.last_name || !data?.phone) {
        setProfileIncomplete(true);
      }

      // Handle Visit Streak Tracking
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
      let newStreak = data.current_streak || 0;
      let newLastVisit = data.last_visit_date;

      if (!newLastVisit) {
        newStreak = 1;
        newLastVisit = todayStr;
      } else if (newLastVisit !== todayStr) {
        const today = new Date(todayStr);
        const lastVisit = new Date(newLastVisit);
        
        const diffTime = today.getTime() - lastVisit.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        } else if (diffDays < 0) {
          // If somehow last_visit is in the future, fix it
          newStreak = 1;
        }
        newLastVisit = todayStr;
      }

      if (newLastVisit !== data.last_visit_date || newStreak !== data.current_streak) {
        await supabase
          .from("profiles")
          .update({ last_visit_date: newLastVisit, current_streak: newStreak })
          .eq("id", user.id);
      }
    };

    checkProfile();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        // ✅ PASS NAVIGATION HANDLER TO HOME
        return <HomePage onNavigate={setCurrentPage} />;

      case "courses":
        return <CoursesPage onPageChange={setCurrentPage} />;

      case "live-classes":
        return <LiveClassesPage onPageChange={setCurrentPage} />;

      case "ai-hub":
        return <AIHubPage />;

      case "market-pulse":
        return <MarketPulsePage />;

      case "contact":
        return <ContactPage />;

      case "about":
        return <AboutUsPage />;

      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: themeColors.primary.lightGray }}
    >
      {profileIncomplete && userId ? (
        <ProfileCompletionModal
          userId={userId}
          onComplete={() => setProfileIncomplete(false)}
        />
      ) : (
        <>
         <>
          <Navigation
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={onLogout}
          />

          {renderPage()}

          <Footer onNavigate={setCurrentPage} />
        </>

        </>
      )}
    </div>
  );
};
