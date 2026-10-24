import React, { useEffect, useState, ReactNode } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
const appWindow = getCurrentWebviewWindow()
const STORAGE_KEY = 'infinite_wiki_font_scale';
const DEFAULT_SCALE = 1.0;
const MIN_SCALE = 0.7;
const MAX_SCALE = 2.0;
const SCALE_STEP = 0.1;

export const getStoredFontScale = (): number => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read font scale from localStorage:', err);
  }
  return DEFAULT_SCALE;
};

export const setStoredFontScale = (scale: number): void => {
  try {
    localStorage.setItem(STORAGE_KEY, scale.toFixed(2));
  } catch (err) {
    console.error('Failed to save font scale to localStorage:', err);
  }
};

/**
 * Hook to manage F11 fullscreen and Ctrl + / Ctrl - text scaling.
 */
export function useWindowShortcuts() {
  const [scale, setScale] = useState<number>(() => getStoredFontScale());

  // Apply scale to CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', scale.toString());
    setStoredFontScale(scale);
  }, [scale]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // 1. F11 Fullscreen toggle
      if (e.key === 'F11') {
        e.preventDefault();
        try {
          const isFullscreen = await appWindow.isFullscreen();
          await appWindow.setFullscreen(!isFullscreen);
        } catch {
          // Browser fallback if not in Tauri
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        }
        return;
      }

      // 2. Ctrl / Cmd shortcuts for text scaling (DPI / font size)
      if (e.ctrlKey || e.metaKey) {
        // Zoom in text: Ctrl + '=' or Ctrl + '+'
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setScale(prev => Math.min(Number((prev + SCALE_STEP).toFixed(2)), MAX_SCALE));
        }
        // Zoom out text: Ctrl + '-'
        else if (e.key === '-') {
          e.preventDefault();
          setScale(prev => Math.max(Number((prev - SCALE_STEP).toFixed(2)), MIN_SCALE));
        }
        // Reset text scale: Ctrl + '0'
        else if (e.key === '0') {
          e.preventDefault();
          setScale(DEFAULT_SCALE);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { scale, setScale };
}

/**
 * Component wrapper to easily wrap parts or entire app with keyboard shortcut support.
 */
export const WindowShortcutsWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  useWindowShortcuts();
  return <>{children}</>;
};
