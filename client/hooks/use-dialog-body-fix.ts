import { useEffect } from "react";

/**
 * Global hook to prevent and fix body freeze issues with Radix UI Dialogs
 * This monitors body styles and automatically fixes stuck pointer-events
 */
export const useDialogBodyFix = () => {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkAndFixBodyFreeze = () => {
      const body = document.body;

      // Check for stuck pointer-events: none
      if (body.style.pointerEvents === "none") {
        // Check if there are any open dialogs
        const openDialogs = document.querySelectorAll("[data-radix-portal]");
        const hasOpenDialog = Array.from(openDialogs).some((portal) =>
          portal.querySelector('[data-state="open"]'),
        );

        // If no dialogs are open but pointer-events is still none, fix it
        if (!hasOpenDialog) {
          console.warn("Fixing stuck body pointer-events");
          body.style.pointerEvents = "";
        }
      }

      // Also check for overflow hidden without open dialogs
      if (body.style.overflow === "hidden") {
        const openDialogs = document.querySelectorAll("[data-radix-portal]");
        const hasOpenDialog = Array.from(openDialogs).some((portal) =>
          portal.querySelector('[data-state="open"]'),
        );

        if (!hasOpenDialog) {
          console.warn("Fixing stuck body overflow");
          body.style.overflow = "";
        }
      }
    };

    // Check immediately
    checkAndFixBodyFreeze();

    // Set up periodic check
    intervalId = setInterval(checkAndFixBodyFreeze, 1000);

    // Also listen for mutation changes on body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "style" ||
            mutation.attributeName === "data-scroll-locked")
        ) {
          // Delay check to let Radix finish its work
          setTimeout(checkAndFixBodyFreeze, 100);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "data-scroll-locked"],
    });

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, []);
};
