/**
 * Kisan Government Schemes - Server-Side Security, Validation & Fail-Safe Sync Utilities
 */

export type VerificationStatus = 'unverified' | 'verified' | 'stale';

export type SourceTrustLevel =
  | 'official_government'
  | 'verified_government_portal'
  | 'manual_verified'
  | 'unknown';

export interface ValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  reason?: string;
}

/**
 * Explicit, auditable allowlist of authoritative government hosts used by Kisan.
 * No arbitrary, dynamic, or LLM-generated domains will ever be trusted.
 */
export const TRUSTED_GOVERNMENT_HOSTS: ReadonlySet<string> = new Set([
  'pmkisan.gov.in',
  'pmfby.gov.in',
  'myscheme.gov.in',
  'agrimachinery.nic.in',
  'agriinfra.dac.gov.in',
  'india.gov.in',
  'agricoop.gov.in',
  'kerala.gov.in',
  'tn.gov.in',
]);

/**
 * Strict server-side validation for official government URLs.
 * Validates that URL parses with new URL(), uses HTTPS, contains no credentials,
 * is not an IP address, and matches the explicit TRUSTED_GOVERNMENT_HOSTS allowlist.
 */
export function validateTrustedGovernmentUrl(inputUrl: string | null | undefined): ValidationResult {
  if (!inputUrl || typeof inputUrl !== 'string' || !inputUrl.trim()) {
    return { valid: false, reason: 'URL is empty or not a string' };
  }

  const cleanUrl = inputUrl.trim();

  // Protect against non-HTTP/HTTPS schemes immediately
  if (/^(javascript|data|file|vbscript|blob):/i.test(cleanUrl)) {
    return { valid: false, reason: 'Disallowed scheme' };
  }

  try {
    const parsed = new URL(cleanUrl);

    // 1. Production HTTPS requirement
    if (parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Only HTTPS URLs are allowed for official government destinations' };
    }

    // 2. Reject embedded user credentials
    if (parsed.username || parsed.password) {
      return { valid: false, reason: 'URL contains embedded user credentials' };
    }

    // 3. Normalize hostname
    const hostname = parsed.hostname.toLowerCase().trim();

    // 4. Reject IP addresses as hostnames
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) || /^\[[0-9a-f:]+\]$/i.test(hostname)) {
      return { valid: false, reason: 'IP addresses are not permitted as official government hostnames' };
    }

    // 5. Strict explicit allowlist matching with exact host or sub-host checks
    let isAllowed = TRUSTED_GOVERNMENT_HOSTS.has(hostname);
    if (!isAllowed) {
      for (const trustedHost of TRUSTED_GOVERNMENT_HOSTS) {
        if (hostname.endsWith(`.${trustedHost}`)) {
          isAllowed = true;
          break;
        }
      }
    }

    if (!isAllowed) {
      return {
        valid: false,
        reason: `Hostname "${hostname}" is not present on the explicit TRUSTED_GOVERNMENT_HOSTS allowlist`
      };
    }

    // 6. Return normalized clean URL
    return {
      valid: true,
      normalizedUrl: parsed.toString()
    };
  } catch (_err) {
    return { valid: false, reason: 'Malformed URL structure' };
  }
}

/**
 * Canonical JSON stringifier to guarantee deterministic key ordering for content hashing.
 */
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj).sort();
  return '{' + sortedKeys.map((k) => `${JSON.stringify(k)}:${canonicalJsonStringify(obj[k])}`).join(',') + '}';
}

/**
 * Compute deterministic content hash feeding ONLY normalized scheme fields.
 * Explicitly excludes timestamps, runtime metadata, or unstable keys.
 */
