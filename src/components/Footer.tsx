import React from "react";
import { Mail, Phone, Instagram, Linkedin } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../styles/colors";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  return (
    <div className="container mx-auto px-4 sm:px-6 pb-10">
      <footer
        className="rounded-3xl border shadow-2xl"
        style={{
          backgroundColor: themeColors.primary.black,
          borderColor: themeColors.primary.black,
          color: themeColors.text.white,
        }}
      >
        <div className="px-6 sm:px-8 lg:px-10 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="text-2xl font-bold">DE-ECO</h3>
            <p className="text-sm" style={{ color: themeColors.text.white }}>
              Simplifying economics, finance, maths & statistics through structured learning.
            </p>

            <div className="flex gap-3 justify-center sm:justify-start">
              <a
                href="https://chat.whatsapp.com/FzCODHVaAnFEoYgKjMEgM7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-md hover:scale-110 transition"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <i className="fa-brands fa-whatsapp text-sm" />
              </a>

              <a
                href="https://instagram.com/deeco.official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-md hover:scale-110 transition"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://linkedin.com/company/deeco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-md hover:scale-110 transition"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate("home")}>Home</button></li>
              <li><button onClick={() => onNavigate("courses")}>Courses</button></li>
              <li><button onClick={() => onNavigate("live-classes")}>Live Classes</button></li>
              <li><button onClick={() => onNavigate("ai-hub")}>AI Hub</button></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate("market-pulse")}>Market Pulse</button></li>
              {/*<li><button onClick={() => onNavigate("about")}>About Us</button></li>*/}
              <li><button onClick={() => onNavigate("contact")}>Contact</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left space-y-3">
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              deecobyrishika@gmail.com
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              +91 9903996663
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex justify-between text-sm opacity-60">
          <p>© {new Date().getFullYear()} DE-ECO. All rights reserved.</p>
          <span>Privacy • Terms</span>
        </div>
      </div>
    </footer>
    </div>
  );
};
