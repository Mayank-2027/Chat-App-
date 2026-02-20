import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee", // Use lowercase for consistency
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme }); // Set the state with the new theme
  }
}));