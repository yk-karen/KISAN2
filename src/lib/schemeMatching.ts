import { GovernmentScheme, Profile } from '../types/database';

export interface MatchResult {
  status: 'possible_match' | 'insufficient_information' | 'not_matched';
  reasons: string[];
  missingInformation: string[];
}

function formatRoleName(role: string): string {
  switch (role) {
    case 'farmer':
      return 'Farmer';
    case 'tool_lender':
      return 'Tool Lender';
    case 'job_seeker':
      return 'Job Seeker';
    case 'storage_owner':
      return 'Storage Owner';
    default:
      return role;
  }
}

/**
 * Deterministic multi-criteria scheme matcher based on authenticated user profile.
 * NEVER computes artificial AI percentages or definitive claims of eligibility.
 */
export function matchSchemeForProfile(
  scheme: GovernmentScheme,
  profile: Profile | null | undefined
): MatchResult {
  if (!profile) {
    return {
      status: 'insufficient_information',
      reasons: [],
      missingInformation: [
        'Complete your Kisan profile to check personalized scheme eligibility.',
      ],
    };
  }

  const reasons: string[] = [];
  const missingInformation: string[] = [];
  const criteria = scheme.eligibility_criteria || {};

  // 1. Role Match Check
  if (Array.isArray(criteria.roles) && criteria.roles.length > 0) {
    if (criteria.roles.includes(profile.role)) {
      reasons.push(`Available for your registered role (${formatRoleName(profile.role)})`);
    } else {
      return {
        status: 'not_matched',
        reasons: [`Designed for: ${criteria.roles.map(formatRoleName).join(', ')}`],
        missingInformation: [],
      };
    }
  } else {
    reasons.push('Open to all registered agricultural roles');
  }

  // 2. Crop Match Check
  if (Array.isArray(criteria.crops) && criteria.crops.length > 0) {
    const isAllCrops = criteria.crops.some((c: string) =>
      ['all_food_crops', 'all_crops', 'general'].includes(c.toLowerCase())
    );

    if (isAllCrops) {
      reasons.push('Covers all major food and commercial crops');
    } else if (Array.isArray(profile.crops) && profile.crops.length > 0) {
      const matchingCrops = profile.crops.filter((userCrop) =>
        criteria.crops.some((reqCrop: string) =>
          userCrop.toLowerCase().includes(reqCrop.toLowerCase()) ||
          reqCrop.toLowerCase().includes(userCrop.toLowerCase())
        )
      );

      if (matchingCrops.length > 0) {
        reasons.push(`Relevant to your crops (${matchingCrops.join(', ')})`);
      } else {
        missingInformation.push(`Target crops: ${criteria.crops.join(', ')}`);
      }
    } else {
      missingInformation.push(`Specific crop requirements: ${criteria.crops.join(', ')}`);
    }
  }

  // 3. Location Match Check (Conservative state matching)
  if (typeof criteria.state === 'string' && criteria.state.trim()) {
    const userState = profile.location?.state?.trim();
    if (userState) {
      if (userState.toLowerCase() === criteria.state.trim().toLowerCase()) {
        reasons.push(`Applicable in your state (${userState})`);
      } else {
        return {
          status: 'not_matched',
          reasons: [],
          missingInformation: [`State requirement: ${criteria.state}`],
        };
      }
    } else {
      missingInformation.push(`State verification required (${criteria.state})`);
    }
  } else if (profile.location?.state) {
    reasons.push(`Applicable across states including ${profile.location.state}`);
  }

  // 4. Landholding Size Check
  if (criteria.max_land_hectares !== undefined && criteria.max_land_hectares !== null) {
    if (profile.farm_size_range) {
      missingInformation.push(
        `Landholding verification required (Scheme ceiling: ${criteria.max_land_hectares} hectares)`
      );
    } else {
      missingInformation.push(`Landholding size confirmation (${criteria.max_land_hectares} ha ceiling)`);
    }
  }

  // 5. Income & Taxpayer Exclusions
  if (Array.isArray(criteria.exclusions) && criteria.exclusions.length > 0) {
    missingInformation.push(
      `Exclusion check required (${criteria.exclusions.map((e: string) => e.replace('_', ' ')).join(', ')})`
    );
  }

  // 6. Target Groups & Category Subsidies
  if (Array.isArray(criteria.target_groups) && criteria.target_groups.length > 0) {
    missingInformation.push(
      `Target category confirmation (${criteria.target_groups.map((g: string) => g.replace('_', ' ')).join(', ')})`
    );
  }

  // 7. Target Assets (Infrastructure / Mechanization)
  if (Array.isArray(criteria.target_assets) && criteria.target_assets.length > 0) {
    missingInformation.push(
      `Eligible infrastructure/assets (${criteria.target_assets.map((a: string) => a.replace('_', ' ')).join(', ')})`
    );
  }

  // 8. Catch-all for unrecognized / arbitrary criteria keys (e.g. max_interest_rate)
  const KNOWN_KEYS = new Set([
    'roles', 'crops', 'state', 'max_land_hectares', 'exclusions', 'target_groups', 'target_assets'
  ]);
  for (const key of Object.keys(criteria)) {
    if (!KNOWN_KEYS.has(key)) {
      const val = criteria[key];
      if (val !== null && val !== undefined) {
        const formattedKey = key.replace(/_/g, ' ');
        missingInformation.push(
          `Additional criteria confirmation (${formattedKey}: ${typeof val === 'object' ? JSON.stringify(val) : val})`
        );
      }
    }
  }

  // Default status: if matched role, return possible_match
  return {
    status: 'possible_match',
    reasons,
    missingInformation,
  };
}