export function computeContentHash(data: {
  title: string;
  category?: string;
  description?: string;
  benefits?: string;
  eligibility_criteria?: any;
  official_link?: string;
  official_apply_url?: string;
  application_method?: string;
  application_deadline?: string;
}): string {
  const normalizedPayload = {
    title: (data.title || '').trim(),
    category: (data.category || '').trim(),
    description: (data.description || '').trim(),
    benefits: (data.benefits || '').trim(),
    eligibility_criteria: data.eligibility_criteria || {},
    official_link: (data.official_link || '').trim(),
    official_apply_url: (data.official_apply_url || '').trim(),
    application_method: (data.application_method || '').trim(),
    application_deadline: (data.application_deadline || '').trim(),
  };

  const canonicalString = canonicalJsonStringify(normalizedPayload);
  let hash = 0;
  for (let i = 0; i < canonicalString.length; i++) {
    const char = canonicalString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(36)}_${canonicalString.length}`;
}

/**
 * Minimum requirements to set verification_status = 'verified'.
 */
export function satisfiesMinimumVerificationCriteria(incoming: {
  title?: string;
  description?: string;
  benefits?: string;
  source_url?: string;
  official_link?: string;
  official_apply_url?: string;
}): boolean {
  if (!incoming.title || typeof incoming.title !== 'string' || incoming.title.trim().length < 3) return false;
  if (!incoming.description || typeof incoming.description !== 'string' || incoming.description.trim().length < 10) return false;
  if (!incoming.benefits || typeof incoming.benefits !== 'string' || incoming.benefits.trim().length < 5) return false;

  const sourceCheck = validateTrustedGovernmentUrl(incoming.source_url);
  if (!sourceCheck.valid) return false;

  if (incoming.official_link) {
    const linkCheck = validateTrustedGovernmentUrl(incoming.official_link);
    if (!linkCheck.valid) return false;
  }

  if (incoming.official_apply_url) {
    const applyCheck = validateTrustedGovernmentUrl(incoming.official_apply_url);
    if (!applyCheck.valid) return false;
  }

  return true;
}

/**
 * Field-level fail-safe merge covering ALL mutable government scheme fields.
 * Existing trustworthy fields are NEVER overwritten with empty/null/error values.
 */
export function mergeSchemeFields(existingRow: any | null, incomingData: any) {
  const existing = existingRow || {};

  // Validate links independently against TRUSTED_GOVERNMENT_HOSTS
  const validOfficialLink = validateTrustedGovernmentUrl(incomingData.official_link);
  const validApplyUrl = validateTrustedGovernmentUrl(incomingData.official_apply_url);

  const finalOfficialLink = validOfficialLink.valid
    ? validOfficialLink.normalizedUrl!
    : (existing.official_link || null);

  const finalApplyUrl = validApplyUrl.valid
    ? validApplyUrl.normalizedUrl!
    : (existing.official_apply_url || null);

  // Determine if incoming merged data satisfies verification criteria
  const candidateMerged = {
    title: (incomingData.title && incomingData.title.trim()) ? incomingData.title.trim() : existing.title,
    description: (incomingData.description && incomingData.description.trim()) ? incomingData.description.trim() : (existing.description || ''),
    benefits: (incomingData.benefits && incomingData.benefits.trim()) ? incomingData.benefits.trim() : (existing.benefits || ''),
    source_url: incomingData.source_url || existing.source_url || null,
    official_link: finalOfficialLink,
    official_apply_url: finalApplyUrl,
  };

  const isVerified = satisfiesMinimumVerificationCriteria(candidateMerged);

  return {
    title: candidateMerged.title,
    category: (incomingData.category && incomingData.category.trim()) ? incomingData.category.trim() : (existing.category || 'General'),
    description: candidateMerged.description,
    benefits: candidateMerged.benefits,
    eligibility_criteria: (incomingData.eligibility_criteria && typeof incomingData.eligibility_criteria === 'object' && Object.keys(incomingData.eligibility_criteria).length > 0)
      ? incomingData.eligibility_criteria
      : (existing.eligibility_criteria || {}),
    official_link: finalOfficialLink,
    official_apply_url: finalApplyUrl,
    application_method: incomingData.application_method || existing.application_method || null,
    application_deadline: (incomingData.application_deadline && /^\d{4}-\d{2}-\d{2}$/.test(incomingData.application_deadline))
      ? incomingData.application_deadline
      : (existing.application_deadline || null),
    source_url: candidateMerged.source_url,
    source_type: incomingData.source_type || existing.source_type || 'official_government',
    source_hash: incomingData.source_hash || existing.source_hash || null,
    source_checked_at: new Date().toISOString(),
    source_updated_at: incomingData.source_updated_at || existing.source_updated_at || null,
    verification_status: isVerified ? ('verified' as VerificationStatus) : (existing.verification_status || ('unverified' as VerificationStatus)),
    active: existing.active !== undefined ? existing.active : true,
  };
}

/**
 * Calculate freshness status based on source_checked_at timestamp.
 * Freshness window: default 30 days.
 */
export function getSchemeFreshnessStatus(sourceCheckedAt: string | null, daysWindow = 30): VerificationStatus {
  if (!sourceCheckedAt) return 'unverified';
  const checkedTime = new Date(sourceCheckedAt).getTime();
  if (isNaN(checkedTime)) return 'unverified';
  const diffMs = Date.now() - checkedTime;
  const maxAgeMs = daysWindow * 24 * 60 * 60 * 1000;
  return diffMs > maxAgeMs ? 'stale' : 'verified';
}
