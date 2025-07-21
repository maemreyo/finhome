// src/components/onboarding/OnboardingTour.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS } from "react-joyride";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { getTourById, DEFAULT_TOUR_OPTIONS } from "@/config/onboardingTours";
import { OnboardingService } from "@/lib/services/onboardingService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, X, SkipForward } from "lucide-react";

interface OnboardingTourProps {
  tourId: string;
  autoStart?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onError?: (error: string) => void;
  debug?: boolean;
}

export function OnboardingTour({
  tourId,
  autoStart = false,
  onComplete,
  onSkip,
  onError,
  debug = false,
}: OnboardingTourProps) {
  const tControls = useTranslations("OnboardingControls");
  const tMessages = useTranslations("OnboardingMessages");
  const tWelcome = useTranslations("OnboardingWelcome");
  const tSteps = useTranslations("OnboardingSteps");
  const { user } = useAuth();
  const {
    currentFlow,
    currentStep,
    progress,
    isOnboardingActive,
    nextStep,
    previousStep,
    completeStep,
    skipOnboarding,
    startOnboarding,
  } = useOnboarding(tourId);

  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourSteps, setTourSteps] = useState<any[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Get tour configuration
  const tour = getTourById(tourId);

  // Initialize tour steps with translations
  useEffect(() => {
    if (!tour) return;

    const translatedSteps = tour.steps.map((step) => ({
      ...step,
      title: tSteps(step.title as any),
      content: tSteps(step.content as any),
      locale: {
        back: tControls("back"),
        close: tControls("close"),
        last: tControls("finish"),
        next: tControls("next"),
        skip: tControls("skip"),
      },
    }));

    setTourSteps(translatedSteps);
  }, [tour, tControls, tSteps]);

  // Auto-start tour if enabled and conditions are met
  useEffect(() => {
    if (
      autoStart &&
      tour &&
      user &&
      !isOnboardingActive &&
      tourSteps.length > 0
    ) {
      // Show welcome modal first
      setShowWelcomeModal(true);
    }
  }, [autoStart, tour, user, isOnboardingActive, tourSteps]);

  // Sync with onboarding hook state
  useEffect(() => {
    if (progress && currentStep) {
      const currentTourStepIndex = tourSteps.findIndex(
        (step) => step.stepId === currentStep.id
      );
      if (currentTourStepIndex >= 0) {
        setStepIndex(currentTourStepIndex);
      }
    }
  }, [progress, currentStep, tourSteps]);

  const startTour = useCallback(() => {
    if (!tour || !user) {
      onError?.("Tour or user not available");
      return;
    }

    try {
      startOnboarding(tourId);
      setIsRunning(true);
      setStepIndex(0);

      // Track tour start
      OnboardingService.trackTourEvent("tour_started", {
        tourId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });

      if (debug) {
        console.log("[OnboardingTour] Started tour:", tourId);
      }
    } catch (error) {
      console.error("[OnboardingTour] Error starting tour:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to start tour"
      );
    }
  }, [tour, user, tourId, startOnboarding, onError, debug]);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, index, action } = data;

      if (debug) {
        console.log("[OnboardingTour] Joyride callback:", {
          status,
          type,
          index,
          action,
        });
      }

      // Handle tour events
      if (type === EVENTS.STEP_AFTER) {
        const currentTourStep = tourSteps[index];
        if (currentTourStep) {
          // Mark step as completed
          completeStep(currentTourStep.stepId);

          // Track step completion
          OnboardingService.trackTourEvent("step_completed", {
            tourId,
            stepId: currentTourStep.stepId,
            stepIndex: index,
            userId: user?.id,
            timestamp: new Date().toISOString(),
          });

          // Move to next step in onboarding flow
          if (action === ACTIONS.NEXT) {
            nextStep();
          } else if (action === ACTIONS.PREV) {
            previousStep();
          }
        }
      }

      // Handle tour completion
      if (status === STATUS.FINISHED) {
        setIsRunning(false);

        // Mark onboarding as completed in database
        if (user) {
          OnboardingService.markOnboardingCompleted(user.id, tourId)
            .then(() => {
              toast.success(tMessages("completed"));
              onComplete?.();
            })
            .catch((error) => {
              console.error("Error marking onboarding as completed:", error);
              toast.error(tMessages("error"));
            });
        }

        // Track tour completion
        OnboardingService.trackTourEvent("tour_completed", {
          tourId,
          userId: user?.id,
          stepIndex: tourSteps.length - 1,
          timestamp: new Date().toISOString(),
          metadata: { totalSteps: tourSteps.length },
        });

        if (debug) {
          console.log("[OnboardingTour] Tour completed:", tourId);
        }
      }

      // Handle tour skip
      if (status === STATUS.SKIPPED) {
        setIsRunning(false);
        skipOnboarding();

        // Track tour skip
        OnboardingService.trackTourEvent("tour_skipped", {
          tourId,
          userId: user?.id,
          stepIndex: index,
          timestamp: new Date().toISOString(),
          metadata: { skipAtStep: index },
        });

        toast.info(tMessages("skipped"));
        onSkip?.();

        if (debug) {
          console.log("[OnboardingTour] Tour skipped at step:", index);
        }
      }

      // Handle errors
      if (status === STATUS.ERROR) {
        setIsRunning(false);
        const errorMessage = tMessages("error");
        toast.error(errorMessage);
        onError?.(errorMessage);

        if (debug) {
          console.error("[OnboardingTour] Tour error:", data);
        }
      }
    },
    [
      tourSteps,
      completeStep,
      nextStep,
      previousStep,
      skipOnboarding,
      onComplete,
      onSkip,
      onError,
      tourId,
      user,
      debug,
    ]
  );

  // Don't render if no tour configuration or steps
  if (!tour || tourSteps.length === 0) {
    return null;
  }

  // Enhanced styles with theme colors
  const joyrideStyles = {
    ...DEFAULT_TOUR_OPTIONS.styles,
    options: {
      ...DEFAULT_TOUR_OPTIONS.styles.options,
      primaryColor: tour.styles.options.primaryColor,
      width: tour.styles.options.width,
    },
    tooltip: {
      ...DEFAULT_TOUR_OPTIONS.styles.tooltip,
      background: `linear-gradient(135deg, ${tour.styles.options.backgroundColor} 0%, #f8fafc 100%)`,
      border: `2px solid ${tour.styles.options.primaryColor}20`,
    },
    spotlight: {
      ...DEFAULT_TOUR_OPTIONS.styles.spotlight,
      border: `3px solid ${tour.styles.options.primaryColor}`,
      boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 40px ${tour.styles.options.primaryColor}80`,
    },
    buttonNext: {
      ...DEFAULT_TOUR_OPTIONS.styles.buttonNext,
      backgroundColor: tour.styles.options.primaryColor,
      boxShadow: `0 4px 12px ${tour.styles.options.primaryColor}60`,
    },
  };

  // Custom tooltip component with enhanced visuals
  const CustomTooltip = ({
    index,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
  }: any) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="joyride-tooltip"
        {...tooltipProps}
        style={{
          ...tooltipProps.style,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "20px",
          padding: "28px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)",
          border: `2px solid ${tour.styles.options.primaryColor}30`,
          maxWidth: "480px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-full"
            style={{ backgroundColor: `${tour.styles.options.primaryColor}15` }}
          >
            <Sparkles
              className="w-5 h-5"
              style={{ color: tour.styles.options.primaryColor }}
            />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold m-0" style={{ color: "#1f2937" }}>
              {step.title}
            </h3>
            {tour.showProgress && (
              <div className="flex items-center gap-2 mt-1">
                <div className="text-sm text-gray-500">
                  Step {index + 1} of {tourSteps.length}
                </div>
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: tour.styles.options.primaryColor,
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((index + 1) / tourSteps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div
          className="text-gray-600 mb-6 leading-relaxed"
          style={{ fontSize: "16px", lineHeight: "1.6" }}
        >
          {step.content}
        </div>

        {/* Footer with buttons */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {index > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                {...backProps}
                className="px-4 py-2 text-gray-600 border-2 border-gray-200 rounded-xl font-medium transition-all hover:border-gray-300 hover:text-gray-700"
              >
                {tControls("back")}
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {tour.showSkipButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                {...skipProps}
                className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
              >
                <SkipForward className="w-4 h-4" />
                {tControls("skip")}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              {...primaryProps}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-lg"
              style={{
                backgroundColor: tour.styles.options.primaryColor,
                boxShadow: `0 4px 12px ${tour.styles.options.primaryColor}60`,
              }}
            >
              {index === tourSteps.length - 1
                ? tControls("finish")
                : tControls("next")}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Welcome Modal Component
  const WelcomeModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowWelcomeModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${tour.styles.options.primaryColor}15` }}
          >
            <Sparkles
              className="w-8 h-8"
              style={{ color: tour.styles.options.primaryColor }}
            />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {tWelcome("title")}
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {tWelcome("content")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWelcomeModal(false)}
              className="px-6 py-3 text-gray-600 border-2 border-gray-200 rounded-xl font-medium transition-all hover:border-gray-300 hover:text-gray-700"
            >
              {tControls("skip")}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowWelcomeModal(false);
                setTimeout(() => startTour(), 300);
              }}
              className="px-8 py-3 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
              style={{
                backgroundColor: tour.styles.options.primaryColor,
                boxShadow: `0 4px 12px ${tour.styles.options.primaryColor}60`,
              }}
            >
              {tControls("next")}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {showWelcomeModal && <WelcomeModal />}

      {isRunning && (
        <Joyride
          steps={tourSteps}
          run={isRunning}
          stepIndex={stepIndex}
          continuous={tour.continuous}
          showSkipButton={tour.showSkipButton}
          showProgress={false} // We handle progress in custom tooltip
          spotlightPadding={tour.spotlightPadding}
          disableOverlayClose={tour.disableOverlayClose}
          hideCloseButton={tour.hideCloseButton}
          scrollToFirstStep={true}
          spotlightClicks={false}
          styles={joyrideStyles}
          callback={handleJoyrideCallback}
          debug={debug}
          locale={{
            back: tControls("back"),
            close: tControls("close"),
            last: tControls("finish"),
            next: tControls("next"),
            skip: tControls("skip"),
          }}
          tooltipComponent={CustomTooltip}
        />
      )}
    </AnimatePresence>
  );
}

// Hook for managing multiple tours
export function useOnboardingTours() {
  const { user } = useAuth();
  const [activeTours, setActiveTours] = useState<string[]>([]);

  const startTour = useCallback(
    (tourId: string) => {
      if (!activeTours.includes(tourId)) {
        setActiveTours((prev) => [...prev, tourId]);
      }
    },
    [activeTours]
  );

  const stopTour = useCallback((tourId: string) => {
    setActiveTours((prev) => prev.filter((id) => id !== tourId));
  }, []);

  const stopAllTours = useCallback(() => {
    setActiveTours([]);
  }, []);

  return {
    activeTours,
    startTour,
    stopTour,
    stopAllTours,
  };
}

export default OnboardingTour;
