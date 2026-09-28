import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { isDark } = useTheme();
  const [session, setSession] = useState<any>(null);

  // Dummy login credentials state
  const [dummyEmail, setDummyEmail] = useState("test@test.com");
  const [dummyPassword, setDummyPassword] = useState("12345");
  const [dummyError, setDummyError] = useState("");

  const handleDummyLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (dummyEmail.trim().toLowerCase() === "test@test.com" && dummyPassword === "12345") {
      const mockSession = {
        user: {
          id: "dummy-user-123",
          email: "test@test.com",
          user_metadata: { first_name: "Test", last_name: "Student" }
        }
      };
      localStorage.setItem("deeco_dummy_session", JSON.stringify(mockSession));
      onLoginSuccess();
      onClose();
    } else {
      setDummyError("Invalid credentials. Please use test@test.com and 12345");
    }
  };

  // Handle auth state
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        onLoginSuccess();
        onClose();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        onLoginSuccess();
        onClose();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [onLoginSuccess, onClose]);

  // ESC key close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-[92%] max-w-md rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl p-6 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-full p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
          >
            ✕
          </button>

          {!session ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                  Welcome to <span className="text-black dark:text-white">DE-ECO</span>
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Log in to access your dashboard, classes & progress
                </p>
              </div>

              {/* Temporary Demo / Test Credentials Box */}
              <div className="mb-6 p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border-2 border-indigo-500/40 text-left shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Test Login (develop)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDummyEmail("test@test.com");
                      setDummyPassword("12345");
                      handleDummyLogin();
                    }}
                    className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline decoration-indigo-400 transition-colors"
                  >
                    ⚡ Quick 1-Click Login
                  </button>
                </div>

                <form onSubmit={handleDummyLogin} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={dummyEmail}
                      onChange={(e) => {
                        setDummyEmail(e.target.value);
                        setDummyError("");
                      }}
                      placeholder="test@test.com"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={dummyPassword}
                      onChange={(e) => {
                        setDummyPassword(e.target.value);
                        setDummyError("");
                      }}
                      placeholder="12345"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {dummyError && (
                    <p className="text-xs font-semibold text-rose-500">{dummyError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    Log In with Test Account
                  </button>
                </form>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  Or Regular Supabase Auth
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Auth Container */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 sm:p-6">
                <Auth
                  supabaseClient={supabase}
                  providers={["google"]}
                  theme={isDark ? "dark" : "default"}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: "#000000",
                          brandAccent: "#1e1e1e",
                          brandButtonText: "#ffffff",

                          defaultButtonBackground: isDark ? "#18181b" : "#ffffff",
                          defaultButtonBackgroundHover: isDark ? "#27272a" : "#f1f3f5",
                          defaultButtonBorder: isDark ? "#3f3f46" : "#dee2e6",
                          defaultButtonText: isDark ? "#f8fafc" : "#1e1e1e",

                          inputBackground: isDark ? "#18181b" : "#ffffff",
                          inputBorder: isDark ? "#3f3f46" : "#ced4da",
                          inputBorderHover: isDark ? "#71717a" : "#495057",
                          inputBorderFocus: isDark ? "#e5e7eb" : "#212529",
                          inputText: isDark ? "#f8fafc" : "#1e1e1e",
                          inputLabelText: isDark ? "#d4d4d8" : "#495057",
                          inputPlaceholder: isDark ? "#71717a" : "#868e96",

                          messageTextDanger: "#dc2626",
                        },
                      },
                    },
                    className: {
                      button: "rounded-xl font-semibold transition-all",
                      input: "rounded-xl transition-all",
                    },
                  }}
                />
              </div>

              {/* Footer */}
              
            </>
          ) : (
            <div className="py-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                You’re already logged in ✅
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Redirecting you to your dashboard…
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;
