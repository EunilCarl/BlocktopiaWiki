"use client";

import { Moon, SunDim } from "lucide-react";
import { useState, useRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

export const AnimatedThemeToggler = ({ className }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const buttonRef = useRef(null);

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const toggleDark = () => {
      const dark = document.documentElement.classList.toggle("dark");
      setIsDarkMode(dark);
    };

    // Check if startViewTransition is supported
    if (document.startViewTransition) {
      await document.startViewTransition(() => {
        flushSync(toggleDark);
      }).ready;
    } else {
      // Fallback for iOS / unsupported browsers
      toggleDark();

      // Simple scale animation on the button itself
      buttonRef.current.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.2)" },
          { transform: "scale(1)" },
        ],
        { duration: 300, easing: "ease-in-out" }
      );
    }

    // Circle animation for supported browsers
    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    if (CSS.supports("clip-path", "circle(50% at 50% 50%)") && document.startViewTransition) {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRad}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    }
  };

  return (
    <button ref={buttonRef} onClick={changeTheme} className={cn(className)}>
      {isDarkMode ? <SunDim /> : <Moon />}
    </button>
  );
};
