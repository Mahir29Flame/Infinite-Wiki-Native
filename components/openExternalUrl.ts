import { open } from '@tauri-apps/plugin-shell';

export async function openExternalUrl(url: string): Promise<void> {
  try {
    // Works in Tauri desktop and Android.
    await open(url);
  } catch {
    // Browser/development fallback.
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}