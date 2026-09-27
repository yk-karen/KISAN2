import { validateTrustedGovernmentUrl } from '../../supabase/functions/_shared/schemeSyncUtils';

interface OfficialApplyButtonProps {
  officialApplyUrl?: string | null;
  officialLink?: string | null;
  sourceUrl?: string | null;
  applicationMethod?: string | null;
}

export const OfficialApplyButton: React.FC<OfficialApplyButtonProps> = ({
  officialApplyUrl,
  officialLink,
  sourceUrl,
  applicationMethod,
}) => {
  // Defense-in-depth: Validate application URL on frontend as well
  const validApplyCheck = validateTrustedGovernmentUrl(officialApplyUrl);
  const validSourceCheck = validateTrustedGovernmentUrl(officialLink || sourceUrl);

  const canApplyOfficially = validApplyCheck.valid && validApplyCheck.normalizedUrl;
  const canViewSource = validSourceCheck.valid && validSourceCheck.normalizedUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
      {canApplyOfficially ? (
        <a
          href={validApplyCheck.normalizedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 16px',
            borderRadius: '8px',
            background: '#16a34a',
            color: '#ffffff',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.875rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Apply Officially
        </a>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: '#94a3b8', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            {applicationMethod
              ? `Application Method: ${applicationMethod}`
              : 'Online application link not currently available.'}
          </span>
        </div>
      )}

      {canViewSource && (
        <a
          href={validSourceCheck.normalizedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            borderRadius: '6px',
            color: '#15803d',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            fontWeight: 500,
            textDecoration: 'none',
            fontSize: '0.75rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Official Government Source
        </a>
      )}
    </div>
  );
};
