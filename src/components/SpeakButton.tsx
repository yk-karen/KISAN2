import React, { useState, useEffect } from 'react';
import { speakText, stopSpeech, isTTSSupported } from '../lib/tts';

interface SpeakButtonProps {
  text: string;
  language?: string;
  label?: string;
  className?: string;
  compact?: boolean;
}

export function SpeakButton({
  text,
  language = 'en',
  label = 'Read aloud',
  className = '',
  compact = false,
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Clean up ongoing speech on unmount
    return () => {
      if (speaking) {
        stopSpeech();
      }
    };
  }, [speaking]);

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage(null);

    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }

    if (!isTTSSupported()) {
      setErrorMessage('Read aloud is not available on this device.');
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }

    setSpeaking(true);
    speakText(text, language, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: (err) => {
        setSpeaking(false);
        setErrorMessage(err);
        setTimeout(() => setErrorMessage(null), 3500);
      },
    });
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
      <button
        type="button"
        onClick={handleToggleSpeak}
        aria-label={`${speaking ? 'Stop reading' : 'Listen to'} ${label}`}
        aria-live="polite"
        className={`speak-button ${speaking ? 'speaking' : ''} ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '4px 8px' : '6px 14px',
          fontSize: compact ? '0.8rem' : '0.875rem',
          fontWeight: 600,
          borderRadius: '20px',
          border: speaking ? '1px solid #dc2626' : '1px solid #16a34a',
          backgroundColor: speaking ? '#fef2f2' : '#f0fdf4',
          color: speaking ? '#dc2626' : '#166534',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: '36px',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{speaking ? '■' : '🔊'}</span>
        <span>{speaking ? 'Stop' : 'Listen'}</span>
      </button>

      {errorMessage && (
        <span
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            fontSize: '0.75rem',
            color: '#b91c1c',
            backgroundColor: '#fef2f2',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #fecaca',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}
