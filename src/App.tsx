import React, { useState, useEffect } from "react";
import { AboutSlides } from "./components/AboutSlides";
import { AuthenticatedApp } from "./components/AuthenticatedApp";
import LoginModal from "./components/LoginModal";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ThemeControls } from "./components/ThemeControls";
import { supabase } from "./lib/supabaseClient";
import { SplashScreen } from "./components/SplashScreen";

function App() {
  const [session, setSession] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Load session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <ThemeControls />
      {session ? (
        <AuthenticatedApp onLogout={handleLogout} />
      ) : (
        <>
          <AboutSlides onLogin={() => setShowLogin(true)} />
          <LoginModal
            isOpen={showLogin}
            onClose={() => setShowLogin(false)}
            onLoginSuccess={() => setSession(true)}
          />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;