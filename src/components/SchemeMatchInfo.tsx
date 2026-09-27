import React from 'react';
import { MatchResult } from '../lib/schemeMatching';
import { SpeakButton } from './SpeakButton';

interface SchemeMatchInfoProps {
  match: MatchResult;
  schemeTitle: string;
}

export const SchemeMatchInfo: React.FC<SchemeMatchInfoProps> = ({ match, schemeTitle }) => {
  if (match.status === 'not_matched') return null;

  const isPossibleMatch = match.status === 'possible_match';

  // Construct readable text for SpeakButton
  const speakText = `Scheme match details for ${schemeTitle}. Status: ${
    isPossibleMatch ? 'Possible match. You may be eligible based on your Kisan profile.' : 'Insufficient profile information.'
  } Reasons: ${match.reasons.join('. ')}. Still needs confirmation: ${match.missingInformation.join('. ')}. Final eligibility is determined by the government authority.`;

  return (
    <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isPossibleMatch ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Possible Match
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Insufficient Information
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
            {isPossibleMatch ? 'You may be eligible based on your Kisan profile' : 'Add more details to your profile to check match'}
          </span>
        </div>

        {/* Read-Aloud Button */}
        <SpeakButton text={speakText} label="Listen to Match Reasons" />
      </div>

      {/* Why: Reasons List */}
      {match.reasons.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', margin: '0 0 4px 0' }}>Why:</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {match.reasons.map((reason, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.75rem', color: '#14532d', marginBottom: '3px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', marginTop: '2px', flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Still Needs Confirmation: Missing Criteria List */}
      {match.missingInformation.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', margin: '0 0 4px 0' }}>Still needs confirmation:</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {match.missingInformation.map((info, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.75rem', color: '#92400e', marginBottom: '3px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', marginTop: '2px', flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Authority Disclaimer */}
      <p style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #cbd5e1', fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', margin: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', flexShrink: 0, color: '#94a3b8' }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Final eligibility is determined by the responsible government authority.
      </p>
    </div>
  );
};
