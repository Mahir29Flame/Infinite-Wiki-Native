import React, { useState } from 'react';
import { openExternalUrl } from './openExternalUrl';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
  onClose?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose }) => {
  const [keyInput, setKeyInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim()) {
      onSave(keyInput.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#111',
        border: '1px solid #444',
        padding: '2rem',
        maxWidth: '420px',
        width: '90%',
        color: '#fff',
      }}>
        <h3 style={{ marginTop: 0 }}>Gemini API Key Required</h3>
        <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
          Please enter your Google Gemini API key to use Infinite Wiki. Your key is saved locally in your browser.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: '#222',
              border: '1px solid #555',
              color: '#fff',
              marginBottom: '0.75rem',
              boxSizing: 'border-box',
            }}
            autoFocus
          />

          <div style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            <span style={{ color: '#888' }}>Don't have a key? </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              onClick={(event) => {
                event.preventDefault();
                void openExternalUrl('https://aistudio.google.com/app/apikey');
              }}
              style={{
                color: '#fff',
                textDecoration: 'underline',
              }}
             >
              Get an API key on Google AI Studio ↗
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#aaa', border: '1px solid #444', cursor: 'pointer' }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!keyInput.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: '#fff',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
