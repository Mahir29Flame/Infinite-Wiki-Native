/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import {
  streamDefinition,
  generateAsciiArt,
  AsciiArtData,
  getStoredApiKey,
  getStoredTextModel,
  getStoredArtModel,
  getModelDisplayName,
} from './services/geminiService';
import ContentDisplay from './components/ContentDisplay';
import SearchBar from './components/SearchBar';
import LoadingSkeleton from './components/LoadingSkeleton';
import AsciiArtDisplay from './components/AsciiArtDisplay';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SettingsModal } from './components/SettingsModal';
import { useWindowShortcuts } from './components/WindowShortcuts';

// A curated list of "banger" words and phrases for the random button.
const PREDEFINED_WORDS = [
  // List 1
  'Balance', 'Harmony', 'Discord', 'Unity', 'Fragmentation', 'Clarity', 'Ambiguity', 'Presence', 'Absence', 'Creation', 'Destruction', 'Light', 'Shadow', 'Beginning', 'Ending', 'Rising', 'Falling', 'Connection', 'Isolation', 'Hope', 'Despair',
  // Complex phrases from List 1
  'Order and chaos', 'Light and shadow', 'Sound and silence', 'Form and formlessness', 'Being and nonbeing', 'Presence and absence', 'Motion and stillness', 'Unity and multiplicity', 'Finite and infinite', 'Sacred and profane', 'Memory and forgetting', 'Question and answer', 'Search and discovery', 'Journey and destination', 'Dream and reality', 'Time and eternity', 'Self and other', 'Known and unknown', 'Spoken and unspoken', 'Visible and invisible',
  // List 2
  'Zigzag', 'Waves', 'Spiral', 'Bounce', 'Slant', 'Drip', 'Stretch', 'Squeeze', 'Float', 'Fall', 'Spin', 'Melt', 'Rise', 'Twist', 'Explode', 'Stack', 'Mirror', 'Echo', 'Vibrate',
  // List 3
  'Gravity', 'Friction', 'Momentum', 'Inertia', 'Turbulence', 'Pressure', 'Tension', 'Oscillate', 'Fractal', 'Quantum', 'Entropy', 'Vortex', 'Resonance', 'Equilibrium', 'Centrifuge', 'Elastic', 'Viscous', 'Refract', 'Diffuse', 'Cascade', 'Levitate', 'Magnetize', 'Polarize', 'Accelerate', 'Compress', 'Undulate',
  // List 4
  'Liminal', 'Ephemeral', 'Paradox', 'Zeitgeist', 'Metamorphosis', 'Synesthesia', 'Recursion', 'Emergence', 'Dialectic', 'Apophenia', 'Limbo', 'Flux', 'Sublime', 'Uncanny', 'Palimpsest', 'Chimera', 'Void', 'Transcend', 'Ineffable', 'Qualia', 'Gestalt', 'Simulacra', 'Abyssal',
  // List 5
  'Existential', 'Nihilism', 'Solipsism', 'Phenomenology', 'Hermeneutics', 'Deconstruction', 'Postmodern', 'Absurdism', 'Catharsis', 'Epiphany', 'Melancholy', 'Nostalgia', 'Longing', 'Reverie', 'Pathos', 'Ethos', 'Logos', 'Mythos', 'Anamnesis', 'Intertextuality', 'Metafiction', 'Stream', 'Lacuna', 'Caesura', 'Enjambment'
];
const UNIQUE_WORDS = [...new Set(PREDEFINED_WORDS)];

/**
 * Creates a simple ASCII art bounding box as a fallback.
 * @param topic The text to display inside the box.
 * @returns An AsciiArtData object with the generated art.
 */
const createFallbackArt = (topic: string): AsciiArtData => {
  const displayableTopic = topic.length > 20 ? topic.substring(0, 17) + '...' : topic;
  const paddedTopic = ` ${displayableTopic} `;
  const topBorder = `┌${'─'.repeat(paddedTopic.length)}┐`;
  const middle = `│${paddedTopic}│`;
  const bottomBorder = `└${'─'.repeat(paddedTopic.length)}┘`;
  return {
    art: `${topBorder}\n${middle}\n${bottomBorder}`
  };
};

