import React, { useEffect, useState, useRef } from 'react';

const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    // Parse the target number
    const target = parseFloat(end.toString().replace(/[^0-9.]/g, ''));
    const hasDecimals = end.toString().includes('.');

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime = null;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Ease out quart animation
            const easeOutProgress = 1 - Math.pow(1 - progress, 4);
            const currentCount = target * easeOutProgress;

            setCount(currentCount);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [target, duration, isVisible]);

    const formattedCount = hasDecimals
        ? count.toFixed(1)
        : Math.round(count).toString();

    return (
        <span ref={countRef}>
            {prefix}{formattedCount}{suffix}
        </span>
    );
};

export default AnimatedCounter;
