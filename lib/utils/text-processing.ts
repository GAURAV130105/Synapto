// Text processing utilities for Language Leveler and Focus Mode

export interface SimplifiedText {
  original: string;
  simplified: string;
  level: "basic" | "intermediate" | "advanced";
}

// Mock simplification for demonstration
export function simplifyTextLocally(text: string, level: "basic" | "intermediate" | "advanced"): string {
  if (level === "basic") {
    // Remove complex punctuation and long words
    return text
      .split(/([.!?;:,])/)
      .slice(0, Math.ceil(text.split(/([.!?;:,])/).length / 2))
      .join("")
      .substring(0, 200);
  }
  return text;
}

export interface AudioNarrative {
  text: string;
  audioUrl?: string;
  duration: number;
}

// Extract key sentences for audio narration
export function extractKeyPoints(text: string, maxPoints: number = 5): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, maxPoints).map((s) => s.trim());
}

// Generate image descriptions for Audio Narrative feature
export function generateImageDescription(context: string): string {
  return `This image provides visual information related to: ${context}. Please listen to the audio description for more details.`;
}

// Focus mode: remove distractions
export function applyFocusMode(html: string, focusSettings: {
  hideImages: boolean;
  hideAds: boolean;
  increaseFontSize: boolean;
  increaseLineHeight: boolean;
}): string {
  let modified = html;

  if (focusSettings.hideImages) {
    modified = modified.replace(/<img[^>]*>/g, "");
  }

  if (focusSettings.hideAds) {
    modified = modified.replace(/<!-- ad -->/g, "");
  }

  return modified;
}

// Dyslexia-friendly formatting
export function applyDyslexiaFont(text: string): { style: Record<string, string>; text: string } {
  return {
    text,
    style: {
      fontFamily: "OpenDyslexic, Comic Sans MS, sans-serif",
      letterSpacing: "0.1em",
      lineHeight: "1.8",
    },
  };
}
