import React from "react";

/**
 * Utility to fix Radix UI Dialog body freeze issues
 * This fixes the common issue where pointer-events: none gets stuck on body
 */

export const fixDialogBodyFreeze = () => {
  // Force remove pointer-events: none from body
  if (document.body.style.pointerEvents === "none") {
    document.body.style.pointerEvents = "";
  }

  // Also check for any data attributes that might cause issues
  const body = document.body;
  if (body.getAttribute("data-scroll-locked") === "true") {
    body.removeAttribute("data-scroll-locked");
  }

  // Force restore body overflow if hidden
  if (body.style.overflow === "hidden") {
    body.style.overflow = "";
  }
};

export const createSafeDialogHandler = (callback: () => void) => {
  return () => {
    try {
      // Use setTimeout to ensure the callback runs after React's cleanup
      setTimeout(() => {
        callback();
        // Force fix any potential body freeze
        fixDialogBodyFreeze();
      }, 0);
    } catch (error) {
      console.error("Dialog handler error:", error);
      // Ensure we still fix the body even if there's an error
      fixDialogBodyFreeze();
      callback();
    }
  };
};

export const createSafeDialogCloseHandler = (
  onOpenChange: (open: boolean) => void,
) => {
  return createSafeDialogHandler(() => {
    onOpenChange(false);
  });
};

// Hook to automatically fix dialog issues on unmount
export const useDialogFix = () => {
  React.useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      fixDialogBodyFreeze();
    };
  }, []);
};

// Custom onOpenChange handler that includes the fix
export const createSafeOnOpenChange = (
  onOpenChange: (open: boolean) => void,
) => {
  return (open: boolean) => {
    if (!open) {
      // When closing dialog, apply the fix
      setTimeout(() => {
        fixDialogBodyFreeze();
      }, 100); // Small delay to let Radix finish its cleanup
    }
    onOpenChange(open);
  };
};

// Emergency fix function that can be called from anywhere
export const forceFixBodyFreeze = () => {
  console.warn("Emergency body freeze fix applied");

  // Force remove all problematic styles
  const body = document.body;
  body.style.pointerEvents = "";
  body.style.overflow = "";
  body.removeAttribute("data-scroll-locked");

  // Remove any lingering portal elements that might be causing issues
  const portals = document.querySelectorAll("[data-radix-portal]");
  portals.forEach((portal) => {
    const openElements = portal.querySelectorAll('[data-state="open"]');
    if (openElements.length === 0) {
      // No open dialogs in this portal, it's safe to clean up styles
      fixDialogBodyFreeze();
    }
  });

  // Force repaint
  body.style.display = "none";
  body.offsetHeight; // Trigger reflow
  body.style.display = "";
};

// Add global emergency key combination (Ctrl+Alt+F)
if (typeof window !== "undefined") {
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "f") {
      e.preventDefault();
      forceFixBodyFreeze();
      alert(
        "🚑 Emergency body freeze fix applied!\nYou can also use Ctrl+Alt+F anytime if the interface freezes.",
      );
    }
  });
}
