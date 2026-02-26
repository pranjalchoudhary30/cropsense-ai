import { useRef, useCallback } from 'react';

/**
 * MagicCard – mouse-tracking radial gradient spotlight (MagicUI port)
 * Works in plain React/Vite, no Next.js or shadcn required.
 */
const MagicCard = ({
    children,
    className = '',
    gradientColor = 'rgba(16,185,129,0.12)',   // primary green tint by default
    gradientSize = 400,
    style = {},
}) => {
    const cardRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--magic-x', `${x}px`);
        card.style.setProperty('--magic-y', `${y}px`);
    }, []);

    const handleMouseLeave = useCallback(() => {
        const card = cardRef.current;
        if (!card) return;
        // Move gradient off-screen so it fades out
        card.style.setProperty('--magic-x', `-${gradientSize}px`);
        card.style.setProperty('--magic-y', `-${gradientSize}px`);
    }, [gradientSize]);

    return (
        <div
            ref={cardRef}
            className={`magic-card ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                '--magic-gradient-color': gradientColor,
                '--magic-gradient-size': `${gradientSize}px`,
                '--magic-x': `-${gradientSize}px`,
                '--magic-y': `-${gradientSize}px`,
                position: 'relative',
                overflow: 'hidden',
                ...style,
            }}
        >
            {/* Spotlight layer */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(var(--magic-gradient-size) circle at var(--magic-x) var(--magic-y), var(--magic-gradient-color), transparent 100%)`,
                    pointerEvents: 'none',
                    transition: 'background 0ms',
                    zIndex: 0,
                }}
            />
            {/* Content sits above the spotlight */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                {children}
            </div>
        </div>
    );
};

export default MagicCard;
