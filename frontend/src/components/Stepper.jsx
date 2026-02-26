import React, { useState, useRef, useEffect, Children } from "react";
import "./Stepper.css";

function Step({ children }) {
    return <div className="step-default">{children}</div>;
}

function Stepper({
    children,
    initialStep = 1,
    onStepChange,
    onFinalStepCompleted,
    backButtonText = "Previous",
    nextButtonText = "Next",
}) {
    const steps = Children.toArray(children);
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [direction, setDirection] = useState("next");
    const contentRef = useRef(null);

    const isFirst = currentStep === 1;
    const isLast = currentStep === steps.length;

    useEffect(() => {
        if (contentRef.current) {
            const el = contentRef.current;
            el.style.animation = "none";
            el.offsetHeight; // reflow
            el.style.animation =
                direction === "next"
                    ? "slideInFromRight 0.3s ease forwards"
                    : "slideInFromLeft 0.3s ease forwards";
        }
    }, [currentStep, direction]);

    const handleNext = () => {
        if (isLast) {
            onFinalStepCompleted?.();
            return;
        }
        setDirection("next");
        const next = currentStep + 1;
        setCurrentStep(next);
        onStepChange?.(next);
    };

    const handleBack = () => {
        if (isFirst) return;
        setDirection("prev");
        const prev = currentStep - 1;
        setCurrentStep(prev);
        onStepChange?.(prev);
    };

    const handleStepClick = (idx) => {
        const step = idx + 1;
        if (step < currentStep) {
            setDirection("prev");
            setCurrentStep(step);
            onStepChange?.(step);
        }
    };

    return (
        <div className="step-circle-container">
            {/* Step indicator row */}
            <div className="step-indicator-row">
                {steps.map((_, idx) => {
                    const stepNum = idx + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;

                    return (
                        <React.Fragment key={idx}>
                            <button
                                className="step-indicator"
                                onClick={() => handleStepClick(idx)}
                            >
                                <div
                                    className="step-indicator-inner"
                                    style={{
                                        backgroundColor: isActive || isCompleted
                                            ? "var(--color-primary)"
                                            : "transparent",
                                        border: isActive || isCompleted
                                            ? "none"
                                            : "2px solid #52525b",
                                        color: isActive || isCompleted ? "#fff" : "#a3a3a3",
                                    }}
                                >
                                    {isCompleted ? (
                                        <svg className="check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : isActive ? (
                                        <div className="active-dot" />
                                    ) : (
                                        <span className="step-number">{stepNum}</span>
                                    )}
                                </div>
                            </button>
                            {idx < steps.length - 1 && (
                                <div className="step-connector">
                                    <div
                                        className="step-connector-inner"
                                        style={{
                                            width: stepNum < currentStep ? "100%" : "0%",
                                            backgroundColor: "var(--color-primary)",
                                            transition: "width 0.4s ease",
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step content */}
            <div className="step-content-default">
                <div ref={contentRef} key={currentStep}>
                    {steps[currentStep - 1]}
                </div>
            </div>

            {/* Navigation footer */}
            <div className="footer-container">
                <div className={`footer-nav ${isFirst ? "end" : "spread"}`}>
                    {!isFirst && (
                        <button className="back-button" onClick={handleBack}>
                            {backButtonText}
                        </button>
                    )}
                    <button className="next-button" onClick={handleNext}>
                        {isLast ? "Complete" : nextButtonText}
                        {!isLast && (
                            <svg
                                style={{ marginLeft: "0.375rem", height: "1rem", width: "1rem" }}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export { Stepper, Step };
