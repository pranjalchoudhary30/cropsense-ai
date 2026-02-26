import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

export const AnimatedThemeToggler = ({
    className,
    duration = 500,
    ...props
}) => {
    const [isDark, setIsDark] = useState(false);
    const buttonRef = useRef(null);

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return;

        // Snapshot the CURRENT direction BEFORE toggle
        const goingDark = !isDark;

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const maxRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        // No View Transitions API support — just toggle
        if (!document.startViewTransition) {
            setIsDark(goingDark);
            document.documentElement.classList.toggle("dark");
            localStorage.setItem("theme", goingDark ? "dark" : "light");
            return;
        }

        // Use a data attribute so CSS can adjust z-index per direction
        document.documentElement.setAttribute(
            "data-theme-transition",
            goingDark ? "to-dark" : "to-light"
        );

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                setIsDark(goingDark);
                document.documentElement.classList.toggle("dark");
                localStorage.setItem("theme", goingDark ? "dark" : "light");
            });
        });

        await transition.ready;

        // Always animate the NEW layer expanding — works for both directions.
        // For dark→light the new layer is light/white, expanding over the dark.
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        );

        await transition.finished;
        document.documentElement.removeAttribute("data-theme-transition");
    }, [isDark, duration]);

    return (
        <button
            ref={buttonRef}
            onClick={toggleTheme}
            className={`flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-main dark:text-gray-200 ${className || ""}`}
            title="Toggle theme"
            {...props}
        >
            <span className="material-symbols-outlined">
                {isDark ? "light_mode" : "dark_mode"}
            </span>
            <span className="sr-only">Toggle theme</span>
        </button>
    );
};
