import React, { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../styles/colors";
import { LanguageSelector } from "./LanguageSelector";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  onLogout,
}) => {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= NAV ITEMS ================= */

  const navItems = [
    { id: "home", label: "Home" },
    { id: "courses", label: "Courses" },
    { id: "live-classes", label: "Live Classes" },
    { id: "exams", label: "Exams" },
    { id: "market-pulse", label: "MarketPulse" }, // ✅ NEW TAB
    { id: "ai-hub", label: "AI Hub" },
    //{ id: "about", label: "About Us" },
    { id: "contact", label: "Contact Us" },
  ];

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  const pillBg = (active: boolean) =>
    active
      ? isScrolled
        ? `${themeColors.background.white}f2`
        : themeColors.background.white
      : "transparent";

  const pillColor = (active: boolean) =>
    active
      ? themeColors.text.primary
      : isScrolled
      ? `${themeColors.text.white}e6`
      : themeColors.text.white;

  const navItemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.03 },
    }),
    hover: { scale: 1.04 },
  };

  return (
    <>
      {/* ================= DESKTOP NAV ================= */}
      {/* ================= DESKTOP NAV ================= */}
      <nav className="fixed top-3 left-3 right-3 z-50 hidden md:block">

        <div className="flex items-center justify-between">
          {/* LOGO */}
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="flex items-center gap-3"
          >
            <div
              className="bg-white rounded-full p-2 lg:p-3 shadow-lg border-2 transition-opacity duration-300"
              style={{
                borderColor: themeColors.primary.black,
                opacity: isScrolled ? 0.85 : 1,
              }}
            >
              <img
                src="/logo/De-Eco-logo.png"
                alt="DE-ECO Logo"
                className="w-12 h-12 lg:w-16 lg:h-16 object-contain"
              />
            </div>

            <div
              className="leading-tight transition-opacity duration-300 overflow-hidden"
              style={{
                opacity: isScrolled ? 0 : 1,
                maxWidth: isScrolled ? "0px" : "200px",
                transition: "opacity 0.3s ease, max-width 0.3s ease",
              }}
            >
              <div
                className="text-lg lg:text-xl font-extrabold tracking-tight whitespace-nowrap"
                style={{ color: themeColors.text.primary }}
              >
                DE-ECO
              </div>
              <div
                className="text-xs whitespace-nowrap"
                style={{ color: `${themeColors.text.primary}cc` }}
              >
                Education • Sustainability
              </div>
            </div>
          </motion.div>

          {/* NAVBAR */}
          <motion.nav
            className="rounded-full px-4 py-2 shadow-2xl transition-all duration-300 flex items-center gap-3"
            style={{
              background: isScrolled
                ? `linear-gradient(90deg, ${themeColors.primary.black}dd, ${themeColors.primary.darkGray}bb)`
                : themeColors.primary.black,
              border: isScrolled
                ? `1px solid ${themeColors.primary.darkGray}55`
                : "none",
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  custom={idx}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  onClick={() => handlePageChange(item.id)}
                  className="relative px-4 py-2 text-sm font-semibold rounded-full transition-all"
                  style={{
                    backgroundColor: pillBg(currentPage === item.id),
                    color: pillColor(currentPage === item.id),
                  }}
                >
                  {item.label}

                  {/* ACTIVE INDICATOR */}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 bottom-1 h-0.5 rounded-full transition-all ${
                      currentPage === item.id
                        ? "w-10 opacity-100"
                        : "w-0 opacity-0"
                    }`}
                    style={{
                      background: `linear-gradient(90deg, ${themeColors.primary.black}, ${themeColors.primary.darkGray})`,
                    }}
                  />
                </motion.button>
              ))}

              {/* LANGUAGE SELECTOR */}
              <LanguageSelector variant="navbar" />

              {/* LOGOUT */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={onLogout}
                className="px-3 py-2 text-sm font-semibold rounded-full flex items-center gap-2"
                style={{
                  color: isScrolled
                    ? `${themeColors.text.white}e6`
                    : themeColors.text.white,
                }}
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </motion.button>
            </div>
          </motion.nav>
        </div>
      </nav>

      {/* ================= MOBILE NAV ================= */}
      <nav className="fixed top-3 left-3 right-3 z-50 md:hidden">
        <div
          className="rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between backdrop-blur-sm transition-colors"
          style={{
            backgroundColor: isScrolled
              ? `${themeColors.primary.black}dd`
              : `${themeColors.primary.black}ee`,
            border: `1px solid ${themeColors.primary.darkGray}44`,
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="bg-white rounded-full p-1.5 shadow-md border-2"
              style={{ borderColor: themeColors.primary.black }}
            >
              <img
                src="/logo/De-Eco-logo.png"
                alt="DE-ECO Logo"
                className="w-9 h-9 object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <div
                className="text-sm font-bold"
                style={{ color: themeColors.text.primary }}
              >
                DE-ECO
              </div>
            </div>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg"
            style={{
              color: isScrolled
                ? `${themeColors.text.white}e6`
                : themeColors.text.white,
            }}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl px-4 py-3 shadow-2xl max-h-[82vh] overflow-y-auto overscroll-contain"
            style={{
              backgroundColor: `${themeColors.primary.black}ee`,
              border: `1px solid ${themeColors.primary.darkGray}40`,
            }}
          >
            <div className="grid gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className="w-full text-left px-4 py-2 rounded-lg font-semibold"
                  style={{
                    backgroundColor:
                      currentPage === item.id
                        ? `${themeColors.background.white}f2`
                        : "transparent",
                    color:
                      currentPage === item.id
                        ? themeColors.text.primary
                        : `${themeColors.text.white}e6`,
                  }}
                >
                  {item.label}
                </button>
              ))}

              {/* LANGUAGE SELECTOR */}
              <div className="py-1">
                <LanguageSelector isMobile />
              </div>

              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                style={{ color: `${themeColors.text.white}e6` }}
              >
                <User className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Spacer for mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
};
