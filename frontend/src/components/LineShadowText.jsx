import { motion } from "motion/react";

/**
 * LineShadowText — ported from MagicUI for Vite/React (no Next.js needed)
 *
 * Props:
 *  - children: string (required)
 *  - shadowColor: string (default "black")
 *  - className: string
 *  - as: element type (default "span")
 */
export function LineShadowText({
    children,
    shadowColor = "black",
    className = "",
    as: Component = "span",
    ...props
}) {
    const MotionComponent = motion.create(Component);
    const content = typeof children === "string" ? children : null;

    if (!content) {
        throw new Error("LineShadowText only accepts string children");
    }

    return (
        <MotionComponent
            style={{ "--shadow-color": shadowColor }}
            className={[
                "relative z-0 inline-flex",
                // The diagonal line-shadow pseudo element
                "after:absolute after:top-[0.04em] after:left-[0.04em]",
                "after:content-[attr(data-text)]",
                "after:bg-[linear-gradient(45deg,transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]",
                "after:-z-10 after:bg-[length:0.06em_0.06em] after:bg-clip-text after:text-transparent",
                "after:animate-line-shadow",
                className,
            ].join(" ")}
            data-text={content}
            {...props}
        >
            {content}
        </MotionComponent>
    );
}