const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<string>('Hypertext');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [asciiArt, setAsciiArt] = useState<AsciiArtData | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => !!getStoredApiKey());
  const [showKeyModal, setShowKeyModal] = useState<boolean>(() => !getStoredApiKey());
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [textModel, setTextModel] = useState<string>(() => getStoredTextModel());
  const [artModel, setArtModel] = useState<string>(() => getStoredArtModel());
  const [quotaToast, setQuotaToast] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  const handleSaveApiKey = () => {
    setHasApiKey(true);
    setShowKeyModal(false);
    setReloadTrigger(prev => prev + 1);
  };

  const handleSettingsChanged = () => {
    setTextModel(getStoredTextModel());
    setArtModel(getStoredArtModel());
    setHasApiKey(!!getStoredApiKey());
    setReloadTrigger(prev => prev + 1);
  };

  const handleQuotaFallbackNotification = useCallback((fallbackModel: string, reason: string) => {
    setTextModel(getStoredTextModel());
    setArtModel(getStoredArtModel());
    setQuotaToast(reason);
    setTimeout(() => {
      setQuotaToast(null);
    }, 6000);
  }, []);

  // F11 Fullscreen and Ctrl +/- Text/DPI Resizing shortcuts
  useWindowShortcuts();

  useEffect(() => {
    if (!currentTopic) return;

    let isCancelled = false;

    const fetchContentAndArt = async () => {
      setIsLoading(true);
      setError(null);
      setContent(''); // Clear previous content immediately
      setAsciiArt(null);
      setGenerationTime(null);
      const startTime = performance.now();

      // Kick off ASCII art generation
      generateAsciiArt(currentTopic, {
        onFallback: (newModel, reason) => {
          if (!isCancelled) {
            handleQuotaFallbackNotification(newModel, reason);
          }
        },
      })
        .then(art => {
          if (!isCancelled) {
            setAsciiArt(art);
          }
        })
        .catch(err => {
          if (!isCancelled) {
            console.error("Failed to generate ASCII art:", err);
            // Generate a simple fallback ASCII art box on failure
            const fallbackArt = createFallbackArt(currentTopic);
            setAsciiArt(fallbackArt);
          }
        });

      let accumulatedContent = '';
      try {
        for await (const chunk of streamDefinition(currentTopic, {
          onFallback: (newModel, reason) => {
            if (!isCancelled) {
              handleQuotaFallbackNotification(newModel, reason);
            }
          },
        })) {
          if (isCancelled) break;
          
          if (chunk.startsWith('Error:')) {
            throw new Error(chunk);
          }
          accumulatedContent += chunk;
          if (!isCancelled) {
            setContent(accumulatedContent);
          }
        }
      } catch (e: unknown) {
        if (!isCancelled) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
          setError(errorMessage);
          setContent('');
          console.error(e);
        }
      } finally {
        if (!isCancelled) {
          const endTime = performance.now();
          setGenerationTime(endTime - startTime);
          setIsLoading(false);
        }
      }
    };

    fetchContentAndArt();
    
    return () => {
      isCancelled = true;
    };
  }, [currentTopic, reloadTrigger, handleQuotaFallbackNotification]);

  const handleWordClick = useCallback((word: string) => {
    const newTopic = word.trim();
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      setCurrentTopic(newTopic);
    }
  }, [currentTopic]);

  const handleSearch = useCallback((topic: string) => {
    const newTopic = topic.trim();
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      setCurrentTopic(newTopic);
    }
  }, [currentTopic]);

  const handleRandom = useCallback(() => {
    setIsLoading(true); // Disable UI immediately
    setError(null);
    setContent('');
    setAsciiArt(null);

    const randomIndex = Math.floor(Math.random() * UNIQUE_WORDS.length);
    const randomWord = UNIQUE_WORDS[randomIndex];

    // Prevent picking the same word twice in a row
    if (randomWord.toLowerCase() === currentTopic.toLowerCase()) {
      const nextIndex = (randomIndex + 1) % UNIQUE_WORDS.length;
      setCurrentTopic(UNIQUE_WORDS[nextIndex]);
    } else {
      setCurrentTopic(randomWord);
    }
  }, [currentTopic]);

  return (
    <div>
      <ApiKeyModal
        isOpen={showKeyModal}
        onSave={() => handleSaveApiKey()}
        onClose={hasApiKey ? () => setShowKeyModal(false) : undefined}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSettingsChanged={handleSettingsChanged}
      />

      {/* Quota fallback alert toast */}
      {quotaToast && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            background: '#221500',
            border: '1px solid #d97706',
            color: '#fef3c7',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            maxWidth: '360px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <span>⚠️ {quotaToast}</span>
          <button
            onClick={() => setQuotaToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d97706',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <SearchBar onSearch={handleSearch} onRandom={handleRandom} isLoading={isLoading} />
      
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          INFINITE WIKI
        </h1>
        <AsciiArtDisplay artData={asciiArt} topic={currentTopic} />
      </header>
      
      <main>
        <div>
          <h2 style={{ marginBottom: '2rem', textTransform: 'capitalize' }}>
            {currentTopic}
          </h2>

          {error && (
            <div style={{ border: '1px solid #cc0000', padding: '1rem', color: '#cc0000', marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>An Error Occurred</p>
              <p style={{ marginTop: '0.5rem', margin: 0 }}>{error}</p>
              {error.toLowerCase().includes('429') || error.toLowerCase().includes('quota') ? (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    style={{
                      textDecoration: 'underline',
                      color: '#cc0000',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Open Settings to switch to a higher-quota or lighter model →
                  </button>
                </div>
              ) : null}
            </div>
          )}
          
          {/* Show skeleton loader when loading and no content is yet available */}
          {isLoading && content.length === 0 && !error && (
            <LoadingSkeleton />
          )}

          {/* Show content as it streams or when it's interactive */}
          {content.length > 0 && !error && (
             <ContentDisplay 
               content={content} 
               isLoading={isLoading} 
               onWordClick={handleWordClick} 
             />
          )}

          {/* Show empty state if fetch completes with no content and is not loading */}
          {!isLoading && !error && content.length === 0 && (
            <div style={{ color: '#888', padding: '2rem 0' }}>
              <p>Content could not be generated.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky-footer">
        <p className="footer-text" style={{ margin: 0 }}>
          Native Port of Infinite Wiki by <a href="https://github.com/Mahir29Flame" target="_blank" rel="noopener noreferrer">Mahir29Flame</a>
          {' · '}
          Original by <a href="https://x.com/dev_valladares" target="_blank" rel="noopener noreferrer">Dev Valladares</a>
          {' · '}
          <span title={`Text: ${getModelDisplayName(textModel)} | Art: ${getModelDisplayName(artModel)}`}>
            {getModelDisplayName(textModel)}
          </span>
          {generationTime && ` · ${Math.round(generationTime)}ms`}
          {' · '}
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              textDecoration: 'none',
              padding: 0,
              font: 'inherit',
              fontSize: '1.2rem',
            }}
            title="Configure text/art models and API key"
          >
            ⚙ Settings
          </button>
        </p>
      </footer>
    </div>
  );
};

export default App;

