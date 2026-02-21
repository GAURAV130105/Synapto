// Accessibility utilities for inclusive design

export interface AccessibilityPreferences {
  textSize: "small" | "normal" | "large" | "extra-large";
  highContrast: boolean;
  dyslexiaFont: boolean;
  screenReaderOptimized: boolean;
  focusMode: boolean;
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
}

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  textSize: "normal",
  highContrast: false,
  dyslexiaFont: false,
  screenReaderOptimized: false,
  focusMode: false,
  colorBlindMode: "none",
};

export function getTextSizeClass(size: string): string {
  const sizeMap: Record<string, string> = {
    small: "text-sm",
    normal: "text-base",
    large: "text-lg",
    "extra-large": "text-xl",
  };
  return sizeMap[size] || "text-base";
}

export function applyColorBlindFilter(colorBlindMode: string): string {
  const filters: Record<string, string> = {
    protanopia: "url('#protanopia-filter')",
    deuteranopia: "url('#deuteranopia-filter')",
    tritanopia: "url('#tritanopia-filter')",
    none: "none",
  };
  return filters[colorBlindMode] || "none";
}

export function generateAccessibilityCSS(preferences: AccessibilityPreferences): string {
  let css = "";

  // High contrast mode
  if (preferences.highContrast) {
    css += `
      * { color: #000 !important; background-color: #fff !important; }
      a { color: #00f !important; }
      button { border: 2px solid #000 !important; }
    `;
  }

  // Dyslexia-friendly font
  if (preferences.dyslexiaFont) {
    css += `
      * { font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important; }
      body { letter-spacing: 0.1em; line-height: 1.8; }
    `;
  }

  return css;
}

// ARIA labels for sign language avatar
export function getAvatarAriaLabel(speaking: boolean): string {
  return speaking
    ? "Sign Language Avatar is currently translating to sign language"
    : "Sign Language Avatar ready to display sign language translation";
}

// Keyboard navigation support
export function isKeyboardNavigationKey(key: string): boolean {
  return ["Tab", "Enter", "Space", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key);
}
