// @ts-ignore Supabase Edge Function runtime resolves remote Deno imports.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore Supabase Edge Function runtime resolves the package import.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  validateTrustedGovernmentUrl,
  computeContentHash,
  mergeSchemeFields,
  TRUSTED_GOVERNMENT_HOSTS,
} from "../_shared/schemeSyncUtils.ts";

declare const Deno: { env: { get(name: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

type ParsedScheme = {
  title: string;
  category?: string;
  description?: string;
  eligibility_criteria?: Record<string, unknown>;
  benefits?: string;
  official_link?: string;
  official_apply_url?: string;
  application_method?: string;
  application_deadline?: string;
  source_updated_at?: string;
};

interface SyncMetrics {
  checked: number;
  unchanged: number;
  updated: number;
  stale_marked: number;
  failed: number;
  skipped_untrusted: number;
  invalid_application_url: number;
}

/**
 * Returns configured official source URLs.
 * Default sources use Kisan's trusted official government host list.
 */
function getOfficialSourceUrls(): string[] {
  const rawUrls = Deno.env.get("OFFICIAL_SCHEME_SOURCE_URLS") || "";
  const configured = rawUrls
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  if (configured.length > 0) return configured;

  // Default Kisan seed source URLs pointing to official government portals
  return [
    "https://pmkisan.gov.in",
    "https://pmfby.gov.in",
    "https://myscheme.gov.in",
    "https://agrimachinery.nic.in",
    "https://agriinfra.dac.gov.in",
  ];
}

async function parseOfficialSource(
  url: string,
  geminiApiKey: string,
  metrics: SyncMetrics
): Promise<ParsedScheme[]> {
  const urlCheck = validateTrustedGovernmentUrl(url);
  if (!urlCheck.valid) {
    console.warn(`[Sync] Skipped untrusted source URL: ${url} (${urlCheck.reason})`);
    metrics.skipped_untrusted += 1;
    return [];
  }

  const response = await fetch(urlCheck.normalizedUrl!);
  if (!response.ok) {
    throw new Error(`Could not fetch official source ${url}: HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "text/html";
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  const prompt = `You are extracting structured scheme information from an authentic Indian government scheme webpage or document.
Extract only explicit facts present in the source text.
Return a JSON object with a "schemes" array.
For each scheme, extract:
- title (exact scheme title)
- category (Income Support, Crop Insurance, Credit & Loans, Mechanization, Infrastructure, General)
- description (summary of scheme)
- eligibility_criteria (json object with target_groups, crops, max_land_hectares, exclusions, documents)
- benefits (financial or material benefit details)
- official_link (official portal link if present in text)
- official_apply_url (direct application URL if explicitly present in document text)
- application_method (online, offline, CSC portal)
- application_deadline (YYYY-MM-DD if explicitly present, otherwise null)
- source_updated_at (ISO timestamp if document explicitly shows revision date, otherwise null)

CRITICAL SAFETY INSTRUCTIONS:
- DO NOT invent missing application URLs or fake deadlines.
- If an official application URL is not explicitly present in the text, set official_apply_url to null.
- Every record source_url MUST be: ${urlCheck.normalizedUrl}.`;

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: contentType.includes("pdf") ? "application/pdf" : "text/html", data: btoa(binary) } },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json", temperature: 0 },
      }),
    }
  );

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    throw new Error(`Gemini parsing failed for ${url}: ${errText}`);
  }

  const result = await geminiResponse.json();
  const content = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  try {
    const parsedJson = JSON.parse(content);
    return Array.isArray(parsedJson.schemes) ? parsedJson.schemes : [];
  } catch (err) {
    console.error(`[Sync] JSON parse error from Gemini response for ${url}:`, err);
    return [];
  }
}

serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const metrics: SyncMetrics = {
    checked: 0,
    unchanged: 0,
    updated: 0,
    stale_marked: 0,
    failed: 0,
    skipped_untrusted: 0,
    invalid_application_url: 0,
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey || !geminiApiKey) {
      throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GEMINI_API_KEY are required");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const sourceUrlsList = getOfficialSourceUrls();

    for (const sourceUrl of sourceUrlsList) {
      metrics.checked += 1;
      try {
        const extractedSchemes = await parseOfficialSource(sourceUrl, geminiApiKey, metrics);

        for (const rawScheme of extractedSchemes) {
          if (!rawScheme.title || typeof rawScheme.title !== "string" || !rawScheme.title.trim()) continue;

          // Check if scheme already exists in database
          const { data: existingRow, error: fetchErr } = await supabase
            .from("government_schemes")
            .select("*")
            .eq("title", rawScheme.title.trim())
            .maybeSingle();

          if (fetchErr) {
            console.error(`[Sync] Database lookup error for ${rawScheme.title}:`, fetchErr);
            metrics.failed += 1;
            continue;
          }

          // Validate official_apply_url independently against TRUSTED_GOVERNMENT_HOSTS
          if (rawScheme.official_apply_url) {
            const applyUrlCheck = validateTrustedGovernmentUrl(rawScheme.official_apply_url);
            if (!applyUrlCheck.valid) {
              console.warn(`[Sync] Rejected unverified official_apply_url "${rawScheme.official_apply_url}" for ${rawScheme.title}: ${applyUrlCheck.reason}`);
              metrics.invalid_application_url += 1;
              rawScheme.official_apply_url = undefined; // Strip unverified apply URL
            }
          }

          // Compute deterministic content hash of incoming fields
          const incomingHash = computeContentHash({
            title: rawScheme.title,
            category: rawScheme.category,
            description: rawScheme.description,
            benefits: rawScheme.benefits,
            eligibility_criteria: rawScheme.eligibility_criteria,
            official_link: rawScheme.official_link,
            official_apply_url: rawScheme.official_apply_url,
            application_method: rawScheme.application_method,
            application_deadline: rawScheme.application_deadline,
          });

          // Zero-work change detection: if source_hash matches, update source_checked_at timestamp ONLY
          if (existingRow && existingRow.source_hash === incomingHash) {
            await supabase
              .from("government_schemes")
              .update({
                source_checked_at: new Date().toISOString(),
                // Keep status verified or upgrade stale if currently stale
                verification_status: existingRow.verification_status === "stale" ? "verified" : (existingRow.verification_status || "verified"),
              })
              .eq("id", existingRow.id);

            metrics.unchanged += 1;
            continue;
          }

          // Perform fail-safe field-level merging covering ALL mutable fields
          const mergedRecord = mergeSchemeFields(existingRow, {
            ...rawScheme,
            source_url: sourceUrl,
            source_type: "official_government",
            source_hash: incomingHash,
          });

          // Upsert merged record safely
          const { error: upsertErr } = await supabase
            .from("government_schemes")
            .upsert(mergedRecord, { onConflict: "title" });

          if (upsertErr) {
            console.error(`[Sync] Fail-safe upsert error for ${rawScheme.title}:`, upsertErr);
            metrics.failed += 1;
          } else {
            metrics.updated += 1;
          }
        }
      } catch (err: any) {
        console.error(`[Sync] Failed processing source ${sourceUrl}:`, err);
        // Preservation rule: network/fetch errors do NOT modify existing DB records or reset source_checked_at!
        metrics.failed += 1;
      }
    }

    // Execute stale transition pass: mark verified records older than 30 days as stale
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: staleRows, error: staleErr } = await supabase
      .from("government_schemes")
      .update({ verification_status: "stale" })
      .eq("verification_status", "verified")
      .lt("source_checked_at", thirtyDaysAgo)
      .select("id");

    if (!staleErr && Array.isArray(staleRows)) {
      metrics.stale_marked = staleRows.length;
    }

    console.log("[Sync] Completed government schemes sync run:", metrics);

    return new Response(
      JSON.stringify({
        success: true,
        metrics,
        completed_at: new Date().toISOString(),
      }),
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Sync] Fatal sync error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Scheme sync failed",
        metrics,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
