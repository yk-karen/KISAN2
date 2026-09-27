import React from 'react';
import { SpeakButton } from './SpeakButton';

interface VoiceReviewModalProps {
  isOpen: boolean;
  title?: string;
  candidateFields: Record<string, any>;
  unresolved?: string[];
  language?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VoiceReviewModal({
  isOpen,
  title = 'Review Voice Extraction',
  candidateFields,
  unresolved = [],
  language = 'en',
  onConfirm,
  onCancel,
}: VoiceReviewModalProps) {
  if (!isOpen) return null;

  const entries = Object.entries(candidateFields);

  const reviewText = entries.length > 0
    ? `Extracted details: ${entries.map(([k, v]) => `${k.replace(/_/g, ' ')}: ${Array.isArray(v) ? v.join(', ') : String(v)}`).join('. ')}.`
    : 'No structured fields extracted.';

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="modal-content" style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        maxWidth: '480px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎙️</span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{title}</h3>
          </div>
          {entries.length > 0 && (
            <SpeakButton text={reviewText} language={language} label="Extracted summary" compact />
          )}
        </div>

        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '16px' }}>
          Voice assistant extracted the following details. Review and edit as needed before manual submission:
        </p>

        {entries.length > 0 ? (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {entries.map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600, color: '#166534', textTransform: 'capitalize' }}>
                  {key.replace(/_/g, ' ')}:
                </span>
                <span style={{ color: '#14532d', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                  {Array.isArray(val) ? val.join(', ') : String(val)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '16px' }}>
            No structured fields could be extracted.
          </p>
        )}

        {unresolved.length > 0 && (
          <div style={{
            backgroundColor: '#fffbe6',
            border: '1px solid #ffe58f',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            color: '#873800'
          }}>
            ⚠️ Could not map: {unresolved.join(', ')}. Please fill manually.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              color: '#374151',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={entries.length === 0}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: entries.length > 0 ? '#16a34a' : '#9ca3af',
              color: '#fff',
              cursor: entries.length > 0 ? 'pointer' : 'not-allowed',
              fontWeight: 600
            }}
          >
            Fill Into Form
          </button>
        </div>
      </div>
    </div>
  );
}
