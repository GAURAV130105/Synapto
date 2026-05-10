import { create } from "zustand";

const useAppStore = create((set, get) => ({
  // Input
  inputText: "",
  setInputText: (text) => set({ inputText: text }),

  // Gloss
  glossSequence: [],
  currentGlossIndex: -1,
  setGlossSequence: (seq) => set({ glossSequence: seq, currentGlossIndex: -1 }),
  setCurrentGlossIndex: (idx) => set({ currentGlossIndex: idx }),

  // Animation
  animationQueue: [],
  isPlaying: false,
  playbackSpeed: 1,
  setAnimationQueue: (queue) => set({ animationQueue: queue }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  // Translation mode
  translationMode: "rule", // 'rule' or 'llm'
  setTranslationMode: (mode) => set({ translationMode: mode }),

  // Status
  status: "idle", // 'idle' | 'translating' | 'signing' | 'done'
  setStatus: (status) => set({ status }),
  statusMessage: "",
  setStatusMessage: (msg) => set({ statusMessage: msg }),

  // Speech
  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),

  // History
  history: [],
  addToHistory: (entry) =>
    set((state) => ({
      history: [entry, ...state.history].slice(0, 20),
    })),

  // Reset
  reset: () =>
    set({
      glossSequence: [],
      currentGlossIndex: -1,
      animationQueue: [],
      isPlaying: false,
      status: "idle",
      statusMessage: "",
    }),
}));

export default useAppStore;
