import React, { useState } from 'react';
import {
  TEXT_MODELS,
  ART_MODELS,
  getStoredTextModel,
  setStoredTextModel,
  getStoredArtModel,
  setStoredArtModel,
  getStoredAutoFallback,
  setStoredAutoFallback,
} from '../services/modelsConfig';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}) => {
  const [apiKey, setApiKey] = useState(() => getStoredApiKey());
  const [textModel, setTextModel] = useState(() => getStoredTextModel());
  const [artModel, setArtModel] = useState(() => getStoredArtModel());
  const [autoFallback, setAutoFallback] = useState(() => getStoredAutoFallback());
  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKey.trim());
    setStoredTextModel(textModel);
    setStoredArtModel(artModel);
    setStoredAutoFallback(autoFallback);

    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      if (onSettingsChanged) {
        onSettingsChanged();
      }
      onClose();
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#111111',
          border: '1px solid #333333',
          padding: '1.75rem',
          maxWidth: '480px',
          width: '92%',
          color: '#ffffff',
          boxSizing: 'border-box',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
            Model & System Settings
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0 4px',
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Text Model Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#ccc' }}>
              Text Generation Model
            </label>
            <select
              value={textModel}
              onChange={(e) => setTextModel(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: '#222',
                border: '1px solid #444',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              {TEXT_MODELS.map((m) => (
                <option key={m.id} value={m.id} style={{ background: '#222', color: '#fff' }}>
                  {m.name} {m.tag ? `(${m.tag})` : ''} — {m.description}
                </option>
              ))}
            </select>
          </div>

          {/* ASCII Art Model Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#ccc' }}>
              ASCII Art Generation Model
            </label>
            <select
              value={artModel}
              onChange={(e) => setArtModel(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: '#222',
                border: '1px solid #444',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              {ART_MODELS.map((m) => (
                <option key={m.id} value={m.id} style={{ background: '#222', color: '#fff' }}>
                  {m.name} {m.tag ? `(${m.tag})` : ''} — {m.description}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Fallback Quota Toggle */}
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem',
              background: '#191919',
              border: '1px solid #2e2e2e',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              <input
                type="checkbox"
                checked={autoFallback}
                onChange={(e) => setAutoFallback(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: '#ffffff' }}
              />
              <span>Auto-switch to lighter backup model on quota limit (429)</span>
            </label>
            <p style={{ margin: '0.4rem 0 0 1.6rem', fontSize: '0.8rem', color: '#888' }}>
              Automatically falls back to Gemini 3.1 Flash Lite / Gemma 26B if rate limit or daily quota is exceeded.
            </p>
          </div>

          {/* API Key */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#ccc' }}>
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: '#222',
                border: '1px solid #444',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#aaa', textDecoration: 'underline' }}
              >
                Get API key from Google AI Studio ↗
              </a>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#aaa',
                border: '1px solid #444',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1.25rem',
                background: savedNotification ? '#4ade80' : '#ffffff',
                color: '#000000',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                transition: 'background 0.2s ease',
              }}
            >
              {savedNotification ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
